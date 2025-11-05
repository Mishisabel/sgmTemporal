import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Menu, Plus, Search, Filter } from "lucide-react-native";
import Colors from "@/constants/colors";
import { apiService } from "@/services/apiService";
import type { Maquinaria, MaquinariaEstado } from "@/types";
import Sidebar from "@/components/Sidebar";
import StatusBadge from "@/components/StatusBadge";
import { Image } from "expo-image";

const isWeb = Platform.OS === "web";

export default function MachineryScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(isWeb);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    data: maquinaria,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["maquinaria"],
    queryFn: () => apiService.getMaquinaria(),
  });

  const filteredMaquinaria = maquinaria?.filter(
    (m) =>
      m.nombre_equipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.codigo_activo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nombre_frente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.estado_actual.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.horometro_actual.toString().includes(searchQuery.toString()) ||
      m.proximomantenimiento.toString().includes(searchQuery.toString())
  );
  console.log("Maquinaria filtrada:", filteredMaquinaria);

  const handleSaveSuccess = () => {
    refetch();
  };

  return (
    <View style={styles.container}>
      {sidebarOpen && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <View style={styles.mainContent}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          {!isWeb && (
            <Pressable
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuButton}
            >
              <Menu size={24} color={Colors.industrial.text} />
            </Pressable>
          )}

          <Text style={styles.headerTitle}>Maquinaria</Text>

          <Pressable
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Plus size={20} color={Colors.industrial.text} />
          </Pressable>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={20} color={Colors.industrial.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por nombre o código..."
              placeholderTextColor={Colors.industrial.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <Pressable style={styles.filterButton}>
            <Filter size={20} color={Colors.industrial.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          nativeID="mi-lista-scroll"
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {filteredMaquinaria?.map((maq) => (
                <Pressable key={maq.id} style={styles.card}>
                  {maq.imagenUrl && (
                    <Image
                      source={{ uri: maq.imagenUrl }}
                      style={styles.cardImage}
                      contentFit="cover"
                    />
                  )}
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cardCode}>{maq.codigo_activo} - {maq.nombre_frente}</Text>
                        <Text style={styles.cardTitle}>{maq.nombre_equipo}</Text>
                      </View>
                      <StatusBadge
                        status={String(maq.estado_actual) || "Desconocido"}//cambiaarrrrrrrr
                        type="maquinaria"
                        size="small"
                      />
                    </View>

                    <View style={styles.cardDetails}>
                      <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>Modelo:</Text>
                        <Text style={styles.cardDetailValue}>{maq.modelo}</Text>
                      </View>
                      <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>Horómetro:</Text>
                        <Text style={styles.cardDetailValue}>
                          {maq.horometro_actual} hrs
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.cardFooterText}>
                        Próximo mantenimiento:{" "}
                       {maq.proximomantenimiento - maq.horometro_actual} hrs
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <MaquinariaFormModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveSuccess}
      />
    </View>
  );
}

// Interfaz para los datos del formulario
interface MaquinariaFormData {
  frente: string;
  codigoActivo: string;
  nombreEquipo: string;
  modelo: string;
  fabricante: string;
  fechaAdquisicion: string;
  estado: string;
  horometroActual: number;
}

// Estado inicial para el formulario
const initialState: MaquinariaFormData = {
  frente: "",
  codigoActivo: "",
  nombreEquipo: "",
  modelo: "",
  fabricante: "",
  fechaAdquisicion: "",
  estado: "Operativo",
  horometroActual: 0,
};

// Props que el componente recibirá
interface MaquinariaFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
}

function MaquinariaFormModal({
  visible,
  onClose,
  onSave,
}: MaquinariaFormModalProps) {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<MaquinariaFormData>(initialState);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEstadoPickerOpen, setIsEstadoPickerOpen] = useState(false);
  const [isCodigoPickerOpen, setIsCodigoPickerOpen] = useState(false);
  const [isFrentePickerOpen, setIsFrentePickerOpen] = useState(false);

  // Tipos para los pickers retornados por la API
  interface Estado {
    id_estado: string;
    estado: string;
  }
  interface Frente {
    frente_id: string;
    nombre_frente: string;
  }

  const [dataestados, setDataestados] = useState<Estado[]>([]);
  const [datafrentes, setDatafrentes] = useState<Frente[]>([]);

  // Resetea el formulario cuando el modal se cierra
  useEffect(() => {
    if (!visible) {
      setFormData(initialState);
      setError("");
      setIsLoading(false);
    }
  }, [visible]);

  useEffect(() => {
    {
    }
    const fetchData = async () => {
      try {
        const estados = await apiService.getMaquinariaEstados();

        // Normaliza la respuesta en caso de que la API devuelva string[]
        let normalizedEstados: Estado[] = [];
        if (Array.isArray(estados)) {
          if (estados.length > 0 && typeof estados[0] === "string") {
            normalizedEstados = (estados as string[]).map((e, i) => ({
              id_estado: String(i),
              estado: e,
            }));
          } else {
            normalizedEstados = estados as unknown as Estado[];
          }
        }

        setDataestados(normalizedEstados);

        const frentes = await apiService.getFrentes();

        // Normaliza la respuesta de frentes en caso de que la API devuelva string[]
        let normalizedFrentes: Frente[] = [];
        if (Array.isArray(frentes)) {
          if (frentes.length > 0 && typeof frentes[0] === "string") {
            normalizedFrentes = (frentes as string[]).map((f, i) => ({
              frente_id: String(i),
              nombre_frente: f,
            }));
          } else {
            normalizedFrentes = frentes as unknown as Frente[];
          }
        }

        setDatafrentes(normalizedFrentes);
      } catch (error) {
        console.error("Error fetching estados:", error);
      }
    };
    fetchData();
  }, []);

  // Manejador genérico para los campos de texto
  const handleTextChange = (field: keyof MaquinariaFormData, value: string) => {
    if (field === "horometroActual") {
      const numValue = parseInt(value.replace(/[^0-9]/g, ""), 10);
      setFormData((prev) => ({
        ...prev,
        [field]: isNaN(numValue) ? 0 : numValue,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };


  const handleSave = async () => {
    if (!formData.codigoActivo || !formData.nombreEquipo) {
      setError("Código Activo y Nombre Equipo son obligatorios");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      // Construye el payload con todos los campos requeridos por Omit<Maquinaria, 'id'>
      const payload: Omit<Maquinaria, "id"> = {
        nombre: formData.nombreEquipo,
        codigo: formData.codigoActivo,
        frente: formData.frente,
        modelo: formData.modelo,
        fabricante: formData.fabricante,
        fecha_Adquisicion: formData.fechaAdquisicion,
        estado_actual: formData.estado,
        horometro_Actual: formData.horometroActual,
        proximoMantenimiento: 0,
        codigo_activo: "",
        nombre_equipo: "",
        horometro_actual: 0,
        nombre_frente: "",
        proximomantenimiento: 0
      };

      console.log("Payload a enviar:", payload);
      await apiService.createMaquinaria(payload);

      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error al guardar la maquinaria");
    } finally {
      setIsLoading(false);
    }
  };
  const selectedFrenteObjeto = datafrentes.find(
    (f) => f.frente_id === formData.frente
  );

  const selectedEstadoObjeto = dataestados.find(
    (e) => e.id_estado === formData.estado
  );

  // Obtén el nombre de ese objeto. Si no se encuentra, será undefined.
  const estadoDisplay = selectedEstadoObjeto?.estado;

  // Obtén el nombre de ese objeto. Si no se encuentra, será undefined.
  const frenteNombreDisplay = selectedFrenteObjeto?.nombre_frente;
  //

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={modalStyles.keyboardView}
        >
          <View
            style={[
              modalStyles.modalContent,
              {
                paddingTop: insets.top || 20,
                paddingBottom: insets.bottom || 20,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={modalStyles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={modalStyles.title}>Agregar Maquinaria</Text>

              <View style={modalStyles.form}>
                {/* Frente */}

                <View style={modalStyles.inputGroup}>
                  <Text style={modalStyles.label}>Frente</Text>
                  <Pressable
                    style={({ pressed }) => [
                      modalStyles.input,
                      modalStyles.pickerInput,
                      pressed && modalStyles.cancelButtonPressed,
                    ]}
                    onPress={() => setIsFrentePickerOpen(true)}
                    disabled={isLoading}
                  >
                    <Text style={modalStyles.pickerInputText}>
                      {/* Muestra el valor seleccionado o el placeholder */}
                      {frenteNombreDisplay || "Seleccione un frente..."}
                    </Text>
                  </Pressable>
                </View>

                <Modal
                  transparent={true}
                  visible={isFrentePickerOpen}
                  animationType="slide" // Animación sutil
                  onRequestClose={() => setIsFrentePickerOpen(false)}
                >
                  {/* Overlay oscuro para el modal-lista */}
                  <Pressable
                    style={modalStyles.pickerOverlay}
                    onPress={() => setIsFrentePickerOpen(false)} // Cierra al tocar fuera
                  >
                    <View style={modalStyles.pickerContent}>
                      {/* Aquí es donde tu API llenará los datos en el futuro */}
                      {datafrentes.map((opcion) => (
                        <Pressable
                          key={opcion.frente_id}
                          style={({ pressed }) => [
                            modalStyles.pickerItem,
                            pressed && modalStyles.pickerItemPressed,
                          ]}
                          onPress={() => {
                            handleTextChange("frente", opcion.frente_id); // Usa tu función existente
                            setIsFrentePickerOpen(false); // Cierra el modal-lista
                          }}
                        >
                          <Text style={modalStyles.pickerItemText}>
                            {opcion.nombre_frente}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Pressable>
                </Modal>

                {/* Código Activo */}
                <View style={modalStyles.inputGroup}>
                  <Text style={modalStyles.label}>Código Activo</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Ej: CAT-1234"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.codigoActivo}
                    onChangeText={(val) =>
                      handleTextChange("codigoActivo", val)
                    }
                    editable={!isLoading}
                  />
                </View>
                {/* Nombre Equipo */}
                <View style={modalStyles.inputGroup}>
                  <Text style={modalStyles.label}>Nombre Equipo</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Ej: Camión Minero 01"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.nombreEquipo}
                    onChangeText={(val) =>
                      handleTextChange("nombreEquipo", val)
                    }
                    editable={!isLoading}
                  />
                </View>

                {/* Modelo */}
                <View style={modalStyles.inputGroup}>
                  <Text style={modalStyles.label}>Modelo</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Ej: 797F"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.modelo}
                    onChangeText={(val) => handleTextChange("modelo", val)}
                    editable={!isLoading}
                  />
                </View>

                {/* Fabricante */}
                <View style={modalStyles.inputGroup}>
                  <Text style={modalStyles.label}>Fabricante</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="Ej: Caterpillar"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.fabricante}
                    onChangeText={(val) => handleTextChange("fabricante", val)}
                    editable={!isLoading}
                  />
                </View>

                {/* Fecha Adquisición */}
                <View style={modalStyles.inputGroup}>
                  <Text style={modalStyles.label}>Fecha Adquisición</Text>
                  <input
                    style={modalStyles.input}
                    type="date"
                    value={formData.fechaAdquisicion}
                    // Cambiamos onChangeText por onChange
                    onChange={(event) =>
                      // El valor ahora viene de event.target.value
                      handleTextChange("fechaAdquisicion", event.target.value)
                    }
                  />
                </View>

                {/* Estado Actual */}
                <View style={modalStyles.inputGroup}>
                  <Text style={modalStyles.label}>Estado Actual</Text>
                  <Pressable
                    style={({ pressed }) => [
                      modalStyles.input,
                      modalStyles.pickerInput,
                      pressed && modalStyles.cancelButtonPressed,
                    ]}
                    onPress={() => setIsEstadoPickerOpen(true)}
                    disabled={isLoading}
                  >
                    <Text style={modalStyles.pickerInputText}>
                      {estadoDisplay || "Seleccione un estado..."}
                    </Text>
                  </Pressable>
                </View>
                <Modal
                  transparent={true}
                  visible={isEstadoPickerOpen}
                  animationType="slide" // Animación sutil
                  onRequestClose={() => setIsEstadoPickerOpen(false)}
                >
                  {/* Overlay oscuro para el modal-lista */}
                  <Pressable
                    style={modalStyles.pickerOverlay}
                    onPress={() => setIsEstadoPickerOpen(false)}
                  >
                    <View style={modalStyles.pickerContent}>
                      {dataestados.map((estado) => (
                        <Pressable
                          key={estado.id_estado}
                          style={({ pressed }) => [
                            modalStyles.pickerItem,
                            pressed && modalStyles.pickerItemPressed,
                          ]}
                          onPress={() => {
                            handleTextChange("estado", estado.id_estado);
                            setIsEstadoPickerOpen(false);
                          }}
                        >
                          <Text style={modalStyles.pickerItemText}>
                            {estado.estado}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </Pressable>
                </Modal>

                {/* Horómetro Actual */}
                <View style={modalStyles.inputGroup}>
                  <Text style={modalStyles.label}>Horómetro Actual</Text>
                  <TextInput
                    style={modalStyles.input}
                    placeholder="0"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={String(formData.horometroActual)}
                    onChangeText={(val) =>
                      handleTextChange("horometroActual", val)
                    }
                    keyboardType="numeric"
                    editable={!isLoading}
                  />
                </View>

                {error ? (
                  <Text style={modalStyles.errorText}>{error}</Text>
                ) : null}

                <View style={modalStyles.buttonContainer}>
                  <Pressable
                    style={({ pressed }) => [
                      modalStyles.cancelButton,
                      pressed && modalStyles.cancelButtonPressed,
                    ]}
                    onPress={onClose}
                    disabled={isLoading}
                  >
                    <Text style={modalStyles.cancelButtonText}>Cancelar</Text>
                  </Pressable>

                  <Pressable
                    style={({ pressed }) => [
                      modalStyles.saveButton,
                      pressed && modalStyles.saveButtonPressed,
                      isLoading && modalStyles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={Colors.industrial.text} />
                    ) : (
                      <Text style={modalStyles.saveButtonText}>Guardar</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  pickerInput: {
    justifyContent: "center", // Centra el texto verticalmente
  },
  pickerInputText: {
    fontSize: 16,
    color: Colors.industrial.text,
  },

  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  // Contenedor blanco para la lista
  pickerContent: {
    backgroundColor: Colors.industrial.surface,
    borderRadius: 12,
    padding: 16,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },

  // Cada fila de la lista
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pickerItemPressed: {
    backgroundColor: Colors.industrial.surfaceHover, // Color al presionar
  },
  pickerItemText: {
    color: Colors.industrial.text,
    fontSize: 16,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: Colors.industrial.background,
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    height: "70%",
    width: "90%",
    maxWidth: 600,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.industrial.text,
    textAlign: "center",
    marginBottom: 24,
  },
  form: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.industrial.textSecondary,
    marginBottom: 8,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.industrial.surface,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: Colors.industrial.text,
  },
  errorText: {
    color: Colors.industrial.error,
    fontSize: 14,
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  saveButton: {
    backgroundColor: Colors.industrial.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginLeft: 8,
  },
  saveButtonPressed: {
    backgroundColor: Colors.industrial.primaryDark,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: Colors.industrial.text,
    fontSize: 16,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
  },
  cancelButton: {
    backgroundColor: Colors.industrial.surface,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  cancelButtonPressed: {
    backgroundColor: Colors.industrial.surfaceHover,
  },
  cancelButtonText: {
    color: Colors.industrial.textSecondary,
    fontSize: 16,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.industrial.background,
    flexDirection: isWeb ? "row" : "column",
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.industrial.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.industrial.border,
  },
  menuButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.industrial.text,
    flex: 1,
    ...Platform.select({
      web: { marginLeft: 0 },
      default: { marginLeft: 12 },
    }),
  },
  addButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.industrial.primary,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
    backgroundColor: Colors.industrial.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.industrial.border,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.industrial.surface,
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.industrial.text,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: Colors.industrial.surface,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.industrial.textSecondary,
    fontSize: 16,
  },
  grid: {
    gap: 16,
    ...Platform.select({
      web: {
        flexDirection: "row",
        flexWrap: "wrap",
      },
      default: {
        flexDirection: "column",
      },
    }),
  },
  card: {
    backgroundColor: Colors.industrial.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    overflow: "hidden",
    ...Platform.select({
      web: {
        flexBasis: "33.333%",
        maxWidth: "33.333%",
        minWidth: 300,
        marginRight: 16,
      },
      default: {
        width: "100%",
      },
    }),
  },
  cardImage: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.industrial.backgroundTertiary,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  cardCode: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: Colors.industrial.primary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.industrial.text,
    marginTop: 2,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  cardDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardDetailLabel: {
    fontSize: 13,
    color: Colors.industrial.textMuted,
  },
  cardDetailValue: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.industrial.text,
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.industrial.border,
  },
  cardFooterText: {
    fontSize: 12,
    color: Colors.industrial.textSecondary,
  },
});
