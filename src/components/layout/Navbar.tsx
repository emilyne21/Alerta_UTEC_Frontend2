// src/components/layout/Navbar.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Menu } from 'lucide-react';
import { getCurrentUser, setCurrentUser } from '@/mocks/usuarios';
import socketService from '@/services/socket';
import alertaIcon from '@/assets/alerta.png';

interface NavbarProps {
  onMenuClick?: () => void;
  onSearch?: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // NOTE: Aquí se integraría la búsqueda real
    onSearch?.(searchQuery);
  };

  const handleLogout = () => {
    // Desconectar WebSocket si está conectado
    if (socketService.isConnected()) {
      socketService.disconnect();
    }
    
    // Limpiar token del localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    
    // Limpiar usuario del localStorage
    localStorage.removeItem('user');
    
    // Limpiar usuario del estado
    setCurrentUser(null);
    
    // Cerrar el menú de usuario
    setShowUserMenu(false);
    
    // Redirigir al login
    navigate('/login');
  };

  return (
    <nav className="border-b px-4 py-3 flex items-center justify-between sticky top-0 z-40" style={{ backgroundColor: '#132436', borderColor: '#9C90FC' }}>
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: '#F2ECEC' }}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#E05A29' }}>
            <img 
              src={alertaIcon} 
              alt="Alerta UTEC" 
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="font-semibold hidden sm:inline" style={{ color: '#F2ECEC' }}>Alerta UTEC</span>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md ml-4 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2" size={18} style={{ color: '#9C90FC' }} />
            <input
              type="text"
              placeholder="Buscar incidentes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ 
                borderColor: '#9C90FC',
                backgroundColor: '#F2ECEC',
                '--tw-ring-color': '#9C90FC',
              } as React.CSSProperties}
              aria-label="Buscar incidentes"
            />
          </div>
        </form>
      </div>

      <div className="flex items-center gap-3">
        <button
          className="relative p-2 rounded-lg transition-colors hover:opacity-80"
          style={{ color: '#F2ECEC' }}
          aria-label="Notificaciones"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#E05A29' }}></span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: '#F2ECEC' }}
            aria-label="Menú de usuario"
            aria-expanded={showUserMenu}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#9C90FC' }}>
              <User size={16} style={{ color: '#132436' }} />
            </div>
            <span className="hidden sm:inline text-sm font-medium" style={{ color: '#F2ECEC' }}>
              {currentUser?.nombre || 'Usuario'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border py-1 z-50" style={{ backgroundColor: '#F2ECEC', borderColor: '#9C90FC' }}>
              <div className="px-4 py-2 border-b" style={{ borderColor: '#9C90FC' }}>
                <p className="text-sm font-medium" style={{ color: '#132436' }}>{currentUser?.nombre}</p>
                <p className="text-xs" style={{ color: '#132436', opacity: 0.7 }}>{currentUser?.email}</p>
                {currentUser?.rol === 'trabajador' && currentUser?.area && (
                  <p className="text-xs mt-1 font-medium" style={{ color: '#E05A29' }}>
                    Área: {currentUser.area === 'TI' ? 'TI' : currentUser.area === 'limpieza' ? 'Limpieza' : 'Seguridad'}
                  </p>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors hover:opacity-80"
                style={{ color: '#132436' }}
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};


