export default function Settings() {
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold">Settings</h2>
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
        <ul className="space-y-2 text-sm">
          <li>Profile & Timezone</li>
          <li>Notification preferences</li>
          <li>Travel mode</li>
          <li>Backup & Sync</li>
          <li>Privacy & Consents</li>
        </ul>
      </div>
    </div>
  )
}

