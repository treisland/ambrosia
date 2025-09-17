export default function Add() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Add Medication</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <button className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60">Scan Barcode</button>
        <button className="rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900/60">Import Rx</button>
      </div>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
        <input className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent px-3 py-2 text-sm" placeholder="Search or type name" />
      </div>
    </div>
  )
}

