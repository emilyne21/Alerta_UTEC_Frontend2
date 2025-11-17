// src/pages/NotFound.tsx
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F2ECEC' }}>
      <div className="text-center px-4">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4" style={{ backgroundColor: '#E05A29' }}>
            <AlertCircle size={48} className="text-white" />
          </div>
          <h1 className="text-6xl font-bold mb-4" style={{ color: '#132436' }}>404</h1>
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#132436' }}>Página no encontrada</h2>
          <p className="text-lg mb-8" style={{ color: '#132436', opacity: 0.7 }}>
            Lo sentimos, la página que buscas no existe o el recurso no fue encontrado.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/supervisor"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors"
            style={{ backgroundColor: '#6a5acd', color: '#F2ECEC' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#5a4acd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#6a5acd';
            }}
          >
            <Home size={20} />
            Volver al Panel
          </Link>
          <Link
            to="/trabajador"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors border-2"
            style={{ borderColor: '#6a5acd', color: '#6a5acd', backgroundColor: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0edff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Ir a Mi Panel
          </Link>
        </div>
      </div>
    </div>
  );
};

