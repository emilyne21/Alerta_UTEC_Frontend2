# Carpeta Public

Esta carpeta es para **imágenes y assets estáticos** que se referencian directamente.

## Cómo usar:

1. Coloca tus imágenes aquí (ej: `public/login-image.jpg`)
2. En el código, referencia con `/nombre-imagen.jpg`

### Ejemplo:
```jsx
<img src="/login-image.jpg" alt="Descripción" />
```

**Ventajas:**
- Fácil de referenciar
- No necesita import
- Ideal para imágenes grandes o que no cambian

**Nota:** Las imágenes en `public/` se copian tal cual al build final.


