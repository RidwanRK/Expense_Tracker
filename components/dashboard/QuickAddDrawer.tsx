"use client";

import { X } from "lucide-react";
import QuickAddForm, { type QuickAddValues } from "./QuickAddForm";

export default function QuickAddDrawer({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: QuickAddValues) => Promise<void>;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:hidden">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
      />
      <div className="relative z-10 w-full max-h-[85vh] overflow-y-auto rounded-t-2xl border-t border-[var(--color-border)] bg-[var(--color-surface)] p-5 pb-8 shadow-xl animate-in slide-in-from-bottom">
        <div className="mb-4 flex items-center justify-between">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-slate-300 dark:bg-slate-700 absolute left-1/2 top-2 -translate-x-1/2" />
          <h3 className="text-base font-semibold">Add expense</h3>
          <button
            onClick={onClose}
            aria-label="Close quick add"
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <QuickAddForm onSubmit={onSubmit} onSuccess={onClose} />
      </div>
    </div>
  );
}
