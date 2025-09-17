import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppShell from './App.tsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Today from './pages/Today.tsx'
import Meds from './pages/Meds.tsx'
import Add from './pages/Add.tsx'
import Log from './pages/Log.tsx'
import Settings from './pages/Settings.tsx'
import CalendarPage from './pages/Calendar.tsx'

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <Today /> },
      { path: '/calendar', element: <CalendarPage /> },
      { path: '/meds', element: <Meds /> },
      { path: '/add', element: <Add /> },
      { path: '/log', element: <Log /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
