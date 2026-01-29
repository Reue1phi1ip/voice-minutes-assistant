"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import NotesList from "./NotesList";

export default function NotesPanel() {
  const notes = useQuery(api.notes.listNotes);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!notes) return notes;
    const query = q.trim().toLowerCase();
    if (!query) return notes;

    return notes.filter((n: any) => {
      const hay = [
        n.summary?.title,
        n.transcript,
        ...(n.summary?.tags ?? []),
        ...(n.summary?.namesOrCompanies ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(query);
    });
  }, [notes, q]);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <p className="text-sm text-zinc-600">
            Notes persist in Convex. Status updates in realtime.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <label className="text-xs text-zinc-600">Search</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="title, tag, name, transcript…"
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-200"
          />
        </div>
      </div>

      <div className="mt-4">
        <NotesList notes={filtered} />
      </div>
    </div>
  );
}
