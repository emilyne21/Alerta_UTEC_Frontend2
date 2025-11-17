# Alerta UTEC - Frontend

Sistema de gestión de incidentes para UTEC. Este proyecto contiene la **interfaz de usuario (UI/UX)** para dos aplicaciones: **Frontend Supervisor** y **Frontend Trabajador**.

## 🎯 Características

- ✅ **Solo UI/UX**: Diseño visual completo sin lógica de negocio ni llamadas a APIs reales
- ✅ **Datos Mock**: Todos los datos provienen de archivos mock en memoria
- ✅ **Responsive**: Diseño mobile-first con breakpoints para `sm`, `md`, `lg`, `xl`
- ✅ **Accesible**: Labels ARIA, roles semánticos, foco visible, contraste adecuado
- ✅ **Interactivo**: Animaciones, modales, toasts, estados visuales
- ✅ **TypeScript**: Tipado completo para mayor seguridad
- ✅ **Tailwind CSS**: Estilos utilitarios y diseño consistente

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm (o yarn/pnpm)

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

### Build para Producción

```bash
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── common/          # Componentes base (Button, Badge, Modal, etc.)
│   ├── dashboard/       # Componentes del dashboard (SummaryCards, Filters)
│   ├── incidents/       # Componentes de incidentes (Table, Card, DetailPanel)
│   └── layout/          # Layout (Navbar, Sidebar, AppLayout)
├── mocks/               # Datos mock
│   ├── usuarios.ts      # Usuarios de prueba
│   ├── incidentes.ts    # Incidentes de prueba
│   └── reportes.ts      # Datos de reportes
├── pages/               # Páginas de la aplicación
│   ├── Login.tsx          # Página de login
│   ├── supervisor/        # Páginas del supervisor
│   └── worker/            # Páginas del trabajador
├── utils/               # Utilidades y tipos
│   └── types.ts          # Tipos TypeScript
├── App.tsx              # Componente principal con routing
├── main.tsx             # Punto de entrada
└── index.css            # Estilos globales
```

## 🎨 Guía de Diseño

### Paleta de Colores

Los colores están definidos en `tailwind.config.cjs`:

- **Primary**: Azul (`primary-50` a `primary-900`)
- **Danger**: Rojo (`danger-50` a `danger-900`)
- **Warning**: Amarillo/Naranja (`warning-50` a `warning-900`)
- **Success**: Verde (`success-50` a `success-900`)

### Tipografía

- **Fuente**: Inter (Google Fonts)
- **Tamaños**: Sistema de escala de Tailwind (text-sm, text-base, text-lg, etc.)

### Componentes Clave

- **Badge**: Estados, urgencias, tipos
- **Button**: Variantes (primary, secondary, danger, ghost, outline)
- **Modal**: Diálogos y paneles deslizantes
- **Toast**: Notificaciones temporales
- **Skeleton**: Estados de carga

## 📖 Flujo de Uso de la Aplicación

### 👨‍💼 Rol: Supervisor

El supervisor tiene acceso completo al sistema para gestionar, supervisar y analizar todos los incidentes.

#### 1. Inicio de Sesión
- Acceder a la página de login
- Ingresar credenciales (email y contraseña) o usar "Iniciar sesión con Google"
- El sistema redirige automáticamente al Panel de Control del supervisor

#### 2. Panel de Control (`/supervisor`)
- **Vista General**: 
  - Visualiza 3 KPIs principales: Incidentes Totales, Pendientes y Casos Críticos
  - Los datos se cargan desde el endpoint `GET /incidentes` con query parameters opcionales
- **Filtros**:
  - Estado: pendiente, en_proceso, resuelto, rechazado
  - Tipo: infraestructura, seguridad, software, hardware, red, otro
  - Urgencia: baja, media, alta, critica
  - Fechas: desde y hasta
  - Búsqueda de texto: busca en título, descripción e ID
- **Tabla de Incidentes**:
  - Muestra todos los incidentes filtrados
  - Paginación (10 incidentes por página)
  - Acciones disponibles:
    - **Ver detalle**: Abre panel lateral con información completa e historial
    - **Aprobar/Rechazar**: Para incidentes pendientes
    - **Enviar recordatorio**: Para incidentes en proceso
- **Buscador Global**:
  - Buscar en el navbar al lado de "Alerta UTEC"
  - Busca por ID, título, descripción, ubicación, reportado por, asignado a
  - Redirige a página de resultados o 404 si no encuentra nada

#### 3. Reportes (`/supervisor/reportes`)
- **KPIs en Tiempo Real**:
  - Incidentes Totales, Pendientes, Casos Críticos
  - Calculados desde datos reales del backend
- **Gráficos de Distribución**:
  - Distribución por Tipo: muestra cantidad de incidentes por cada tipo
  - Distribución por Ubicación: top 10 ubicaciones con más incidentes
  - Los gráficos se actualizan automáticamente con datos reales

#### 4. Historial (`/supervisor/historial`)
- **Lista de Incidentes**:
  - Muestra todos los incidentes del sistema
  - Cada incidente muestra: título, estado, urgencia, tipo, ubicación, fechas
- **Ver Historial Completo**:
  - Hacer clic en un incidente para expandirlo
  - Se carga el historial desde `GET /incidentes/:id/historial`
  - Muestra timeline completo con todos los eventos (creado, asignado, comentado, resuelto, etc.)
- **Búsqueda y Filtrado**:
  - Búsqueda de texto en tiempo real
  - Filtros por estado, tipo, urgencia y fechas

#### 5. Búsqueda Global
- Usar el buscador en el navbar
- Ingresar término de búsqueda (ID, título, descripción, etc.)
- Ver resultados en página dedicada
- Si no hay resultados, se muestra página 404

---

### 👷 Rol: Trabajador

El trabajador gestiona los incidentes asignados a él y puede tomar nuevos casos de la cola de pendientes.

#### 1. Inicio de Sesión
- Acceder a la página de login
- Ingresar credenciales (email y contraseña) o usar "Iniciar sesión con Google"
- El sistema redirige automáticamente al Panel del Trabajador

#### 2. Mi Panel (`/trabajador`)
- **Panel de Bienvenida**:
  - Saludo personalizado según la hora del día
  - Descripción del sistema
  - Enlace rápido a "Mis Casos"
  - Imagen ilustrativa
- **Calendario**:
  - Vista mensual con incidentes marcados por fecha
  - Navegación entre meses
  - Leyenda de colores según urgencia
  - Muestra incidentes asignados al trabajador
- **Progreso de Incidentes**:
  - Top 3 incidentes más recientes asignados
  - Muestra estado, urgencia y tipo
  - Enlace para ver detalles
- **Guía de Uso**:
  - 6 tarjetas con instrucciones sobre cómo usar el sistema
  - Pasos claros para gestionar incidentes

#### 3. Cola de Pendientes (`/trabajador/pendientes`)
- **Vista de Incidentes Sin Asignar**:
  - Muestra solo incidentes con estado "pendiente" y sin asignar
  - Carga desde `GET /incidentes` y filtra en frontend
- **Filtros Rápidos**:
  - Por tipo y urgencia
  - Búsqueda de texto
- **Asignarse Casos**:
  - Hacer clic en "Asignarme" en una tarjeta de incidente
  - Confirmar la acción
  - El incidente se asigna al trabajador actual
  - Se actualiza la lista automáticamente

#### 4. Mis Casos (`/trabajador/mis-casos`)
- **Incidentes Asignados**:
  - Muestra solo los incidentes asignados al trabajador actual
  - Carga desde `GET /incidentes` y filtra por usuario
- **Estados de Casos**:
  - En Proceso: casos asignados y en trabajo
  - Resueltos: casos completados
  - Rechazados: casos rechazados por supervisor
- **Acciones Disponibles**:
  - **Ver Detalle**: Abre panel lateral con información completa
  - **Marcar como Resuelto**: Para casos en proceso
  - **Ver Historial**: Timeline completo del incidente
- **Filtros**:
  - Por estado, tipo, urgencia
  - Búsqueda de texto

#### 5. Historial (`/trabajador/historial`)
- **Lista de Mis Incidentes**:
  - Muestra todos los incidentes asignados al trabajador
  - Carga desde `GET /incidentes` filtrado por usuario
- **Ver Historial Completo**:
  - Expandir un incidente haciendo clic en él
  - Se carga el historial desde `GET /incidentes/:id/historial`
  - Muestra todos los eventos del incidente en orden cronológico
- **Filtros**:
  - Por estado, tipo, urgencia
  - Búsqueda de texto

#### 6. Búsqueda Global
- Usar el buscador en el navbar
- Buscar incidentes por ID, título, descripción, etc.
- Ver resultados o página 404 si no hay coincidencias

---

### 🔍 Búsqueda y Navegación

Ambos roles tienen acceso al **buscador global** en el navbar:
- Ubicado al lado del logo "Alerta UTEC"
- Busca en todos los campos relevantes de los incidentes
- Redirige a página de resultados (`/buscar?q=termino`)
- Si no hay resultados, muestra página 404

### ❌ Página 404

Se muestra cuando:
- No se encuentran resultados de búsqueda
- Se accede a una ruta inexistente
- Se busca sin término

La página 404 incluye:
- Mensaje claro de error
- Botones para volver al panel correspondiente
- Diseño consistente con el resto de la aplicación

## 🧪 Pruebas Manuales

### 1. Login y Navegación

1. Abrir la aplicación → Debería mostrar la página de login
2. Hacer clic en "Entrar como Supervisor" → Debería redirigir al dashboard del supervisor
3. Verificar que el sidebar muestre: Panel, Reportes, Usuarios, Configuración
4. Hacer clic en "Entrar como Trabajador" → Debería redirigir al dashboard del trabajador
5. Verificar que el sidebar muestre: Cola de Pendientes, Mis Casos, Historial

### 2. Dashboard Supervisor

1. **Panel Principal**:
   - Verificar que se muestren 4 tarjetas de resumen (KPIs)
   - Verificar que la tabla de incidentes muestre al menos 8 incidentes
   - Probar los filtros (Estado, Urgencia, Tipo, Fechas)
   - Verificar paginación si hay más de 10 incidentes

2. **Detalle de Incidente**:
   - Hacer clic en una fila de la tabla o en el botón "Ver"
   - Verificar que se abra el panel lateral con toda la información
   - Verificar timeline/historial
   - Probar botones de acción (Aprobar, Rechazar, Enviar recordatorio)
   - Verificar que aparezca un toast de confirmación

3. **Reportes**:
   - Navegar a "Reportes" desde el sidebar
   - Verificar gráficos de barras (distribución por tipo y ubicación)
   - Verificar que los datos sean coherentes

### 3. Dashboard Trabajador

1. **Cola de Pendientes**:
   - Navegar a "Cola de Pendientes"
   - Verificar que solo se muestren incidentes pendientes sin asignar
   - Probar filtros rápidos
   - Hacer clic en "Asignarme" en una tarjeta
   - Verificar toast de confirmación

2. **Mis Casos**:
   - Navegar a "Mis Casos"
   - Verificar que solo se muestren incidentes asignados al usuario actual
   - Probar "Marcar como resuelto" en un caso en proceso
   - Verificar modal de confirmación

3. **Panel Principal**:
   - Verificar KPIs personalizados (Mis Casos, En Proceso, Resueltos)
   - Verificar sección de "Casos Recientes"

### 4. Responsive

1. Reducir el ancho del navegador a menos de 1024px
2. Verificar que el sidebar se oculte y aparezca un botón de menú
3. Verificar que las tablas se conviertan en tarjetas en mobile
4. Probar en diferentes tamaños (320px, 768px, 1024px, 1920px)

### 5. Interacciones Visuales

1. **Hover**: Pasar el mouse sobre botones, filas de tabla, tarjetas
2. **Focus**: Navegar con Tab y verificar que el foco sea visible
3. **Modales**: Abrir y cerrar modales, verificar animaciones
4. **Toasts**: Ejecutar acciones y verificar que aparezcan notificaciones
5. **Loading**: Verificar estados de skeleton (si se implementan)

### 6. Accesibilidad

1. Navegar solo con teclado (Tab, Enter, Escape)
2. Verificar que todos los botones tengan labels ARIA
3. Verificar contraste de colores (usar herramienta de contraste)
4. Verificar que los modales bloqueen el foco correctamente

## 🔧 Personalización

### Cambiar Colores

Editar `tailwind.config.cjs`:

```javascript
colors: {
  primary: {
    // Modificar valores hex aquí
  }
}
```

### Modificar Datos Mock

- **Usuarios**: `src/mocks/usuarios.ts`
- **Incidentes**: `src/mocks/incidentes.ts`
- **Reportes**: `src/mocks/reportes.ts`

### Agregar Nuevas Rutas

1. Crear componente de página en `src/pages/`
2. Agregar ruta en `src/App.tsx`
3. Agregar item de navegación en `src/components/layout/Sidebar.tsx` si aplica

## 🔌 Integración Futura

### Dónde Integrar la Lógica Real

El código está marcado con comentarios `// NOTE:` indicando dónde integrar:

1. **Autenticación**: `src/pages/Login.tsx` - función `handleQuickLogin`
2. **Llamadas API**: 
   - `src/pages/supervisor/SupervisorDashboard.tsx` - función `handleAction`
   - `src/pages/worker/PendingQueue.tsx` - función `handleAction`
   - `src/components/incidents/IncidentDetailPanel.tsx` - función `handleAction`
3. **Estado Global**: Considerar Context API o Redux para reemplazar mocks
4. **Validaciones**: Agregar validaciones de formularios con librerías como `react-hook-form` + `zod`

### Variables de Entorno

Crear `.env` basado en `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000
```

## 📝 Notas de Diseño

### Decisiones de UX

1. **Sidebar Colapsable**: En mobile, el sidebar se oculta automáticamente
2. **Panel Lateral**: El detalle de incidente se abre como slide-over desde la derecha
3. **Filtros Acordeón**: Los filtros se muestran/ocultan para ahorrar espacio
4. **Toast System**: Notificaciones no intrusivas en la esquina superior derecha
5. **Confirm Dialogs**: Diálogos de confirmación para acciones críticas

### Accesibilidad

- Todos los inputs tienen labels asociados
- Botones tienen `aria-label` cuando el texto no es descriptivo
- Modales tienen `role="dialog"` y `aria-modal="true"`
- Tablas tienen headers semánticos
- Navegación por teclado completamente funcional

### Responsive Breakpoints

- `sm`: 640px (móvil grande)
- `md`: 768px (tablet)
- `lg`: 1024px (desktop)
- `xl`: 1280px (desktop grande)

## 🐛 Problemas Conocidos

- Los datos mock no persisten al recargar (por diseño)
- No hay validación de formularios (solo UI)
- Los toasts se exponen globalmente vía `window.showToast` (temporal, para demo)

## 📚 Tecnologías Utilizadas

- **React 18**: Biblioteca UI
- **TypeScript**: Tipado estático
- **Vite**: Build tool y dev server
- **Tailwind CSS**: Framework de estilos
- **React Router**: Enrutamiento
- **Lucide React**: Iconos
- **date-fns**: Manejo de fechas
- **clsx**: Utilidad para clases condicionales

## 📄 Licencia

Este proyecto es una demostración de UI/UX. Todos los derechos reservados.

---

**Nota**: Este es un proyecto de demostración visual. Para producción, se requiere:
- Integración con backend/API
- Autenticación real
- Validaciones de formularios
- Manejo de errores robusto
- Tests automatizados
- Optimizaciones de performance
