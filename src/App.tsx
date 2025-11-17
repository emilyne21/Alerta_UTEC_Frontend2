// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { setCurrentUser } from './mocks/usuarios';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { SupervisorDashboard } from './pages/supervisor/SupervisorDashboard';
import { SupervisorReports } from './pages/supervisor/SupervisorReports';
import { SupervisorHistory } from './pages/supervisor/SupervisorHistory';
import { WorkerDashboard } from './pages/worker/WorkerDashboard';
import { PendingQueue } from './pages/worker/PendingQueue';
import { MyCases } from './pages/worker/MyCases';
import { WorkerHistory } from './pages/worker/WorkerHistory';
import { SearchResults } from './pages/SearchResults';
import { NotFound } from './pages/NotFound';

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
          path="/supervisor/historial"
          element={
            <ProtectedRoute>
              <SupervisorHistory />
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

        {/* Ruta de búsqueda */}
        <Route
          path="/buscar"
          element={
            <ProtectedRoute>
              <SearchResults />
            </ProtectedRoute>
          }
        />

        {/* Ruta 404 */}
        <Route
          path="/404"
          element={
            <ProtectedRoute>
              <NotFound />
            </ProtectedRoute>
          }
        />

        {/* Ruta por defecto */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;



