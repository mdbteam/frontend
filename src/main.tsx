
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider} from 'react-router-dom';
import './index.css';
import { AppLayout } from './components/layout/AppLayout';


import HomePage from './pages/HomePage';
import PrestadorListPage from './pages/PrestadorListPage';
import PrestadorProfilePage from './pages/PrestadorProfilePage';
import ProviderApplicationPage from './pages/ProviderApplicationPage';
import ProviderCalendarPage from './pages/ProviderCalendarPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import UserProfilePage from './pages/UserProfilePage';

const router = createBrowserRouter([
  {
    element: <AppLayout></AppLayout>,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/prestadores", element: <PrestadorListPage /> },
      { path: "/prestadores/:prestadorId", element: <PrestadorProfilePage /> },
      { path: "/postular", element: <ProviderApplicationPage /> },
      { path: "/calendario", element: <ProviderCalendarPage /> },
      { path: "/administrador", element: <AdminDashboardPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/registro", element: <RegisterPage /> },
      { path: "/perfil", element: <UserProfilePage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);