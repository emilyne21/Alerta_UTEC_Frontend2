// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { setCurrentUser } from '../mocks/usuarios';
import { usuarios } from '../mocks/usuarios';
import { AlertCircle, User, Shield, Sparkles, Lock, Wrench, Phone, Mail, MapPin, Loader2 } from 'lucide-react';
import { UserRole, WorkerArea } from '../utils/types';
import seguridadImage from '../assets/seguridad.png';
import alertaImage from '../assets/alerta.png';
import fondoMoradoImage from '../assets/fondo_morado-Photoroom.png';
import apiClient from '../services/api';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registrationCode, setRegistrationCode] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('trabajador');
  const [selectedArea, setSelectedArea] = useState<WorkerArea>('TI');
  const navigate = useNavigate();

  const handleQuickLogin = (userEmail: string) => {
    const user = usuarios.find((u) => u.email === userEmail);
    if (user) {
      setCurrentUser(user);
      // NOTE: En producción, aquí se haría la autenticación real
      if (user.rol === 'supervisor' || user.rol === 'admin') {
        navigate('/supervisor');
      } else {
        navigate('/trabajador');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validación básica
    if (!email.trim() || !password.trim()) {
      setError('Por favor completa todos los campos');
      setIsLoading(false);
      return;
    }

    try {
      // Petición al backend para autenticación
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      const { token, user } = response.data;

      // Guardar token en localStorage PRIMERO
      if (!token) {
        throw new Error('No se recibió token del servidor');
      }

      localStorage.setItem('token', token);
      localStorage.setItem('authToken', token); // Por compatibilidad

      // Decodificar el JWT para extraer información del usuario si no viene en la respuesta
      let userData;
      
      if (user) {
        // Si el backend envía el usuario, usarlo
        userData = {
          id: user.id || user._id || `user-${Date.now()}`,
          nombre: user.nombre || user.name || user.email,
          email: user.email,
          rol: (user.rol || user.role || 'trabajador') as UserRole,
          ...(user.area && { area: user.area as WorkerArea }),
        };
      } else {
        // Si no viene usuario, decodificar el JWT
        try {
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            userData = {
              id: payload.id || payload._id || `user-${Date.now()}`,
              nombre: payload.nombre || payload.name || payload.email || 'Usuario',
              email: payload.email,
              rol: (payload.rol || payload.role || 'trabajador') as UserRole,
              ...(payload.area && { area: payload.area as WorkerArea }),
            };
          } else {
            throw new Error('Token inválido');
          }
        } catch (error) {
          console.error('Error decodificando token:', error);
          throw new Error('No se pudo obtener la información del usuario del token');
        }
      }
      
      // Guardar usuario en estado y localStorage
      setCurrentUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Esperar un momento para asegurar que se guardó
      await new Promise(resolve => setTimeout(resolve, 100));

      // Determinar la ruta según el rol
      const userRole = userData.rol;
      const redirectPath = (userRole === 'supervisor' || userRole === 'admin') 
        ? '/supervisor' 
        : '/trabajador';
      
      // Redirigir usando window.location para forzar recarga completa
      window.location.href = redirectPath;
    } catch (err: any) {
      console.error('Error en login:', err);
      
      // Manejo de errores
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data?.error;
        
        if (status === 401) {
          setError('Credenciales inválidas. Por favor verifica tu email y contraseña.');
        } else if (status === 404) {
          setError('Usuario no encontrado.');
        } else if (status >= 500) {
          setError('Error del servidor. Por favor intenta más tarde.');
        } else {
          setError(message || 'Error al iniciar sesión. Por favor intenta nuevamente.');
        }
      } else if (err.request) {
        setError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      } else {
        setError('Error inesperado. Por favor intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    setSuccessMessage('');

    // Validaciones
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim() || !registrationCode.trim()) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (selectedRole === 'trabajador' && !selectedArea) {
      setError('Por favor selecciona un área');
      return;
    }

    if (registerPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setIsRegistering(true);

    try {
      // Petición al backend para registro
      const registerData: any = {
        email: registerEmail.trim(),
        password: registerPassword,
        nombre: registerName.trim(),
        rol: selectedRole,
        registrationCode: registrationCode.trim(),
      };

      // Si es trabajador, agregar el área
      if (selectedRole === 'trabajador') {
        registerData.area = selectedArea;
      }

      const response = await apiClient.post('/auth/register', registerData);

      // Si el registro es exitoso
      if (response.data) {
        // Cerrar modal
        setShowRegisterModal(false);
        
        // Limpiar formulario
        setRegisterName('');
        setRegisterEmail('');
        setRegisterPassword('');
        setRegistrationCode('');
        setSelectedRole('trabajador');
        setSelectedArea('TI');

        // Pre-llenar el email en el formulario de login
        setEmail(registerEmail.trim());

        // Mostrar mensaje de éxito
        setSuccessMessage('¡Registro exitoso! Ahora puedes iniciar sesión con tus credenciales.');
        
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (err: any) {
      console.error('Error en registro:', err);
      
      // Manejo de errores
      if (err.response) {
        const status = err.response.status;
        const message = err.response.data?.message || err.response.data?.error;
        
        if (status === 400) {
          setError(message || 'Datos inválidos. Por favor verifica la información.');
        } else if (status === 401) {
          setError('Código de registro inválido. Por favor verifica el código.');
        } else if (status === 409) {
          setError('Este email ya está registrado. Por favor usa otro email o inicia sesión.');
        } else if (status >= 500) {
          setError('Error del servidor. Por favor intenta más tarde.');
        } else {
          setError(message || 'Error al registrar. Por favor intenta nuevamente.');
        }
      } else if (err.request) {
        setError('No se pudo conectar al servidor. Verifica tu conexión a internet.');
      } else {
        setError('Error inesperado. Por favor intenta nuevamente.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="login-container">
      <div className="max-w-6xl mx-auto px-5 py-10 relative z-10 flex-1">
        {/* Contenido Principal - Dos Columnas */}
        <main className="flex flex-wrap items-start gap-8 mb-12">
          {/* Columna Izquierda: Información */}
          <div className="flex-1 min-w-[300px] px-5">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#3d3d5c] mb-4 font-montserrat slide-in-left">
              ¡Bienvenido a <span className="text-[#6a5acd]"><span className="blink-animation">Alerta</span> UTEC</span>!
            </h2>
            <p className="text-lg text-[#555] mb-3 leading-relaxed pop-up">
              Sistema de gestión de incidentes para la Universidad de Ingeniería y Tecnología.
              Accede para gestionar, supervisar y resolver incidentes de manera eficiente.
            </p>
            <p className="text-lg text-[#6a5acd] font-medium mb-8">
              ¡Esperamos verte pronto!
            </p>
            
            {/* Imagen de seguridad con fondo morado */}
            <div className="mt-12 mb-8 max-w-[90%] relative overflow-visible">
              {/* Fondo morado */}
              <img 
                src={fondoMoradoImage} 
                alt="" 
                className="h-auto object-contain absolute z-0"
                style={{ width: '150%', height: 'auto', left: '-80px', bottom: '-180px' }}
              />
              {/* Imagen de seguridad delante */}
              <img 
                src={seguridadImage} 
                alt="Alerta UTEC - Sistema de Gestión" 
                className="h-auto object-contain relative z-10"
                style={{ width: '125%', height: 'auto' }}
              />
            </div>

            {/* Icono Social - Instagram */}
            <div className="flex gap-3 mt-10">
              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#f0edff] text-[#6a5acd] flex items-center justify-center hover:bg-[#dcd6ff] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Columna Derecha: Formulario */}
          <div className="flex-1 min-w-[300px] px-5 relative z-10">
            <div className="bg-[#fdfdff] rounded-lg p-8 shadow-sm">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#6a5acd] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <img 
                    src={alertaImage} 
                    alt="Alerta UTEC" 
                    className="h-10 w-auto object-contain"
                  />
                </div>
                <h1 className="text-2xl font-bold text-[#3d3d5c] mb-2 font-montserrat">Iniciar Sesión</h1>
                <p className="text-[#555]">Accede a tu cuenta</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#555] mb-2">
                    Correo electrónico:
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-3 rounded-lg border border-[#dcdcdc] bg-[#fdfdff] focus:outline-none focus:border-[#6a5acd] focus:shadow-[0_0_5px_rgba(106,90,205,0.2)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="usuario@utec.edu.pe"
                    aria-label="Correo electrónico"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#555] mb-2">
                    Contraseña:
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="w-full px-3 py-3 rounded-lg border border-[#dcdcdc] bg-[#fdfdff] focus:outline-none focus:border-[#6a5acd] focus:shadow-[0_0_5px_rgba(106,90,205,0.2)] disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                    aria-label="Contraseña"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </div>
                )}

                {successMessage && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>{successMessage}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#6a5acd] text-white font-semibold text-base border-none px-6 py-3 rounded-lg cursor-pointer transition-colors hover:bg-[#5a4acd] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isLoading && <Loader2 size={18} className="animate-spin" />}
                    {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                  </button>
                </div>
              </form>

              <div className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-[#6a5acd] text-[#6a5acd] hover:bg-[#6a5acd] hover:text-white transition-colors duration-200"
                  onClick={() => setShowRegisterModal(true)}
                >
                  Regístrate
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <p className="text-sm text-[#555] text-center mb-4">
                  Acceso rápido para preview (solo UI):
                </p>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full border-[#6a5acd] text-[#6a5acd] hover:bg-[#f0edff]"
                    onClick={() => handleQuickLogin('maria.gonzalez@utec.edu.pe')}
                  >
                    Entrar como Supervisor
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-[#6a5acd] text-[#6a5acd] hover:bg-[#f0edff]"
                    onClick={() => handleQuickLogin('carlos.ramirez@utec.edu.pe')}
                  >
                    Entrar como Trabajador
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>

      </div>

      {/* Footer - Full Width */}
      <footer className="w-full bg-[#3d3d5c] mt-auto relative z-10" style={{ marginTop: 'auto' }}>
        <div className="max-w-6xl mx-auto px-5 py-10">
          <div className="flex flex-wrap justify-around gap-8">
            <div className="min-w-[250px] text-gray-200">
              <h3 className="text-white mb-5 font-semibold text-lg font-montserrat">Oficina Principal:</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Phone size={18} className="text-[#6a5acd] mr-3 w-5 text-center flex-shrink-0" />
                  <span className="text-gray-200">+51 1 234 5678</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="text-[#6a5acd] mr-3 w-5 text-center flex-shrink-0" />
                  <span className="text-gray-200">contacto@utec.edu.pe</span>
                </li>
                <li className="flex items-center">
                  <MapPin size={18} className="text-[#6a5acd] mr-3 w-5 text-center flex-shrink-0" />
                  <span className="text-gray-200">Av. Javier Prado Este 4200, Santiago de Surco, Lima</span>
                </li>
              </ul>
            </div>
            <div className="min-w-[250px] text-gray-200">
              <h3 className="text-white mb-5 font-semibold text-lg font-montserrat">Oficina de Soporte:</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <Phone size={18} className="text-[#6a5acd] mr-3 w-5 text-center flex-shrink-0" />
                  <span className="text-gray-200">+51 1 234 5679</span>
                </li>
                <li className="flex items-center">
                  <Mail size={18} className="text-[#6a5acd] mr-3 w-5 text-center flex-shrink-0" />
                  <span className="text-gray-200">soporte@utec.edu.pe</span>
                </li>
                <li className="flex items-center">
                  <MapPin size={18} className="text-[#6a5acd] mr-3 w-5 text-center flex-shrink-0" />
                  <span className="text-gray-200">Edificio Principal, Piso 3</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Registro */}
      <Modal
        isOpen={showRegisterModal}
        onClose={() => {
          if (!isRegistering) {
            setShowRegisterModal(false);
            setRegisterName('');
            setRegisterEmail('');
            setRegisterPassword('');
            setRegistrationCode('');
            setSelectedRole('trabajador');
            setSelectedArea('TI');
            setError('');
          }
        }}
        title="Crear nueva cuenta"
        size="md"
      >
        <div className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          <div>
            <label htmlFor="register-name" className="block text-sm font-medium text-[#3d3d5c] mb-2">
              Nombre completo
            </label>
            <input
              id="register-name"
              type="text"
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              className="w-full px-4 py-3 border border-[#dcd6ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6a5acd] focus:border-[#6a5acd]"
              placeholder="Juan Pérez"
              aria-label="Nombre completo"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="block text-sm font-medium text-[#3d3d5c] mb-2">
              Correo electrónico
            </label>
            <input
              id="register-email"
              type="email"
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              disabled={isRegistering}
              className="w-full px-4 py-3 border border-[#dcd6ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6a5acd] focus:border-[#6a5acd] disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="usuario@utec.edu.pe"
              aria-label="Correo electrónico"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="block text-sm font-medium text-[#3d3d5c] mb-2">
              Contraseña
            </label>
            <input
              id="register-password"
              type="password"
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              disabled={isRegistering}
              className="w-full px-4 py-3 border border-[#dcd6ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6a5acd] focus:border-[#6a5acd] disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Mínimo 6 caracteres"
              aria-label="Contraseña"
            />
          </div>

          <div>
            <label htmlFor="register-code" className="block text-sm font-medium text-[#3d3d5c] mb-2">
              Código de Registro <span className="text-red-500">*</span>
            </label>
            <input
              id="register-code"
              type="text"
              value={registrationCode}
              onChange={(e) => setRegistrationCode(e.target.value)}
              disabled={isRegistering}
              className="w-full px-4 py-3 border border-[#dcd6ff] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6a5acd] focus:border-[#6a5acd] disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={selectedRole === 'trabajador' ? 'Ej: UTEC-STAFF-2025' : 'Ej: UTEC-ADMIN-SUPER-SECRET'}
              aria-label="Código de Registro"
            />
            <p className="text-xs text-gray-500 mt-1">
              {selectedRole === 'trabajador' 
                ? 'Código para Personal Administrativo' 
                : 'Código para Autoridad/Supervisor'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#3d3d5c] mb-3">
              Selecciona tu rol
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedRole('trabajador');
                  setSelectedArea('TI');
                }}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedRole === 'trabajador'
                    ? 'border-[#6a5acd] bg-[#f0edff]'
                    : 'border-[#dcd6ff] hover:border-[#6a5acd]'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <User size={32} className={selectedRole === 'trabajador' ? 'text-[#6a5acd]' : 'text-[#b8b0e0]'} />
                  <span className={`font-medium ${selectedRole === 'trabajador' ? 'text-[#5a4acd]' : 'text-[#3d3d5c]'}`}>
                    Trabajador
                  </span>
                  <span className="text-xs text-[#6a5acd] text-center">
                    Gestiona y resuelve incidentes
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('supervisor')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  selectedRole === 'supervisor'
                    ? 'border-[#6a5acd] bg-[#f0edff]'
                    : 'border-[#dcd6ff] hover:border-[#6a5acd]'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Shield size={32} className={selectedRole === 'supervisor' ? 'text-[#6a5acd]' : 'text-[#b8b0e0]'} />
                  <span className={`font-medium ${selectedRole === 'supervisor' ? 'text-[#5a4acd]' : 'text-[#3d3d5c]'}`}>
                    Supervisor
                  </span>
                  <span className="text-xs text-[#6a5acd] text-center">
                    Supervisa y aprueba incidentes
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Selección de área (solo para trabajadores) */}
          {selectedRole === 'trabajador' && (
            <div>
              <label className="block text-sm font-medium text-[#3d3d5c] mb-3">
                Selecciona tu área
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedArea('limpieza')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedArea === 'limpieza'
                      ? 'border-[#6a5acd] bg-[#f0edff]'
                      : 'border-[#dcd6ff] hover:border-[#6a5acd]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles size={28} className={selectedArea === 'limpieza' ? 'text-[#6a5acd]' : 'text-[#b8b0e0]'} />
                    <span className={`text-sm font-medium ${selectedArea === 'limpieza' ? 'text-[#5a4acd]' : 'text-[#3d3d5c]'}`}>
                      Limpieza
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedArea('TI')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedArea === 'TI'
                      ? 'border-[#6a5acd] bg-[#f0edff]'
                      : 'border-[#dcd6ff] hover:border-[#6a5acd]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Wrench size={28} className={selectedArea === 'TI' ? 'text-[#6a5acd]' : 'text-[#b8b0e0]'} />
                    <span className={`text-sm font-medium ${selectedArea === 'TI' ? 'text-[#5a4acd]' : 'text-[#3d3d5c]'}`}>
                      TI
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedArea('seguridad')}
                  className={`p-4 border-2 rounded-lg transition-all ${
                    selectedArea === 'seguridad'
                      ? 'border-[#6a5acd] bg-[#f0edff]'
                      : 'border-[#dcd6ff] hover:border-[#6a5acd]'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Lock size={28} className={selectedArea === 'seguridad' ? 'text-[#6a5acd]' : 'text-[#b8b0e0]'} />
                    <span className={`text-sm font-medium ${selectedArea === 'seguridad' ? 'text-[#5a4acd]' : 'text-[#3d3d5c]'}`}>
                      Seguridad
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1 text-[#6a5acd] hover:bg-[#f0edff] hover:text-[#5a4acd]"
              onClick={() => {
                if (!isRegistering) {
                  setShowRegisterModal(false);
                  setRegisterName('');
                  setRegisterEmail('');
                  setRegisterPassword('');
                  setRegistrationCode('');
                  setSelectedRole('trabajador');
                  setSelectedArea('TI');
                  setError('');
                }
              }}
              disabled={isRegistering}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-[#6a5acd] hover:bg-[#5a4acd] flex items-center justify-center gap-2"
              onClick={handleRegister}
              disabled={isRegistering}
            >
              {isRegistering && <Loader2 size={18} className="animate-spin" />}
              {isRegistering ? 'Registrando...' : 'Crear cuenta'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
