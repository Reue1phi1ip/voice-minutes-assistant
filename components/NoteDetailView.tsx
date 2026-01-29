import { Card } from "./ui";

export default function NoteDetailView({ note }: { note: any }) {
  return (
    <div className="grid gap-4">
      <Card>
        <div className="text-sm font-semibold">Original audio</div>
        <div className="mt-2">
          {note.audioUrl ? (
            <audio className="w-full" controls src={note.audioUrl} />
          ) : (
            <div className="text-sm text-zinc-600">Audio not available yet.</div>
          )}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Transcript</div>
        <div className="mt-2 whitespace-pre-wrap text-sm text-zinc-800">
          {note.transcript ?? "Not ready yet."}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">Structured minutes</div>

        {!note.summary ? (
          <div className="mt-2 text-sm text-zinc-600">Not ready yet.</div>
        ) : (
          <div className="mt-3 grid gap-4">
            {note.summary?.needsMoreAudio && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <div className="font-medium">Audio unclear</div>
                <div className="mt-1 opacity-90">
                  {note.summary.reason ?? "Please record again with clearer speech (20–60 seconds)."}
                </div>
              </div>
            )}

            <div>
              <div className="text-xs font-medium text-zinc-600">Key points</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                {note.summary.keyPoints.map((p: string, i: number) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-medium text-zinc-600">Action items</div>
              {note.summary.actionItems.length === 0 ? (
                <div className="mt-2 text-sm text-zinc-600">None</div>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {note.summary.actionItems.map((p: string, i: number) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-zinc-600">Names / Companies</div>
                <div className="mt-2 text-sm">
                  {(note.summary.namesOrCompanies ?? []).join(", ") || "—"}
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-zinc-600">Tags</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(note.summary.tags ?? []).map((t: string, i: number) => (
                    <span
                      key={i}
                      className="rounded-full border bg-zinc-50 px-2.5 py-1 text-xs"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <div className="text-sm font-semibold">Spoken summary</div>
        <div className="mt-2">
          {note.summary?.needsMoreAudio ? (
              <div className="text-sm text-zinc-600">Not available (audio unclear).</div>
            ) : note.spokenUrl ? (
              <audio className="w-full" controls src={note.spokenUrl} />
            ) : (
              <div className="text-sm text-zinc-600">Not ready yet.</div>
            )}
        </div>
      </Card>
    </div>
  );
}
