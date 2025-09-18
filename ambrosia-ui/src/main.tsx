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
import PrnMeds from './pages/PrnMeds.tsx'
import NotFound from './pages/NotFound.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Today /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'meds', element: <Meds /> },
      { path: 'prn', element: <PrnMeds /> },
      { path: 'add', element: <Add /> },
      { path: 'log', element: <Log /> },
      { path: 'settings', element: <Settings /> },
      { path: '*', element: <NotFound /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
