// src/components/layout/AppLayout.tsx
import { useState } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer, useToast } from '../common/Toast';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Exponer showToast globalmente para uso en componentes hijos
  // NOTE: En producción, usar Context API o estado global
  (window as any).showToast = showToast;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F2ECEC' }}>
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:ml-0 p-4 lg:p-6">
          {children}
        </main>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};



