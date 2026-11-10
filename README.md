# RestoSuite Pro - Sistema Integral para Restaurante

Plataforma fullstack de alto rendimiento para gestión integral de restaurantes desarrollada con **React 18, TypeScript, Tailwind CSS y Firebase**.

---

## 🚀 Arquitectura y Módulos del Sistema

### 1. Backend & Persistencia Offline (Etapa 1)
- **Modelos de datos estrictos en TypeScript** (`Product`, `Category`, `Order`, `Customer`, `Review`, `InventoryItem`, `DailyAnalytics`).
- **Reglas de seguridad Firestore (`firestore.rules`)** con validación granular de roles (`admin`, `staff`, `masterAdmin`).
- **Caché offline** con `persistentLocalCache` e IndexedDB multi-pestaña en Firebase Web SDK v10+.

### 2. Panel de Administración & Catálogo (Etapa 2)
- **CRUD de Platos y Categorías** con interruptor toggle de disponibilidad inmediata.
- **Compresor WebP Client-Side** en Canvas (máx. 800x800px, 0.8 calidad) para acelerar la carga móvil y reducir costes de Storage.
- **Generador de Códigos QR para Mesas** (`qrcode.react`) con diseño minimalista y soporte de impresión limpio `@media print`.
- **Inventario de Cocina** con semáforo visual automático de stock (Disponible, Por agotarse, Agotado).

### 3. Operación en Salón y Cocina en Tiempo Real (Etapa 3)
- **App del Mesero (Móvil / Tablet)**:
  - Ingreso rápido por PIN de 4 dígitos.
  - Plano de mesas con estados dinámicos (Libre, Ocupada, Cuenta solicitada).
  - Comanda táctil con notas de preparación y soporte de rondas/tandas de pedido.
  - Auditoría de cancelaciones con justificación obligatoria y PIN administrativo para ítems en cocina.
- **KDS de Cocina en Pantalla Completa**:
  - Cola FIFO en tiempo real (`onSnapshot`).
  - Alerta por minutos transcurridos (Verde -> Amarillo -> Rojo).
  - Campanada armónica sintetizada con **Web Audio API** para nuevos pedidos.
  - Botones táctiles de cocina ("Iniciar preparación", "Listo para servir").

### 4. Menú QR para Comensales (Etapa 4)
- Detección automática del número de mesa mediante parámetro `?table=X` y persistencia en `localStorage`.
- Identificación progresiva del cliente (Nombre y WhatsApp) con soporte de modo anónimo sin fricción.
- Modal reactivo de calificación y feedback (1 a 5 estrellas, plato preferido y tags) desplegado al completar el servicio.
- Banner de fidelización para vinculación directa al CRM.

### 5. Inteligencia de Negocio & Serverless (Etapa 5)
- **Cloud Functions (`functions/src/index.ts`)**:
  - `onOrderPaid`: Trigger atómico que incrementa ventas de platos, actualiza el resumen diario `/daily_analytics/{YYYY-MM-DD}` y acumula el historial del cliente en `/customers`.
  - `convertAnonymousCustomer`: Callable function para transferir pedidos anónimos a cuentas de fidelización.
- **Dashboard de BI**: Consulta optimizada a 1 sola lectura de Firestore por día, Top 5 productos, ranking de clientes VIP y muro en vivo de reseñas.

### 6. Módulo Oculto Master Admin / Superadmin (Etapa 6)
- **Ruta secreta configurable** (`VITE_MASTER_ROUTE`, por defecto `/sys-core-x9a7`) protegida por `MasterRouteGuard` y Custom Claim `masterAdmin: true`.
- **Script de asignación de claims**: `scripts/setMasterAdmin.ts`.
- **Kill Switch Maestro**: Suspensión inmediata del servicio ante contingencias con pantalla informativa (`SuspendedNotice`).
- **Feature Flags en caliente**: Encendido/apagado de módulos individuales (QR, KDS, CRM, Reseñas, Inventario).
- **Modo Dios (Impersonation)**: Simulación en sala como Mesero, Cocina o Admin sin requerir credenciales locales.
- **Consola de Mantenimiento**: Limpieza masiva de pruebas y cierre forzado de mesas abiertas.
- **Auditoría de Mermas**: Registro de pérdidas monetarias por platos anulados en cocina.
- **Branding Dinámico**: Configuración en caliente de nombre, logo y colores HEX inyectados en variables CSS `:root`.

---

## 🛠️ Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/GabrielCuadrado03/AppRestaurant.git
cd AppRestaurant

# 2. Instalar dependencias
npm install

# 3. Iniciar entorno de desarrollo
npm run dev

# 4. Compilar para producción
npm run build
```

---

## 🔐 Asignación de Permisos Master Admin

```bash
npx ts-node scripts/setMasterAdmin.ts <FIREBASE_AUTH_UID>
```
