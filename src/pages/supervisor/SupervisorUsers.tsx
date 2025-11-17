// src/pages/supervisor/SupervisorUsers.tsx
import { useState, useEffect } from 'react';
import { User, WorkerArea } from '@/utils/types';
import apiClient from '@/services/api';
import { Loader2, User as UserIcon, Mail, Briefcase, Search } from 'lucide-react';

export const SupervisorUsers = () => {
  const [trabajadores, setTrabajadores] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Cargar trabajadores del backend
  useEffect(() => {
    const fetchWorkers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Intentar obtener usuarios/trabajadores desde el endpoint
        const response = await apiClient.get('/usuarios');
        
        // Verificar si la respuesta es un array o está dentro de un objeto
        let usersData = response.data;
        if (!Array.isArray(usersData)) {
          if (usersData.data && Array.isArray(usersData.data)) {
            usersData = usersData.data;
          } else if (usersData.usuarios && Array.isArray(usersData.usuarios)) {
            usersData = usersData.usuarios;
          } else if (usersData.users && Array.isArray(usersData.users)) {
            usersData = usersData.users;
          } else if (usersData.trabajadores && Array.isArray(usersData.trabajadores)) {
            usersData = usersData.trabajadores;
          } else {
            setError('Formato de respuesta inesperado del servidor');
            setIsLoading(false);
            return;
          }
        }
        
        // Normalizar los datos del backend al formato esperado
        const users = usersData.map((user: any, index: number) => {
          try {
            return {
              id: user.id || user._id || `user-${index}-${Date.now()}`,
              nombre: user.nombre || user.name || user.nombre_completo || '',
              email: user.email || '',
              rol: (user.rol || user.role || 'trabajador') as User['rol'],
              area: user.area ? (user.area as WorkerArea) : undefined,
              avatar: user.avatar || user.foto || undefined,
            };
          } catch (mapError) {
            console.error(`Error mapping user at index ${index}:`, mapError, user);
            return null;
          }
        }).filter((user: User | null) => user !== null) as User[];
        
        // Filtrar solo trabajadores
        const workers = users.filter((user) => user.rol === 'trabajador');
        setTrabajadores(workers);
      } catch (err: any) {
        console.error('Error al cargar trabajadores:', err);
        // Si el endpoint no existe, intentar con /trabajadores
        try {
          const response = await apiClient.get('/trabajadores');
          let workersData = response.data;
          if (!Array.isArray(workersData)) {
            if (workersData.data && Array.isArray(workersData.data)) {
              workersData = workersData.data;
            } else if (workersData.trabajadores && Array.isArray(workersData.trabajadores)) {
              workersData = workersData.trabajadores;
            }
          }
          
          const workers = workersData.map((user: any, index: number) => ({
            id: user.id || user._id || `user-${index}-${Date.now()}`,
            nombre: user.nombre || user.name || user.nombre_completo || '',
            email: user.email || '',
            rol: 'trabajador' as const,
            area: user.area ? (user.area as WorkerArea) : undefined,
            avatar: user.avatar || user.foto || undefined,
          })).filter((user: User) => user !== null) as User[];
          
          setTrabajadores(workers);
        } catch (secondErr) {
          setError('No se pudieron cargar los trabajadores. Por favor intenta más tarde.');
          if ((window as any).showToast) {
            (window as any).showToast('error', 'Error al cargar los trabajadores');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // Filtrar trabajadores por término de búsqueda
  const filteredWorkers = trabajadores.filter((worker) => {
    const search = searchTerm.toLowerCase();
    return (
      worker.nombre.toLowerCase().includes(search) ||
      worker.email.toLowerCase().includes(search) ||
      (worker.area && worker.area.toLowerCase().includes(search))
    );
  });

  const areaLabels: Record<WorkerArea, string> = {
    TI: 'Tecnología de la Información',
    limpieza: 'Limpieza',
    mantenimiento: 'Mantenimiento',
    seguridad: 'Seguridad',
    administracion: 'Administración',
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
        <p className="text-gray-600">Lista de todos los trabajadores del sistema</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Cargando trabajadores...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600">
            {searchTerm ? 'No se encontraron trabajadores con ese criterio de búsqueda' : 'No hay trabajadores registrados'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trabajador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Área
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkers.map((worker) => (
                  <tr key={worker.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {worker.avatar ? (
                          <img
                            src={worker.avatar}
                            alt={worker.nombre}
                            className="h-10 w-10 rounded-full object-cover mr-3"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                            <UserIcon className="h-6 w-6 text-primary-600" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{worker.nombre}</div>
                          <div className="text-sm text-gray-500">ID: {worker.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        {worker.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                        {worker.area ? areaLabels[worker.area] || worker.area : 'Sin área asignada'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Resumen */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {filteredWorkers.length} de {trabajadores.length} trabajadores
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

