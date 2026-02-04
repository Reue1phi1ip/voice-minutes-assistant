import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getNoteForProcessing = internalQuery({
  args: { id: v.id("notes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const setStatus = internalMutation({
  args: {
    id: v.id("notes"),
    status: v.union(
      v.literal("Uploaded"),
      v.literal("Processing"),
      v.literal("Ready"),
      v.literal("Failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
      error: args.error,
    });
  },
});

export const saveResults = internalMutation({
  args: {
    id: v.id("notes"),
    transcript: v.string(),
    summary: v.object({
  title: v.string(),
  keyPoints: v.array(v.string()),
  actionItems: v.array(v.string()),
  namesOrCompanies: v.array(v.string()),
  tags: v.array(v.string()),

  confidence: v.union(v.literal("high"), v.literal("low")),
  needsMoreAudio: v.boolean(),
  reason: v.optional(v.string()),
}),
    spokenAudioStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      transcript: args.transcript,
      summary: args.summary,
      spokenAudioStorageId: args.spokenAudioStorageId,
      status: "Ready",
      error: undefined,
    });
  },
});
