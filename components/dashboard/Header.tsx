import { Wallet } from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Wallet className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h1 className="text-base font-bold leading-none">Expense Tracker</h1>
            <p className="text-xs text-slate-500">Personal finance, at a glance</p>
          </div>
        </div>
      </div>
    </header>
  );
}
