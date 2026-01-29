"use client";

import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Mic, Square, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "./ui";

export default function Recorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const generateUploadUrl = useMutation(api.notes.generateUploadUrl);
  const createNote = useMutation(api.notes.createNote);
  const processNote = useAction(api.processNote.processNote);

  const previewUrl = useMemo(() => {
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }, [blob]);

  async function start() {
    setError(null);
    setBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const recordedBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        setBlob(recordedBlob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch (e: any) {
      setError(e?.message ?? "Microphone permission denied.");
    }
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function submit() {
    if (!blob || isRecording) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // 1) Get Convex upload URL
      const uploadUrl = await generateUploadUrl();

      // 2) Upload blob to Convex storage
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": blob.type },
        body: blob,
      });
      if (!res.ok) throw new Error("Upload failed.");
      const { storageId } = await res.json();

      // 3) Create note doc
      const noteId = await createNote({ audioStorageId: storageId });

      // 4) Trigger async processing
      void processNote({ id: noteId });

      // Clear local state
      setBlob(null);
    } catch (e: any) {
      setError(e?.message ?? "Submit failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {!isRecording ? (
          <Button onClick={() => void start()} variant="primary">
            <Mic className="h-4 w-4" />
            Start
          </Button>
        ) : (
          <Button onClick={stop} variant="secondary">
            <Square className="h-4 w-4" />
            Stop
          </Button>
        )}

        <Button
          onClick={() => void submit()}
          disabled={!blob || isRecording || isSubmitting}
          className="min-w-28"
        >
          <Upload className="h-4 w-4" />
          {isSubmitting ? "Submitting…" : "Submit"}
        </Button>

        <div className="text-xs text-zinc-600">
          Tip: record 30–90 seconds for quick demos.
        </div>
      </div>

      {previewUrl && (
        <div className="rounded-2xl border p-4">
          <div className="text-xs font-medium text-zinc-600">Preview</div>
          <audio className="mt-2 w-full" controls src={previewUrl} />
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}
    </div>
  );
}
