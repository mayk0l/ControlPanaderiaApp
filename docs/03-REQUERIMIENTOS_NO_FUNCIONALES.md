# 📋 Requerimientos No Funcionales

## RNF-01: Usabilidad

### RNF-01.1: Interfaz Intuitiva
- La interfaz debe ser clara y fácil de entender sin necesidad de capacitación extensa
- Los elementos interactivos deben tener feedback visual (hover, active, disabled states)
- Los formularios deben mostrar validaciones claras y mensajes de error comprensibles

### RNF-01.2: Diseño Responsivo
- La aplicación debe funcionar correctamente en dispositivos móviles (smartphones)
- La aplicación debe funcionar correctamente en tablets
- La aplicación debe funcionar correctamente en escritorio
- Navegación adaptada: menú lateral en desktop, barra inferior en móvil

### RNF-01.3: Accesibilidad Visual
- Soporte para modo claro y modo oscuro
- Contraste adecuado entre texto y fondo
- Tamaños de fuente legibles en todos los dispositivos
- Iconografía clara y reconocible

### RNF-01.4: Experiencia Táctil
- Áreas de toque suficientemente grandes para uso en pantallas táctiles
- Animaciones de feedback al interactuar (scale, transitions)
- Gestos intuitivos para acciones comunes

---

## RNF-02: Rendimiento

### RNF-02.1: Tiempo de Carga
- La aplicación debe cargar inicialmente en menos de 3 segundos
- Las transiciones entre vistas deben ser instantáneas (< 300ms)
- Las operaciones de guardado deben completarse en menos de 1 segundo

### RNF-02.2: Optimización
- Los cálculos complejos deben usar memorización para evitar recálculos innecesarios
- Las listas largas deben implementar scroll virtual si superan 100 elementos
- Las imágenes y recursos deben estar optimizados

### RNF-02.3: Tiempo Real
- Los datos del turno actual deben actualizarse en tiempo real
- Múltiples sesiones deben ver los cambios sin necesidad de refrescar

---

## RNF-03: Confiabilidad

### RNF-03.1: Disponibilidad
- El sistema debe estar disponible 24/7 (dependiente de la infraestructura)
- Debe manejar adecuadamente la pérdida de conexión a internet
- Debe mostrar estados de carga y error apropiados

### RNF-03.2: Integridad de Datos
- Las transacciones financieras deben ser atómicas
- No debe ser posible crear estados inconsistentes en los datos
- Los cierres de turno deben guardar snapshots de la configuración usada

### RNF-03.3: Recuperación
- Los formularios no deben perder datos por navegación accidental
- El sistema debe manejar errores de red con reintentos o mensajes claros

---

## RNF-04: Seguridad

### RNF-04.1: Autenticación
- Las contraseñas no deben mostrarse por defecto
- El sistema debe validar credenciales antes de dar acceso
- Las sesiones deben poder cerrarse manualmente

### RNF-04.2: Autorización
- Los usuarios con rol "vendedor" no deben poder acceder a funciones de admin
- Las vistas administrativas deben estar ocultas para usuarios no autorizados
- Las operaciones críticas deben verificar permisos

### RNF-04.3: Protección de Datos
- Los datos financieros deben transmitirse de forma segura
- Los datos deben almacenarse en sistemas confiables
- Debe existir separación lógica de datos por instalación/negocio

---

## RNF-05: Mantenibilidad

### RNF-05.1: Código
- El código debe estar organizado en módulos/componentes claramente definidos
- Debe seguir patrones de diseño consistentes
- Debe incluir comentarios en secciones complejas

### RNF-05.2: Documentación
- Documentación técnica del sistema
- Documentación de API y estructuras de datos
- Guías de despliegue

### RNF-05.3: Configurabilidad
- Los parámetros del negocio deben ser configurables sin modificar código
- Los textos y formatos de moneda deben ser configurables por región

---

## RNF-06: Escalabilidad

### RNF-06.1: Datos
- El sistema debe manejar al menos 1 año de histórico sin degradación
- Debe soportar catálogos de al menos 500 productos
- Debe soportar al menos 1000 transacciones diarias

### RNF-06.2: Usuarios
- El sistema debe soportar al menos 10 usuarios simultáneos por instalación
- Debe manejar múltiples dispositivos por usuario

---

## RNF-07: Compatibilidad

### RNF-07.1: Navegadores
- Chrome (versiones recientes)
- Firefox (versiones recientes)
- Safari (versiones recientes)
- Edge (versiones recientes)

### RNF-07.2: Dispositivos
- iOS (iPhone, iPad)
- Android (smartphones, tablets)
- Windows, macOS, Linux (desktop)

### RNF-07.3: Resoluciones
- Móvil: desde 320px de ancho
- Tablet: desde 768px de ancho
- Desktop: desde 1024px de ancho

---

*Documento de requerimientos no funcionales - Versión 1.0*
