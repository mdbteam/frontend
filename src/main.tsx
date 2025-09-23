// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import PrestadorListPage from './pages/PrestadorListPage';
import PrestadorProfilePage from './pages/PrestadorProfilePage';

const router = createBrowserRouter([
  {
    path: "/", 
    element: <PrestadorListPage />,
  },
  {
    path: "/perfil/:prestadorId", 
    element: <PrestadorProfilePage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {}
    <RouterProvider router={router} />
  </React.StrictMode>
);