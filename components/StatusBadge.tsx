import { clsx } from "clsx";

export default function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Ready"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : status === "Processing"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : status === "Failed"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-zinc-200 bg-zinc-50 text-zinc-700";

  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        styles
      )}
    >
      {status}
    </span>
  );
}
