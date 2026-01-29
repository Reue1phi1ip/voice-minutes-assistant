import { clsx } from "clsx";
import React from "react";

export function Card({
  children,
  className,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <section className={clsx("rounded-2xl border bg-white p-5 shadow-sm", className)}>
      {children}
    </section>
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-800"
      : variant === "secondary"
      ? "border hover:bg-zinc-50"
      : "hover:bg-zinc-50";

  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50",
        styles,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
