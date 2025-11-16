# Servicios de Backend

Este directorio contiene los servicios para comunicarse con el backend de AlertaUTEC.

## Archivos

### `api.ts`
Cliente HTTP configurado con Axios para realizar peticiones REST al backend.

**Características:**
- Base URL configurada desde `VITE_API_URL`
- Interceptor automático para añadir token JWT en el header `Authorization`
- Manejo centralizado de errores (401, 500, etc.)
- Timeout configurado a 30 segundos

**Uso:**
```typescript
import apiClient from '@/services/api';

// GET request
const response = await apiClient.get('/incidents');
const incidents = response.data;

// POST request
const newIncident = await apiClient.post('/incidents', {
  tipo: 'seguridad',
  descripcion: '...',
});

// PUT request
await apiClient.put(`/incidents/${id}`, { estado: 'resuelto' });

// DELETE request
await apiClient.delete(`/incidents/${id}`);
```

### `socket.ts`
Cliente WebSocket usando Socket.IO para comunicación en tiempo real.

**Características:**
- URL configurada desde `VITE_WS_URL`
- Reconexión automática
- Autenticación con token JWT
- Singleton pattern para una única instancia

**Uso:**
```typescript
import socketService from '@/services/socket';

// Conectar
socketService.connect();

// Escuchar eventos
socketService.on('incident:created', (incident) => {
  console.log('Nuevo incidente:', incident);
});

// Emitir eventos
socketService.emit('incident:update', { id: '123', estado: 'en_proceso' });

// Desconectar
socketService.disconnect();
```

## Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con:

```env
VITE_API_URL=http://alerta-utec-alb-1269448375.us-east-1.elb.amazonaws.com
VITE_WS_URL=wss://ufs7epfg85.execute-api.us-east-1.amazonaws.com/dev
```

**Nota:** Después de modificar `.env`, reinicia el servidor de desarrollo.

