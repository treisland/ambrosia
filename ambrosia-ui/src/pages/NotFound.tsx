export default function NotFound() {
  return (
    <div className="mx-auto max-w-sm text-center space-y-4">
      <div className="text-3xl">🧭</div>
      <h2 className="text-base font-semibold">Page not found</h2>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        We couldn't find that page. Try the calendar or today view.
      </p>
      <div className="flex items-center justify-center gap-2">
        <a href="/calendar" className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-500">Calendar</a>
        <a href="/" className="rounded-md border border-zinc-300 dark:border-zinc-700 px-3 py-2 text-sm">Today</a>
      </div>
    </div>
  )
}

