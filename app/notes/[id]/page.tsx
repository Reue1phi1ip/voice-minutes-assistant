"use client";

import StatusBadge from "@/components/StatusBadge";
import NoteDetailView from "@/components/NoteDetailView";
import { api } from "@/convex/_generated/api";
import { useQuery, useAction } from "convex/react";
import { useParams, useRouter } from "next/navigation";

export default function NotePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const note = useQuery(api.notes.getNote, { id: params.id as any });
  const processNote = useAction(api.processNote.processNote);

  if (note === undefined) {
    return <div className="text-sm text-zinc-600">Loading…</div>;
  }

  if (note === null) {
    return (
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="text-sm text-zinc-600">Note not found.</div>
        <button
          className="mt-3 rounded-xl border px-3 py-2 text-sm hover:bg-zinc-50"
          onClick={() => router.push("/")}
        >
          Back
        </button>
      </div>
    );
  }

  const canRetry = note.status === "Failed";

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-lg font-semibold">{note.summary?.title ?? "Untitled"}</div>
            <div className="text-sm text-zinc-600">
              {new Date(note.createdAt).toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={note.status} />
            {canRetry && (
              <button
                className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                onClick={() => void processNote({ id: note._id })}
              >
                Retry processing
              </button>
            )}
          </div>
        </div>

        {note.status === "Failed" && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <div className="font-medium">Processing failed</div>
            <div className="mt-1 opacity-90">{note.error ?? "Unknown error"}</div>
          </div>
        )}
      </div>

      <NoteDetailView note={note} />
    </div>
  );
}
