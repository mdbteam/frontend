// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import './index.css';

import { AppLayout } from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import PrestadorListPage from './pages/PrestadorListPage';
import PrestadorProfilePage from './pages/PrestadorProfilePage';

const router = createBrowserRouter([
  {
    element: <AppLayout><Outlet /></AppLayout>,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/prestadores", element: <PrestadorListPage /> },
      { path: "/perfil/:prestadorId", element: <PrestadorProfilePage /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);