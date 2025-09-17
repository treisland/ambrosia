export default function Log() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Dose Log</h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">Today</div>
        <ul className="mt-2 space-y-2 text-sm">
          <li>✓ 8:01 AM Metformin 500 mg</li>
          <li>○ 12:00 PM Lisinopril 20 mg</li>
        </ul>
      </div>
    </div>
  )
}

