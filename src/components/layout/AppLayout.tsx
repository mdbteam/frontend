import { Outlet } from 'react-router-dom';
import { AppNavbar } from './Navbar'; 
import { AppFooter } from './AppFooter';
import  {Chatbot}  from '../chatbot/Chatbot';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-slate-100">
      <AppNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <AppFooter />
      
      <Chatbot />
    </div>
  );
}