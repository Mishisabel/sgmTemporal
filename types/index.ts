export type UserRole = 'Operador' | 'Analista' | 'Coordinador' | 'Gerencia';

export interface User {
  id: string;
  nombre: string;
  email: string;
  password: string;
  rol: UserRole;
  avatarUrl?: string;
}

export interface MaquinariaEstado{
  id_estado?: string;
  estado?: string;
}

export interface Maquinaria {
  id: string;
  nombre: string;
  codigo: string;
  modelo: string;
  fabricante: string;
  fecha_Adquisicion: string;
  estado_actual: String;
  horometro_Actual: number;
  proximoMantenimiento: number;
  imagenUrl?: string;
  horometro_actual: number;
  ubicacion?: string;
  horasOperacion?: number;
  disponibilidad?: number;
  frente: string;
  codigo_activo: string;
  nombre_equipo: string;
  horometro_prox_mtto: number;
  horometro_ultimo_mtto: number;
  proximomantenimiento: number;
  nombre_frente: string;
  
  

}

export type OrdenTrabajoTipo = 'Preventivo' | 'Correctivo' | 'Predictivo';
export type OrdenTrabajoEstado = 'Abierta' | 'En Progreso' | 'Pendiente Repuesto' | 'Cerrada' | 'Cancelada';
export type OrdenTrabajoPrioridad = 'Baja' | 'Media' | 'Alta';

export interface OrdenTrabajo {
  id: string;
  maquinariaId: string;
  maquinariaNombre?: string;
  tipo: OrdenTrabajoTipo;
  descripcionProblema: string;
  descripcionTrabajo?: string;
  estado: OrdenTrabajoEstado;
  prioridad: OrdenTrabajoPrioridad;
  fechaCreacion: string;
  tecnicoAsignado?: string;
  fechaCierre?: string;
  costoEstimado?: number;
  costoReal?: number;
  tiempoEstimado?: number;
  tiempoReal?: number;
  imagenUrl?: string;
}

export interface Repuesto {
  id: string;
  nombre: string;
  sku: string;
  stock: number;
  stockMinimo: number;
  ubicacion: string;
  proveedorId?: string;
  proveedorNombre?: string;
  precio?: number;
  categoria?: string;
  imagenUrl?: string;
}

export interface HistorialMantenimiento {
  id: string;
  ordenTrabajoId: string;
  maquinariaId: string;
  fecha: string;
  detalles: string;
  repuestosUsados: Array<{
    repuestoId: string;
    repuestoNombre?: string;
    cantidad: number;
  }>;
  costoTotal?: number;
  tiempoTotal?: number;
}

export interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  telefono: string;
  email: string;
  direccion?: string;
  tiempoEntrega?: number;
}

export interface Notificacion {
  id: string;
  tipo: 'alerta' | 'info' | 'warning' | 'success';
  titulo: string;
  mensaje: string;
  fecha: string;
  leida: boolean;
  enlace?: string;
}

export interface KPI {
  nombre: string;
  valor: number;
  unidad: string;
  tendencia?: 'up' | 'down' | 'stable';
  cambio?: number;
  objetivo?: number;
}

export interface DashboardData {
  kpis: KPI[];
  ordenesAbiertas: OrdenTrabajo[];
  mantenimientosProximos: Array<{
    maquinariaId: string;
    maquinariaNombre: string;
    fecha: string;
    tipo: string;
  }>;
  alertasInventario: Array<{
    repuestoId: string;
    repuestoNombre: string;
    stock: number;
    stockMinimo: number;
  }>;

  
}
