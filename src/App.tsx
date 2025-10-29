// src/App.tsx

import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import LoginPage from './pages/LoginPage';
import PrestadorListPage from './pages/PrestadorListPage'; // Ruta de prueba si está logueado

function App() {

  // Usamos los nombres correctos del store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated); 
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]); 
  
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1>Cargando...</h1>
      </div>
    );
  }
  
  if (!isAuthenticated) { 
    return <LoginPage />;
  }
  
  return (
    <PrestadorListPage /> 
  );
}

export default App;