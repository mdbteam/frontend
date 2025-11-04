import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from "sonner"

import './index.css'
import { AppLayout } from './components/layout/AppLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserProfilePage from './pages/UserProfilePage'
import ProviderApplicationPage from './pages/ProviderApplicationPage'
import PrestadorListPage from './pages/PrestadorListPage'
import PrestadorDetailPage from './pages/PrestadorDetailPage'
import ProviderCalendarPage from './pages/ProviderCalendarPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'


const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/registro', element: <RegisterPage /> },
      { path: '/perfil', element: <UserProfilePage /> },
      { path: '/postular', element: <ProviderApplicationPage /> },
      { path: '/prestadores', element: <PrestadorListPage /> },
      { path: '/prestadores/:id', element: <PrestadorDetailPage /> },
      { path: '/calendario', element: <ProviderCalendarPage /> },
      { path: '/administrador', element: <AdminDashboardPage /> },
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />

      <Toaster
        position="top-center"
        richColors
        toastOptions={{
          classNames: {
            toast:
              "rounded-xl border shadow-lg backdrop-blur-md border-yellow-300 data-[type=success]:border-green-400 data-[type=error]:border-red-500 data-[type=warning]:border-amber-400 animate-[buzz_0.4s_ease-in-out]",
            title: "font-semibold",
            closeButton:
              "bg-yellow-400 hover:bg-yellow-500 text-black rounded-full",
          },
        }}
      />
    </QueryClientProvider>
  </React.StrictMode>
)
