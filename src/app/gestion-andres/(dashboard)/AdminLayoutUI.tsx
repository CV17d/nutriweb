'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayoutUI({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error cerrando sesión:', err);
    } finally {
      window.location.href = '/gestion-andres/login';
    }
  };

  // Monitor de inactividad de 2 horas e interceptor de 401 en el cliente
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const INACTIVITY_LIMIT_MS = 2 * 60 * 60 * 1000; // 2 horas (consistente con el backend)

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        window.location.href = '/gestion-andres/login?reason=inactivity';
      }, INACTIVITY_LIMIT_MS);
    };

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetTimer));
    resetTimer();

    // Interceptar fetch para detectar respuestas 401 (sesión expirada en servidor)
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401 && !window.location.pathname.startsWith('/gestion-andres/login')) {
        window.location.href = '/gestion-andres/login?reason=expired';
      }
      return response;
    };

    return () => {
      clearTimeout(timeoutId);
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetTimer));
      window.fetch = originalFetch;
    };
  }, []);

  const navLinks = [
    { name: 'Dashboard', href: '/gestion-andres', icon: 'dashboard' },
    { name: 'Control de Pacientes', href: '/gestion-andres/patients', icon: 'person' },
    { name: 'Gestión de Planes', href: '/gestion-andres/plans', icon: 'list_alt' },
    { name: 'Contenido y Testimonios', href: '/gestion-andres/content', icon: 'article' },
    { name: 'Gestión de Imágenes', href: '/gestion-andres/images', icon: 'image' },
  ];

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md antialiased min-h-screen flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`w-64 bg-surface-container-lowest border-r border-outline-variant/30 flex flex-col h-screen fixed md:relative z-40 sidebar-transition ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="p-6 flex items-center justify-end md:hidden">
          <button onClick={toggleSidebar} className="text-on-surface-variant p-2 rounded-full hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                prefetch={false}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-DEFAULT transition-colors font-medium ${
                  isActive 
                    ? 'bg-primary-container text-on-primary font-bold' 
                    : 'text-on-surface-variant hover:bg-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined" data-weight={isActive ? "fill" : "regular"}>{link.icon}</span>
                {link.name}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 mt-auto border-t border-outline-variant/30 space-y-1">
          <Link 
            href="/" 
            replace
            prefetch={false}
            onClick={() => setIsSidebarOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-DEFAULT text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors font-medium w-full"
          >
            <span className="material-symbols-outlined">home</span>
            Ver Sitio Web
          </Link>
          <button 
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-3 px-4 py-3 rounded-DEFAULT text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors font-medium w-full text-left disabled:opacity-50 cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Top Header (Hidden on Desktop) */}
        <header className="md:hidden bg-surface-container-lowest border-b border-outline-variant/30 px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-2.5">
            <button onClick={toggleSidebar} className="text-on-surface-variant p-2 -ml-2 rounded-full hover:bg-surface-variant transition-colors" aria-label="Abrir menú">
              <span className="material-symbols-outlined">menu</span>
            </button>
            <span className="text-base font-bold text-on-surface">Panel Admin</span>
          </div>
          <Link href="/" replace className="text-xs font-semibold text-brand-electric hover:underline flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">home</span>
            Ver Sitio
          </Link>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto bg-surface-dim p-3 sm:p-4 md:p-8">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-on-surface/50 backdrop-blur-sm z-30 md:hidden transition-opacity" 
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}
