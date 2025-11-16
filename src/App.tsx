// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser, setCurrentUser } from './mocks/usuarios';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
import { SupervisorReports } from './pages/supervisor/SupervisorReports';
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { PendingQueue } from './pages/worker/PendingQueue';
import { MyCases } from './pages/worker/MyCases';

// Páginas placeholder
const SupervisorUsers = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
    <p className="text-gray-600">Vista de usuarios (UI placeholder)</p>
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-blue-800">
        Esta página está en construcción. Aquí se mostraría la gestión de usuarios.
      </p>
    </div>
  </div>
);

const SupervisorConfig = () => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
    <p className="text-gray-600">Configuración del sistema (UI placeholder)</p>
    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-sm text-blue-800">
        Esta página está en construcción. Aquí se mostraría la configuración del sistema.
      </p>
    </div>
  </div>
);

// WorkerHistory: página de historial sin ID específico
// Redirige a una página de selección o muestra mensaje
const WorkerHistory = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Historial</h1>
      <p className="text-gray-600 mb-6">
        Selecciona un incidente para ver su historial completo desde el panel de detalle.
      </p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          Para ver el historial de un incidente, abre el panel de detalle y haz clic en "Ver historial completo".
        </p>
      </div>
    </div>
  );
};

// Componente de protección de rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Verificar token primero
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  
  // Si no hay token, redirigir inmediatamente
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Intentar obtener usuario del localStorage
  let user = null;
  const userStr = localStorage.getItem('user');
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // Si hay error parseando, intentar decodificar del token
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          user = {
            id: payload.id || payload._id || `user-${Date.now()}`,
            nombre: payload.nombre || payload.name || payload.email || 'Usuario',
            email: payload.email,
            rol: payload.rol || payload.role || 'trabajador',
            ...(payload.area && { area: payload.area }),
          };
          // Guardar el usuario decodificado
          localStorage.setItem('user', JSON.stringify(user));
          setCurrentUser(user);
        }
      } catch (tokenError) {
        console.error('Error decodificando token:', tokenError);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        return <Navigate to="/login" replace />;
      }
    }
  } else {
    // Si no hay usuario en localStorage pero hay token, decodificar del token
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        user = {
          id: payload.id || payload._id || `user-${Date.now()}`,
          nombre: payload.nombre || payload.name || payload.email || 'Usuario',
          email: payload.email,
          rol: payload.rol || payload.role || 'trabajador',
          ...(payload.area && { area: payload.area }),
        };
        // Guardar el usuario decodificado
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error decodificando token:', error);
      return <Navigate to="/login" replace />;
    }
  }

  // Si después de todo no hay usuario, redirigir
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppLayout>{children}</AppLayout>;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rutas de Supervisor */}
        <Route
          path="/supervisor"
          element={
            <ProtectedRoute>
              <SupervisorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/reportes"
          element={
            <ProtectedRoute>
              <SupervisorReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/usuarios"
          element={
            <ProtectedRoute>
              <SupervisorUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supervisor/config"
          element={
            <ProtectedRoute>
              <SupervisorConfig />
            </ProtectedRoute>
          }
        />

        {/* Rutas de Trabajador */}
        <Route
          path="/trabajador"
          element={
            <ProtectedRoute>
              <WorkerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabajador/pendientes"
          element={
            <ProtectedRoute>
              <PendingQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabajador/mis-casos"
          element={
            <ProtectedRoute>
              <MyCases />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trabajador/historial"
          element={
            <ProtectedRoute>
              <WorkerHistory />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



