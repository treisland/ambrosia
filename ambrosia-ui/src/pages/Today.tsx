export default function Today() {
  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
        <h2 className="text-base font-semibold">Next dose</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Metformin 500 mg • 10:00 AM • with food</p>
        <div className="mt-3 flex gap-2">
          <button className="rounded-lg bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-500">Take</button>
          <button className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm">Snooze 10m</button>
          <button className="rounded-lg border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm">Skip</button>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Upcoming</h3>
        <ul className="mt-2 space-y-2 text-sm">
          <li className="flex items-center justify-between">
            <span>Lisinopril 20 mg</span>
            <span className="text-zinc-600 dark:text-zinc-400">12:00 PM</span>
          </li>
          <li className="flex items-center justify-between">
            <span>Vitamin D 1000 IU</span>
            <span className="text-zinc-600 dark:text-zinc-400">6:00 PM</span>
          </li>
        </ul>
      </section>
    </div>
  )
}

