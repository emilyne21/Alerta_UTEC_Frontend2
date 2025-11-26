# Alerta UTEC - Frontend

# Alerta UTEC - Guía de Funcionamiento

Esta aplicación gestiona el sistema de alertas de UTEC, permitiendo la interacción diferenciada según el tipo de usuario. A continuación se describe cómo operar la aplicación y gestionar el acceso.

## 1. Registro de Usuarios

El acceso a la aplicación está restringido y determinado por un sistema de roles. Para crear una cuenta, el usuario debe ingresar un **Código de Registro** válido en el formulario de "Sign Up". Este código define automáticamente los permisos dentro del sistema.

### Códigos de Acceso

Utilice los siguientes códigos según el perfil del usuario:

* **Rol de Trabajador (Staff)**
    * **Código:** `UTEC-STAFF-2025`
    * **Descripción:** Permite el registro de personal operativo. Los usuarios con este rol pueden generar alertas y visualizar las tareas asignadas a su nivel.

* **Rol de Supervisor (Administrador)**
    * **Código:** `UTEC-ADMIN-SUPER-SECRET`
    * **Descripción:** Permite el registro de administradores o supervisores. Este rol habilita el acceso completo al sistema, incluyendo la gestión de alertas globales y la supervisión de la actividad de los trabajadores.

## 2. Inicio de Sesión (Login)

Una vez completado el registro con el código correspondiente:
1.  Diríjase a la pantalla de **Login**.
2.  Ingrese el correo electrónico y la contraseña registrados.
3.  El sistema lo redirigirá automáticamente a la vista correspondiente a su rol (Vista de Trabajador o Dashboard de Supervisor).

## 3. Flujo General

* **Para Trabajadores:** Al ingresar, tendrán acceso directo a los formularios de reporte y al historial de sus alertas enviadas.
* **Para Supervisores:** Al ingresar, visualizarán un panel de control con el resumen de todas las alertas activas y herramientas para cambiar el estado de las mismas.



