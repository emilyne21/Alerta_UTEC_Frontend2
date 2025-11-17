// src/components/layout/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  Clock, 
  FolderOpen,
  History,
  X,
  LucideIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { UserRole } from '@/utils/types';
import { getCurrentUser } from '@/mocks/usuarios';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const supervisorNavItems: NavItem[] = [
  { path: '/supervisor', label: 'Panel', icon: LayoutDashboard, roles: ['supervisor', 'admin'] },
  { path: '/supervisor/reportes', label: 'Reportes', icon: FileText, roles: ['supervisor', 'admin'] },
  { path: '/supervisor/historial', label: 'Historial', icon: History, roles: ['supervisor', 'admin'] },
];

const workerNavItems: NavItem[] = [
  { path: '/trabajador', label: 'Mi Panel', icon: LayoutDashboard, roles: ['trabajador'] },
  { path: '/trabajador/pendientes', label: 'Cola de Pendientes', icon: Clock, roles: ['trabajador'] },
  { path: '/trabajador/mis-casos', label: 'Mis Casos', icon: FolderOpen, roles: ['trabajador'] },
  { path: '/trabajador/historial', label: 'Historial', icon: History, roles: ['trabajador'] },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const currentUser = getCurrentUser();
  const userRole = currentUser?.rol || 'trabajador';

  const navItems = userRole === 'supervisor' || userRole === 'admin' 
    ? supervisorNavItems 
    : workerNavItems;

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-[50] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:static inset-y-0 left-0 z-30 w-64 border-r transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        style={{ 
          backgroundColor: '#132436',
          borderColor: '#9C90FC',
        }}
      >
        <div className="flex items-center justify-between p-4 border-b lg:hidden" style={{ borderColor: '#9C90FC' }}>
          <span className="font-semibold" style={{ color: '#F2ECEC' }}>Menú</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: '#F2ECEC' }}
            aria-label="Cerrar menú"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Cerrar sidebar en mobile al hacer clic
                  if (window.innerWidth < 1024) {
                    onClose();
                  }
                }}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative',
                    isActive
                      ? 'font-medium'
                      : 'hover:opacity-80'
                  )
                }
              >
                {({ isActive }) => (
                  <div 
                    className="flex items-center gap-3 w-full"
                    style={{
                      backgroundColor: isActive ? '#9C90FC' : 'transparent',
                      color: isActive ? '#132436' : '#F2ECEC',
                    }}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t" style={{ borderColor: '#9C90FC' }}>
          <div className="px-4 py-2 text-xs" style={{ color: '#F2ECEC' }}>
            <p className="font-medium mb-1" style={{ color: '#F2ECEC' }}>Rol actual</p>
            <p className="capitalize">{userRole}</p>
            {currentUser?.rol === 'trabajador' && currentUser?.area && (
              <p className="font-medium mt-1 capitalize" style={{ color: '#9C90FC' }}>
                Área: {currentUser.area === 'TI' ? 'TI' : currentUser.area === 'limpieza' ? 'Limpieza' : 'Seguridad'}
              </p>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

