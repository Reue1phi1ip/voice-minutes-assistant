"use node";

import OpenAI from "openai";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { z } from "zod";

const MinutesSchema = z.object({
  title: z.string().min(1),
  keyPoints: z.array(z.string()).max(7),
  actionItems: z.array(z.string()).max(5),
  namesOrCompanies: z.array(z.string()),
  tags: z.array(z.string()).max(8),

  confidence: z.enum(["high", "low"]),
  needsMoreAudio: z.boolean(),
  reason: z.string().optional(),
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export const processNote = action({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    await ctx.runMutation(internal.internal.setStatus, {
      id: args.id,
      status: "Processing",
    });

    try {
      const note = await ctx.runQuery(internal.internal.getNoteForProcessing, {
        id: args.id,
      });
      if (!note) throw new Error("Note not found.");

      // Read audio directly from Convex storage as a Blob (no external fetch needed)
      const audioBlob = await ctx.storage.get(note.audioStorageId);
      if (!audioBlob) throw new Error("Audio blob not found in storage.");

      const audioArrayBuffer = await audioBlob.arrayBuffer();
      const audioFile = new File([audioArrayBuffer], "recording.webm", {
        type: "audio/webm",
      });

      // 1) Speech-to-text
      const transcription = await openai.audio.transcriptions.create({
        model: "whisper-1",
        file: audioFile,
      });

      const transcriptText = (transcription.text ?? "").trim();
      // --- Guardrail 1: basic transcript sanity checks ---
const words = transcriptText.split(/\s+/).filter(Boolean);
const looksTooShort = transcriptText.length < 60 || words.length < 10;

// very rough "gibberish" heuristic: too many repeated short words
const uniqueRatio = new Set(words.map(w => w.toLowerCase())).size / Math.max(words.length, 1);
const looksLowSignal = uniqueRatio < 0.35;

if (looksTooShort || looksLowSignal) {
  throw new Error(
    "Audio is too short/unclear to generate reliable minutes. Please record again (20–60s, speak clearly)."
  );
}
      if (!transcriptText) throw new Error("Transcription returned empty text.");

      // 2) Structured minutes as strict JSON schema
      const jsonSchema = {
  name: "minutes",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      title: { type: "string" },
      keyPoints: { type: "array", items: { type: "string" }, maxItems: 7 },
      actionItems: { type: "array", items: { type: "string" }, maxItems: 5 },
      namesOrCompanies: { type: "array", items: { type: "string" } },
      tags: { type: "array", items: { type: "string" }, maxItems: 8 },

      // NEW
      confidence: { type: "string", enum: ["high", "low"] },
      needsMoreAudio: { type: "boolean" },
      reason: { type: "string" },
    },
    required: [
      "title",
      "keyPoints",
      "actionItems",
      "namesOrCompanies",
      "tags",
      "confidence",
      "needsMoreAudio"
    ],
  },
};
      const minutesResp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a meeting minutes assistant. Produce concise, professional minutes. Return ONLY JSON that matches the given schema."
          },
          { role: "user", content: transcriptText }
        ],
        response_format: { type: "json_schema", json_schema: jsonSchema as any },
      });

      const minutesRaw = minutesResp.choices?.[0]?.message?.content ?? "";
      const minutesParsed = MinutesSchema.parse(JSON.parse(minutesRaw));
      // If model says low confidence, skip TTS and store as Ready with warning
if (minutesParsed.needsMoreAudio) {
  const spokenAudioStorageId = await ctx.storage.store(
    new Blob([], { type: "audio/mpeg" }) // empty placeholder
  );

  await ctx.runMutation(internal.internal.saveResults, {
    id: args.id,
    transcript: transcriptText,
    summary: minutesParsed,
    spokenAudioStorageId,
  });

  return { ok: true, lowConfidence: true };
}

      // 3) Spoken summary script (30–60 seconds)
      const spokenScriptResp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Write a 30–60 second spoken summary. Friendly and professional. No headings, no bullets."
          },
          {
            role: "user",
            content: JSON.stringify(minutesParsed)
          }
        ],
      });

      const spokenScript =
        spokenScriptResp.choices?.[0]?.message?.content?.trim() ?? "";
      if (!spokenScript) throw new Error("Failed to generate spoken script.");

      // 4) Text-to-speech (mp3)
      const speech = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: spokenScript,
      });

      const mp3ArrayBuffer = await speech.arrayBuffer();
      const spokenAudioStorageId = await ctx.storage.store(
        new Blob([mp3ArrayBuffer], { type: "audio/mpeg" })
      );

      // 5) Save results
      await ctx.runMutation(internal.internal.saveResults, {
        id: args.id,
        transcript: transcriptText,
        summary: minutesParsed,
        spokenAudioStorageId,
      });

      return { ok: true };
    } catch (err: any) {
      await ctx.runMutation(internal.internal.setStatus, {
        id: args.id,
        status: "Failed",
        error: err?.message ?? "Unknown error",
      });
      return { ok: false, error: err?.message ?? "Unknown error" };
    }
  },
});
