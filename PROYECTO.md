# Sistema de Gestión de Mantenimiento para Maquinaria Pesada

Un sistema empresarial completo para la gestión de mantenimiento de maquinaria pesada, construido con React Native (Expo), TypeScript y una arquitectura escalable lista para integración con backend.

![Industrial Theme](https://img.shields.io/badge/theme-industrial-0ea5e9)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81-green)
![Expo](https://img.shields.io/badge/Expo-54.x-black)

## 🎯 Características Principales

### 🔐 Sistema de Autenticación y Roles (RBAC)
- **4 Roles de Usuario**: Operador, Analista, Coordinador, Gerencia
- Control de acceso granular por funcionalidad
- Sesión persistente con AsyncStorage
- Navegación protegida por rol

### 📱 Interfaces Adaptadas por Rol

#### 👷 Operador (Mobile-First)
- Interfaz simplificada con botones grandes
- Actualización de horómetro
- Reporte de incidencias con foto
- Diseñado para uso en campo

#### 📊 Analista (El Controlador)
- Dashboard con KPIs operacionales
- CRUD completo de Maquinaria
- CRUD completo de Órdenes de Trabajo
- Validación de incidencias
- Módulo de reportes

#### 🔧 Coordinador (El Gestor)
- Dashboard de supervisión de flota
- CRUD completo de Inventario (Repuestos)
- Gestión de Proveedores
- Alertas de stock crítico
- Aprobación de OTs costosas

#### 📈 Gerencia (El Observador)
- Dashboard ejecutivo de solo lectura
- KPIs avanzados: OEE, MTTR, MTBF, Disponibilidad
- Reportes consolidados
- Gráficos de tendencias

### 🎨 Diseño "Creativo-Industrial"
- Tema dark mode con paleta de grises oscuros
- Azules intensos para navegación
- Amarillos/naranjas para alertas y acciones
- Tipografía clara y legible
- Layout con sidebar colapsable (web) y drawer (móvil)

### 📦 Arquitectura del Proyecto

```
proyecto/
├── app/                          # Expo Router - File-based routing
│   ├── _layout.tsx              # Root layout con autenticación
│   ├── index.tsx                # Redirect inicial
│   ├── login.tsx                # Pantalla de login
│   ├── dashboard.tsx            # Dashboard principal (role-based)
│   ├── machinery.tsx            # Lista de maquinaria
│   ├── work-orders.tsx          # Órdenes de trabajo
│   ├── inventory.tsx            # Inventario de repuestos
│   ├── reports.tsx              # Módulo de reportes
│   └── suppliers.tsx            # Gestión de proveedores
│
├── components/                   # Componentes reutilizables
│   ├── Sidebar.tsx              # Navegación lateral con roles
│   ├── KPICard.tsx              # Tarjeta de KPI con tendencias
│   └── StatusBadge.tsx          # Badge de estado visual
│
├── contexts/                     # React Context para estado global
│   └── AuthContext.tsx          # Autenticación y permisos (RBAC)
│
├── services/                     # Capa de servicios (API Mock)
│   ├── apiService.ts            # ⚠️ SERVICIO MOCK - Conectar backend aquí
│   └── mockData.ts              # Datos de ejemplo ricos y complejos
│
├── types/                        # Definiciones TypeScript
│   └── index.ts                 # Todos los tipos del sistema
│
├── constants/                    # Constantes del proyecto
│   └── colors.ts                # Paleta de colores industrial
│
└── PROYECTO.md                   # Este archivo
```

## 🔑 Usuarios de Prueba

El sistema incluye 4 usuarios mock para pruebas. En la pantalla de login, usa los botones de "Acceso rápido" o ingresa manualmente:

| Rol | Email | Contraseña |
|-----|-------|-----------|
| **Operador** | operador@sistema.com | operador123 |
| **Analista** | analista@sistema.com | analista123 |
| **Coordinador** | coordinador@sistema.com | coordinador123 |
| **Gerencia** | gerencia@sistema.com | gerencia123 |

## 🔌 Integración con Backend (API REST)

### ⚠️ IMPORTANTE: Capa de Servicios Mock

**Todas las llamadas a datos están en `services/apiService.ts`**. Este archivo contiene funciones async que devuelven datos de ejemplo (mock). Para conectar tu backend real:

### Pasos para Integrar tu Backend:

1. **Abre `services/apiService.ts`**
2. **Busca las funciones que devuelven datos mock**
3. **Reemplaza el código mock con llamadas fetch o axios reales**

### Ejemplo de Migración:

#### ❌ ANTES (Mock actual):
```typescript
async getMaquinaria(): Promise<Maquinaria[]> {
  await delay(300);
  // TODO: Conectar al endpoint real del backend en GET /api/v1/maquinaria
  return [...MOCK_MAQUINARIA];
}
```

#### ✅ DESPUÉS (Con backend real):
```typescript
async getMaquinaria(): Promise<Maquinaria[]> {
  const response = await fetch('https://tu-backend.com/api/v1/maquinaria', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Si usas auth
    },
  });
  
  if (!response.ok) {
    throw new Error('Error al obtener maquinaria');
  }
  
  return await response.json();
}
```

### 📋 Endpoints Recomendados para tu Backend:

#### Autenticación
- `POST /api/v1/auth/login` - Login (email, password) → User + token
- `POST /api/v1/auth/logout` - Logout

#### Maquinaria
- `GET /api/v1/maquinaria` - Listar todas
- `GET /api/v1/maquinaria/:id` - Obtener una por ID
- `POST /api/v1/maquinaria` - Crear nueva
- `PUT /api/v1/maquinaria/:id` - Actualizar
- `DELETE /api/v1/maquinaria/:id` - Eliminar
- `PATCH /api/v1/maquinaria/:id/horometro` - Actualizar horómetro

#### Órdenes de Trabajo
- `GET /api/v1/ordenes-trabajo` - Listar todas
- `GET /api/v1/ordenes-trabajo/:id` - Obtener una por ID
- `GET /api/v1/ordenes-trabajo/maquinaria/:maquinariaId` - Por máquina
- `POST /api/v1/ordenes-trabajo` - Crear nueva
- `PUT /api/v1/ordenes-trabajo/:id` - Actualizar
- `DELETE /api/v1/ordenes-trabajo/:id` - Eliminar

#### Repuestos (Inventario)
- `GET /api/v1/repuestos` - Listar todos
- `GET /api/v1/repuestos/:id` - Obtener uno por ID
- `GET /api/v1/repuestos/alertas` - Repuestos con stock bajo
- `POST /api/v1/repuestos` - Crear nuevo
- `PUT /api/v1/repuestos/:id` - Actualizar
- `DELETE /api/v1/repuestos/:id` - Eliminar

#### Historial de Mantenimiento
- `GET /api/v1/historial` - Listar todo
- `GET /api/v1/historial/maquinaria/:id` - Por máquina
- `POST /api/v1/historial` - Crear registro

#### Proveedores
- `GET /api/v1/proveedores` - Listar todos
- `GET /api/v1/proveedores/:id` - Obtener uno por ID
- `POST /api/v1/proveedores` - Crear nuevo
- `PUT /api/v1/proveedores/:id` - Actualizar
- `DELETE /api/v1/proveedores/:id` - Eliminar

#### Dashboard y Reportes
- `GET /api/v1/dashboard?rol=<rol>` - Datos del dashboard por rol
- `GET /api/v1/notificaciones` - Lista de notificaciones
- `PATCH /api/v1/notificaciones/:id/leer` - Marcar como leída
- `GET /api/v1/reportes/chart?tipo=<tipo>&periodo=<periodo>` - Datos de gráficos

### 🔧 Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Backend API
EXPO_PUBLIC_API_URL=https://tu-backend.com/api/v1
EXPO_PUBLIC_API_TIMEOUT=10000

# (Opcional) Claves de servicios externos
EXPO_PUBLIC_SENTRY_DSN=tu-sentry-dsn
```

Luego en `apiService.ts`:

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
```

## 📊 Modelos de Datos (TypeScript Types)

Todos los tipos están definidos en `types/index.ts`:

### Entidades Principales:
- **User**: Usuario del sistema (con rol)
- **Maquinaria**: Equipo pesado (excavadora, bulldozer, etc.)
- **OrdenTrabajo**: OT (Preventivo, Correctivo, Predictivo)
- **Repuesto**: Pieza de inventario
- **HistorialMantenimiento**: Registro de mantenimientos realizados
- **Proveedor**: Proveedor de repuestos
- **Notificacion**: Alerta del sistema
- **KPI**: Indicador clave de rendimiento
- **DashboardData**: Estructura de datos del dashboard

### Ejemplo de Estructura (Maquinaria):
```typescript
interface Maquinaria {
  id: string;
  nombre: string;
  codigo: string;
  modelo: string;
  fabricante: string;
  fechaAdquisicion: string;
  estado: 'Operativo' | 'En Mantenimiento' | 'Averiado' | 'Fuera de Servicio';
  horometroActual: number;
  proximoMantenimiento: string;
  imagenUrl?: string;
  ubicacion?: string;
  horasOperacion?: number;
  disponibilidad?: number; // Porcentaje
}
```

## 🎨 Guía de Diseño

### Paleta de Colores (Industrial Theme)

```typescript
// Backgrounds
background: '#0f1419'           // Negro-azulado profundo
backgroundSecondary: '#1a1f27'  // Gris oscuro
surface: '#2a2f38'              // Superficies de tarjetas

// Primary & Accent
primary: '#0ea5e9'              // Azul intenso (acciones)
accent: '#f59e0b'               // Amarillo industrial (alertas)

// Status Colors
success: '#10b981'              // Verde (OK, completado)
warning: '#f59e0b'              // Amarillo (advertencia)
error: '#ef4444'                // Rojo (crítico, error)

// Text
text: '#f3f4f6'                 // Blanco apagado
textSecondary: '#9ca3af'        // Gris claro
textMuted: '#6b7280'            // Gris medio
```

### Componentes Reutilizables

#### `<KPICard />`
Tarjeta de KPI con valor, unidad, tendencia y progreso hacia objetivo.

```tsx
<KPICard
  kpi={{
    nombre: 'Disponibilidad Operacional',
    valor: 92.3,
    unidad: '%',
    tendencia: 'up',
    cambio: 2.3,
    objetivo: 90,
  }}
  onPress={() => console.log('KPI clicked')}
/>
```

#### `<StatusBadge />`
Badge visual para estados de maquinaria, órdenes y prioridades.

```tsx
<StatusBadge status="Operativo" type="maquinaria" size="medium" />
<StatusBadge status="En Progreso" type="orden" size="small" />
<StatusBadge status="Alta" type="prioridad" />
```

#### `<Sidebar />`
Navegación lateral con filtrado por rol y estado activo.

```tsx
<Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
```

## 📦 Dependencias Principales

- **expo**: ~54.0.20
- **react**: 19.1.0
- **react-native**: 0.81.5
- **expo-router**: ~6.0.13 (File-based routing)
- **@tanstack/react-query**: ^5.83.0 (Gestión de estado servidor)
- **lucide-react-native**: ^0.475.0 (Iconos)
- **@nkzw/create-context-hook**: ^1.1.0 (Context helper)
- **@react-native-async-storage/async-storage**: 2.2.0 (Persistencia)
- **expo-image**: ~3.0.10 (Optimización de imágenes)

## 🔒 Seguridad y Buenas Prácticas

### ✅ Implementado:
- Control de acceso basado en roles (RBAC)
- Validación de tipos con TypeScript
- Safe Area handling para iOS/Android
- Persistencia segura con AsyncStorage
- Manejo de errores en todas las llamadas async

### ⚠️ Pendiente para Producción:
- Implementar JWT y refresh tokens
- Encriptación de datos sensibles en AsyncStorage
- Rate limiting en el backend
- Logs de auditoría
- 2FA (Two-Factor Authentication)
- HTTPS obligatorio

## 🚧 Roadmap y Próximas Funcionalidades

### Fase 2 - Funcionalidades Avanzadas:
- [ ] Detalle completo de Maquinaria con pestañas (Info, Historial, Próximos, Documentos)
- [ ] Wizard multi-paso para programar mantenimientos preventivos
- [ ] Módulo de reportes con filtros y exportación a PDF
- [ ] Gráficos interactivos (react-native-chart-kit)
- [ ] Notificaciones push con expo-notifications
- [ ] Búsqueda global funcional
- [ ] Scanner de QR para identificar máquinas
- [ ] Modo offline con sincronización

### Fase 3 - Optimizaciones:
- [ ] Paginación en listas largas
- [ ] Carga lazy de imágenes
- [ ] Caché inteligente con React Query
- [ ] Optimización de bundle size
- [ ] Análisis de rendimiento

## 🎓 Notas para el Desarrollador Backend

### Datos Mock Incluidos:
- 8 máquinas con diferentes estados
- 7 órdenes de trabajo en varios estados
- 10 repuestos (algunos con stock bajo)
- 4 registros de historial
- 5 proveedores
- 8 notificaciones

### KPIs Calculados (Mock):
- **OEE** (Overall Equipment Effectiveness): 78.5%
- **MTTR** (Mean Time To Repair): 4.2 hrs
- **MTBF** (Mean Time Between Failures): 312 hrs
- **Disponibilidad Operacional**: 91.2%

### Flujos Complejos a Implementar:
1. **Validar Incidencia** → Convertir en OT formal (Analista)
2. **Aprobar OT costosa** → Workflow de aprobación (Coordinador)
3. **Completar OT** → Registrar repuestos usados → Actualizar historial → Decrementar stock
4. **Alerta de stock** → Crear notificación → (Opcional) Email a Coordinador
5. **Mantenimiento programado** → Crear OT preventiva automática al alcanzar horómetro

---

**¡Sistema listo para demostración y fácil integración con backend!** 🚀

Para consultas técnicas, revisa los comentarios en `services/apiService.ts` que indican exactamente dónde conectar cada endpoint.
