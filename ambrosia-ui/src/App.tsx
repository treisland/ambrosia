import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { ChatbotProvider } from './contexts/ChatbotContext'
import { NotificationProvider } from './contexts/NotificationContext'
import ChatbotWidget from './components/ChatbotWidget'
import { initializeDatabase } from './database/init'

const TABS = [
  { path: '/', label: 'Today' },
  { path: '/calendar', label: 'Calendar' },
  { path: '/meds', label: 'Meds' },
  { path: '/prn', label: 'PRN' },
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
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    initializeDatabase().then(() => {
      setDbInitialized(true)
    }).catch(console.error)

    // Register service worker for notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration)
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error)
        })
    }
  }, [])

  if (!dbInitialized) {
    return (
      <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <ChatbotProvider>
      <NotificationProvider>
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
            <ul className="mx-auto max-w-screen-md grid grid-cols-6">
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
      </NotificationProvider>
    </ChatbotProvider>
  )
}

export default AppShell
