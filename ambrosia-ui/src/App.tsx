import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChatbotProvider } from './contexts/ChatbotContext'
import ChatbotWidget from './components/ChatbotWidget'

const TABS = [
  { path: '/', label: 'Today' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/meds', label: 'Meds' },
  { path: '/log', label: 'Log' },
  { path: '/settings', label: 'Settings' },
]

function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document === 'undefined') return 'dark'
    return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('theme', theme)
    } catch {}
  }, [theme])

  return (
    <button
      className="rounded-md border border-zinc-300/20 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 bg-white/70 dark:bg-zinc-900/70 backdrop-blur hover:bg-white/90 dark:hover:bg-zinc-900/90"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  )
}

function AppShell() {
  const location = useLocation()

  return (
    <ChatbotProvider>
      <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex flex-col">
        <header className="sticky top-0 z-10 border-b border-zinc-200/50 dark:border-zinc-800/60 bg-white/70 dark:bg-zinc-950/70 backdrop-blur">
          <div className="mx-auto max-w-screen-md px-4 py-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold tracking-tight">Ambrosia</h1>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto max-w-screen-md flex-1 w-full px-4 py-4">
          <Outlet />
        </main>

        <nav className="sticky bottom-0 z-10 border-t border-zinc-200/50 dark:border-zinc-800/60 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
          <ul className="mx-auto max-w-screen-md grid grid-cols-5">
            {TABS.map(tab => {
              const active = location.pathname === tab.path
              return (
                <li key={tab.path} className="flex">
                  <Link
                    to={tab.path}
                    className={
                      'flex-1 text-center py-3 text-sm font-medium transition-colors ' +
                      (active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200')
                    }
                  >
                    {tab.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        <ChatbotWidget />
      </div>
    </ChatbotProvider>
  )
}

export default AppShell
