# Carpeta Assets

Esta carpeta es para **imágenes que se importan en los componentes**.

## Cómo usar:

1. Coloca tus imágenes aquí (ej: `src/assets/login-image.jpg`)
2. Importa en tu componente:

### Ejemplo:
```jsx
import loginImage from '../assets/login-image.jpg';

// Luego usa:
<img src={loginImage} alt="Descripción" />
```

**Ventajas:**
- Vite optimiza las imágenes automáticamente
- Mejor para imágenes que se usan en componentes
- Soporte para diferentes formatos

**Nota:** Vite procesa estas imágenes y puede optimizarlas en el build.



