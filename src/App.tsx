import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrestadorListPage from './pages/PrestadorListPage';
import PrestadorDetailPage from './pages/PrestadorDetailPage';
import ProviderApplicationPage from './pages/ProviderApplicationPage';
import ProviderCalendarPage from './pages/ProviderCalendarPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import { AppLayout } from './components/layout/AppLayout';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          
          <Route path="/" element={<HomePage />} />
          <Route path="/prestadores" element={<PrestadorListPage />} />
          <Route path="/prestadores/:id" element={<PrestadorDetailPage />} />
          <Route path="/perfil" element={<UserProfilePage />} />
      
          <Route path="/calendario" element={<ProviderCalendarPage />} />
          <Route path="/postular" element={<ProviderApplicationPage />} />
          <Route path="/administrador" element={<AdminDashboardPage />} />
          
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;