"use client";

import Link from "next/link";
import StatusBadge from "./StatusBadge";

export default function NotesList({ notes }: { notes: any[] | undefined }) {
  if (notes === undefined) {
    return <div className="text-sm text-zinc-600">Loading…</div>;
  }

  if (notes.length === 0) {
    return <div className="text-sm text-zinc-600">No notes yet.</div>;
  }

  return (
    <ul className="grid gap-3">
      {notes.map((n: any) => (
        <li key={n._id} className="rounded-2xl border p-4 hover:bg-zinc-50">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/notes/${n._id}`} className="font-semibold hover:underline">
                {n.displayTitle}
              </Link>
              <div className="mt-1 text-xs text-zinc-600">
                {new Date(n.createdAt).toLocaleString()}
              </div>
              {n.status === "Failed" && n.error && (
                <div className="mt-2 line-clamp-2 text-xs text-red-700">
                  {n.error}
                </div>
              )}
            </div>
            <StatusBadge status={n.status} />
          </div>
        </li>
      ))}
    </ul>
  );
}
