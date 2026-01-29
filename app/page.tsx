"use client";

import Recorder from "@/components/Recorder";
import NotesPanel from "@/components/NotesPanel";

export default function Home() {
  return (
    <div className="grid gap-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-3">
          <h1 className="text-xl font-semibold">Record a call</h1>
          <p className="text-sm text-zinc-600">
            Record in your browser, preview it, then submit to generate minutes automatically.
          </p>
        </div>
        <Recorder />
      </div>

      <NotesPanel />
    </div>
  );
}
