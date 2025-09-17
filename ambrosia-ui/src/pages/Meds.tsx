export default function Meds() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Medications</h2>
        <button className="rounded-lg bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-500">+ Add</button>
      </div>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 divide-y divide-zinc-200 dark:divide-zinc-800 shadow-sm">
        <div className="p-4">
          <div className="font-medium">Metformin 500 mg</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Twice daily • with food</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Next: 10:00 AM</div>
        </div>
        <div className="p-4">
          <div className="font-medium">Lisinopril 20 mg</div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">Daily • AM</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Next: 12:00 PM</div>
        </div>
      </div>
    </div>
  )
}

