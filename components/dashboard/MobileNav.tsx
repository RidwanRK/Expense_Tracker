"use client";

import { LayoutDashboard, ListFilter, PlusCircle } from "lucide-react";

export type MobileTab = "overview" | "transactions";

export default function MobileNav({
  active,
  onChange,
  onAdd,
}: {
  active: MobileTab;
  onChange: (tab: MobileTab) => void;
  onAdd: () => void;
}) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-2">
        <button
          onClick={() => onChange("overview")}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-xs font-medium ${
            active === "overview" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
          }`}
        >
          <LayoutDashboard className="h-5 w-5" aria-hidden />
          Overview
        </button>

        <button
          onClick={onAdd}
          aria-label="Add expense"
          className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
        >
          <PlusCircle className="h-7 w-7" aria-hidden />
        </button>

        <button
          onClick={() => onChange("transactions")}
          className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-xs font-medium ${
            active === "transactions" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"
          }`}
        >
          <ListFilter className="h-5 w-5" aria-hidden />
          Transactions
        </button>
      </div>
    </nav>
  );
}
