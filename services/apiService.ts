import type {
  User,
  Maquinaria,
  OrdenTrabajo,
  Repuesto,
  HistorialMantenimiento,
  Proveedor,
  Notificacion,
  DashboardData,
  KPI,
} from "@/types";
import {
  MOCK_MAQUINARIA,
  MOCK_ORDENES_TRABAJO,
  MOCK_REPUESTOS,
  MOCK_HISTORIAL,
  MOCK_PROVEEDORES,
  MOCK_NOTIFICACIONES,
} from "./mockData";
import axios from "axios";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const API_URL = "http://localhost:3001/api";
export const apiService = {
  async getMaquinariaEstados(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/maquinaria/estados`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error fetching maquinaria estados:", error);
      throw new Error("Error fetching maquinaria estados");
    }
  },

  async createMaquinaria(data: Omit<Maquinaria, "id">): Promise<Maquinaria> {
    try {
      const response = await axios.post(
        `${API_URL}/maquinaria/crearMaquinaria`,
        { ...data },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating maquinaria:", error);
      throw new Error("Error creating maquinaria");
    }
  },

  async createOrdenInicioMtto(data: {
    maquinariaId: string;
    descripcionFalla: string;
    fechaInicio: string;
  }): Promise<OrdenTrabajo> {
    try {
      const response = await axios.post(
        `${API_URL}/ordenes/inicio-mtto`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating work order:", error);
      throw error.response?.data || new Error("Error creating work order");
    }
  },

  async getFrentes(): Promise<string[]> {
    try {
      const response = await axios.get(`${API_URL}/maquinaria/frentes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      return response.data;
    } catch (error: any) {
      console.error("Error fetching maquinaria frentes:", error);
      throw new Error("Error fetching maquinaria frentes");
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await axios.post(`${API_URL}/usuarios/login`, {
        correo: email,
        contrasena: password,
      });
      console.log("Login response:", response.data);
      const { token, user } = response.data;

      if (token) {
        localStorage.setItem("authToken", token);
      }

      return user;
    } catch (error) {
      let errorMessage = "Credenciales inválidas";

      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      throw new Error(errorMessage);
    }
  },

  async getMaquinaria(): Promise<Maquinaria[]> {
    try {
      const response = await axios.get(`${API_URL}/maquinaria/dsad`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching maquinaria:", error);
      throw new Error("Error fetching maquinaria");
    }
  },

  async getMaquinariaById(id: string): Promise<Maquinaria | undefined> {
    await delay(200);
    return MOCK_MAQUINARIA.find((m) => m.id === id);
  },

  async updateMaquinaria(
    id: string,
    data: Partial<Maquinaria>
  ): Promise<Maquinaria> {
    await delay(400);
    const index = MOCK_MAQUINARIA.findIndex((m) => m.id === id);
    if (index === -1) throw new Error("Maquinaria no encontrada");
    MOCK_MAQUINARIA[index] = { ...MOCK_MAQUINARIA[index], ...data };
    return MOCK_MAQUINARIA[index];
  },

  async deleteMaquinaria(id: string): Promise<void> {
    await delay(300);
    const index = MOCK_MAQUINARIA.findIndex((m) => m.id === id);
    if (index !== -1) {
      MOCK_MAQUINARIA.splice(index, 1);
    }
  },

  async getOrdenesTrabajoByMaquinaria(
    maquinariaId: string
  ): Promise<OrdenTrabajo[]> {
    await delay(250);
    return MOCK_ORDENES_TRABAJO.filter(
      (ot) => ot.maquinariaId === maquinariaId
    );
  },

  async getOrdenesTrabajo(): Promise<OrdenTrabajo[]> {
    await delay(300);
    return [...MOCK_ORDENES_TRABAJO];
  },

  async getOrdenTrabajoById(id: string): Promise<OrdenTrabajo | undefined> {
    await delay(200);
    return MOCK_ORDENES_TRABAJO.find((ot) => ot.id === id);
  },

  async createOrdenTrabajo(
    data: Omit<OrdenTrabajo, "id">
  ): Promise<OrdenTrabajo> {
    await delay(400);
    const maquina = MOCK_MAQUINARIA.find((m) => m.id === data.maquinariaId);
    const newOT: OrdenTrabajo = {
      id: `ot-${Date.now()}`,
      maquinariaNombre: maquina?.nombre,
      ...data,
    };
    MOCK_ORDENES_TRABAJO.push(newOT);
    return newOT;
  },

  async updateOrdenTrabajo(
    id: string,
    data: Partial<OrdenTrabajo>
  ): Promise<OrdenTrabajo> {
    await delay(400);
    const index = MOCK_ORDENES_TRABAJO.findIndex((ot) => ot.id === id);
    if (index === -1) throw new Error("Orden de trabajo no encontrada");
    MOCK_ORDENES_TRABAJO[index] = { ...MOCK_ORDENES_TRABAJO[index], ...data };
    return MOCK_ORDENES_TRABAJO[index];
  },

  async deleteOrdenTrabajo(id: string): Promise<void> {
    await delay(300);
    const index = MOCK_ORDENES_TRABAJO.findIndex((ot) => ot.id === id);
    if (index !== -1) {
      MOCK_ORDENES_TRABAJO.splice(index, 1);
    }
  },

  async getRepuestos(): Promise<Repuesto[]> {
    await delay(300);
    return [...MOCK_REPUESTOS];
  },

  async getRepuestoById(id: string): Promise<Repuesto | undefined> {
    await delay(200);
    return MOCK_REPUESTOS.find((r) => r.id === id);
  },

  async createRepuesto(data: Omit<Repuesto, "id">): Promise<Repuesto> {
    await delay(400);
    const proveedor = MOCK_PROVEEDORES.find((p) => p.id === data.proveedorId);
    const newRepuesto: Repuesto = {
      id: `rep-${Date.now()}`,
      proveedorNombre: proveedor?.nombre,
      ...data,
    };
    MOCK_REPUESTOS.push(newRepuesto);
    return newRepuesto;
  },

  async updateRepuesto(id: string, data: Partial<Repuesto>): Promise<Repuesto> {
    await delay(400);
    const index = MOCK_REPUESTOS.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Repuesto no encontrado");
    MOCK_REPUESTOS[index] = { ...MOCK_REPUESTOS[index], ...data };
    return MOCK_REPUESTOS[index];
  },

  async deleteRepuesto(id: string): Promise<void> {
    await delay(300);
    const index = MOCK_REPUESTOS.findIndex((r) => r.id === id);
    if (index !== -1) {
      MOCK_REPUESTOS.splice(index, 1);
    }
  },

  async getHistorialByMaquinaria(
    maquinariaId: string
  ): Promise<HistorialMantenimiento[]> {
    await delay(250);
    return MOCK_HISTORIAL.filter((h) => h.maquinariaId === maquinariaId);
  },

  async getHistorial(): Promise<HistorialMantenimiento[]> {
    await delay(300);
    return [...MOCK_HISTORIAL];
  },

  async getProveedores(): Promise<Proveedor[]> {
    await delay(300);
    return [...MOCK_PROVEEDORES];
  },

  async getProveedorById(id: string): Promise<Proveedor | undefined> {
    await delay(200);
    return MOCK_PROVEEDORES.find((p) => p.id === id);
  },

  async createProveedor(data: Omit<Proveedor, "id">): Promise<Proveedor> {
    await delay(400);
    const newProveedor: Proveedor = {
      id: `prv-${Date.now()}`,
      ...data,
    };
    MOCK_PROVEEDORES.push(newProveedor);
    return newProveedor;
  },

  async updateProveedor(
    id: string,
    data: Partial<Proveedor>
  ): Promise<Proveedor> {
    await delay(400);
    const index = MOCK_PROVEEDORES.findIndex((p) => p.id === id);
    if (index === -1) throw new Error("Proveedor no encontrado");
    MOCK_PROVEEDORES[index] = { ...MOCK_PROVEEDORES[index], ...data };
    return MOCK_PROVEEDORES[index];
  },

  async deleteProveedor(id: string): Promise<void> {
    await delay(300);
    const index = MOCK_PROVEEDORES.findIndex((p) => p.id === id);
    if (index !== -1) {
      MOCK_PROVEEDORES.splice(index, 1);
    }
  },

  async getNotificaciones(): Promise<Notificacion[]> {
    // 1. Esperamos 200ms (como en tu código original)
    await delay(200);

    // 2. Obtenemos las notificaciones estáticas (Stock, OT Completada, etc.)
    try {
      // 3. Obtenemos las notificaciones dinámicas del horómetro desde el backend
      const response = await axios.get(`${API_URL}/notificaciones/horometro`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });
      
      const horometerNotifications: Notificacion[] = response.data;

      // 4. Combinamos ambas listas
      const allNotifications = [...horometerNotifications];

      // 5. Ordenamos todas por fecha y las devolvemos
      return allNotifications.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );

    } catch (error) {
      console.error("Error fetching horometro notifications:", error);
      // Si falla el backend, al menos devolvemos las estáticas
      return staticNotifications.sort(
        (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
    }
  },

  async markNotificacionLeida(id: string): Promise<void> {
    await delay(150);
    const notificacion = MOCK_NOTIFICACIONES.find((n) => n.id === id);
    if (notificacion) {
      notificacion.leida = true;
    }
  },

  async updateHorometro(
    maquinariaId: string,
    horometro: number
  ): Promise<Maquinaria> {
    await delay(300);
    return this.updateMaquinaria(maquinariaId, { horometro_Actual: horometro });
  },

  async reportarIncidencia(
    maquinariaId: string,
    descripcion: string,
    imagenUrl?: string
  ): Promise<OrdenTrabajo> {
    await delay(400);
    return this.createOrdenTrabajo({
      maquinariaId,
      tipo: "Correctivo",
      descripcionProblema: descripcion,
      estado: "Abierta",
      prioridad: "Media",
      fechaCreacion: new Date().toISOString().split("T")[0],
      imagenUrl,
    });
  },

  async getDashboardData(rol: string): Promise<DashboardData> {
    await delay(400);

    const kpis: KPI[] = [];

    if (rol === "Gerencia" || rol === "Coordinador") {
      const maquinasOperativas = MOCK_MAQUINARIA.filter(
        (m) => m.estado_actual === ("Operativo" as any)
      ).length;
      const disponibilidadPromedio =
        MOCK_MAQUINARIA.reduce((sum, m) => sum + (m.disponibilidad || 0), 0) /
        MOCK_MAQUINARIA.length;

      kpis.push(
        {
          nombre: "Disponibilidad Operacional",
          valor: parseFloat(disponibilidadPromedio.toFixed(1)),
          unidad: "%",
          tendencia: "up",
          cambio: 2.3,
          objetivo: 90,
        },
        {
          nombre: "OEE",
          valor: 78.5,
          unidad: "%",
          tendencia: "stable",
          cambio: 0.5,
          objetivo: 85,
        },
        {
          nombre: "MTTR",
          valor: 4.2,
          unidad: "hrs",
          tendencia: "down",
          cambio: -0.8,
          objetivo: 4,
        },
        {
          nombre: "MTBF",
          valor: 312,
          unidad: "hrs",
          tendencia: "up",
          cambio: 18,
          objetivo: 300,
        },
        {
          nombre: "Máquinas Operativas",
          valor: maquinasOperativas,
          unidad: `/${MOCK_MAQUINARIA.length}`,
          tendencia: "stable",
        }
      );
    }

    if (rol === "Analista" || rol === "Coordinador") {
      const otAbiertas = MOCK_ORDENES_TRABAJO.filter(
        (ot) => ot.estado === "Abierta" || ot.estado === "En Progreso"
      ).length;

      kpis.push({
        nombre: "OTs Abiertas",
        valor: otAbiertas,
        unidad: "",
        tendencia: "down",
        cambio: -2,
      });
    }

    const ordenesAbiertas = MOCK_ORDENES_TRABAJO.filter(
      (ot) => ot.estado === "Abierta" || ot.estado === "En Progreso"
    ).slice(0, 5);

    const mantenimientosProximos = MOCK_MAQUINARIA.filter(
      (m) =>
        new Date(m.proximoMantenimiento) <=
        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    )
      .map((m) => ({
        maquinariaId: m.id,
        maquinariaNombre: m.nombre,
        fecha: m.proximoMantenimiento,
        tipo: "Preventivo",
      }))
      .slice(0, 5);

    const alertasInventario = MOCK_REPUESTOS.filter(
      (r) => r.stock <= r.stockMinimo
    ).map((r) => ({
      repuestoId: r.id,
      repuestoNombre: r.nombre,
      stock: r.stock,
      stockMinimo: r.stockMinimo,
    }));

    return {
      kpis,
      ordenesAbiertas,
      mantenimientosProximos,
      alertasInventario,
    };
  },

  async getChartData(
    tipo: string,
    periodo: string
  ): Promise<{ labels: string[]; data: number[] }> {
    await delay(300);

    if (tipo === "mantenimientos-mes") {
      return {
        labels: [
          "Ene",
          "Feb",
          "Mar",
          "Abr",
          "May",
          "Jun",
          "Jul",
          "Ago",
          "Sep",
          "Oct",
        ],
        data: [12, 15, 11, 18, 14, 16, 13, 17, 15, 19],
      };
    }

    if (tipo === "disponibilidad") {
      return {
        labels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
        data: [92.5, 89.3, 93.8, 91.2],
      };
    }

    if (tipo === "costos") {
      return {
        labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
        data: [8500, 12300, 9800, 15600, 11200, 13400],
      };
    }

    return { labels: [], data: [] };
  },
};
