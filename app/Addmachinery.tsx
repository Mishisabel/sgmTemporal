import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Modal, // Importamos el Modal de React Native
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors"; // Asumiendo que tienes este archivo
import { apiService } from "../services/apiService"; // Importa tu servicio de API
import type { Maquinaria, MaquinariaEstado } from "@/types"; // Asumiendo que tienes este tipo

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
  fechaAdquisicion: "", // Puedes poner un valor por defecto si quieres
  estado: "Operativo", // Valor por defecto
  horometroActual: 0,
};

// Props que el componente recibirá
interface MaquinariaFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: () => void; // Para refrescar la lista después de guardar
}

export default function MaquinariaFormModal({
  visible,
  onClose,
  onSave,
}: MaquinariaFormModalProps) {
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<MaquinariaFormData>(initialState);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Resetea el formulario cuando el modal se cierra
  useEffect(() => {
    if (!visible) {
      setFormData(initialState);
      setError("");
      setIsLoading(false);
    }
  }, [visible]);

  // Manejador genérico para los campos de texto
  const handleTextChange = (field: keyof MaquinariaFormData, value: string) => {
    // Manejo especial para el horómetro
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
    // Validación simple
    if (!formData.codigoActivo || !formData.nombreEquipo) {
      setError("Código Activo y Nombre Equipo son obligatorios");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
         const payload: Omit<Maquinaria, "id"> = {
        nombre: "Cosechadora",
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
        proximomantenimiento: 0,
        horometro_prox_mtto: 0,
        horometro_ultimo_mtto: 0,
        maquinaria_id: 0
      };

      await apiService.createMaquinaria(payload);

      onSave(); // Llama a la función para refrescar la lista
      onClose(); // Cierra el modal
    } catch (err: any) {
      setError(err.message || "Error al guardar la maquinaria");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose} // Para el botón 'atrás' de Android
    >
      {/* Overlay oscuro */}
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          {/* Contenido del Modal */}
          <View
            style={[
              styles.modalContent,
              {
                paddingTop: insets.top || 20,
                paddingBottom: insets.bottom || 20,
              },
            ]}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              <Text style={styles.title}>Agregar Maquinaria</Text>

              <View style={styles.form}>
                {/* Repite este bloque para cada campo */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Frente</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Mina Norte"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.frente}
                    onChangeText={(val) => handleTextChange("frente", val)}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Código Activo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: CAT-797-01"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.codigoActivo}
                    onChangeText={(val) =>
                      handleTextChange("codigoActivo", val)
                    }
                    autoCapitalize="characters"
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre Equipo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Camión Minero 01"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.nombreEquipo}
                    onChangeText={(val) =>
                      handleTextChange("nombreEquipo", val)
                    }
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Modelo</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 797F"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.modelo}
                    onChangeText={(val) => handleTextChange("modelo", val)}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Fabricante</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: Caterpillar"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.fabricante}
                    onChangeText={(val) => handleTextChange("fabricante", val)}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Fecha Adquisición</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.fechaAdquisicion}
                    onChangeText={(val) =>
                      handleTextChange("fechaAdquisicion", val)
                    }
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Estado Actual</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Operativo / En Mantenimiento"
                    placeholderTextColor={Colors.industrial.textMuted}
                    value={formData.estado}
                    onChangeText={(val) => handleTextChange("estado", val)}
                    editable={!isLoading}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Horómetro Actual</Text>
                  <TextInput
                    style={styles.input}
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
                {/* Fin de los campos */}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <View style={styles.buttonContainer}>
                  {/* Botón de Cancelar */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.cancelButton,
                      pressed && styles.cancelButtonPressed,
                    ]}
                    onPress={onClose}
                    disabled={isLoading}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </Pressable>

                  {/* Botón de Guardar */}
                  <Pressable
                    style={({ pressed }) => [
                      styles.saveButton,
                      pressed && styles.saveButtonPressed,
                      isLoading && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color={Colors.industrial.text} />
                    ) : (
                      <Text style={styles.saveButtonText}>Guardar</Text>
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

// Estilos inspirados en tu LoginScreen
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end", // Sube el modal desde abajo (o 'center' para centrarlo)
  },
  keyboardView: {
    flex: 1,
    justifyContent: "flex-end", // Asegura que el KAV funcione bien
  },
  modalContent: {
    backgroundColor: Colors.industrial.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 24,
    maxHeight: "90%", // Límite de altura
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 20,
  },
  scrollContent: {
    paddingBottom: 20, // Espacio extra al final del scroll
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
  // Estilo para el botón de Guardar (similar a tu loginButton)
  saveButton: {
    backgroundColor: Colors.industrial.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flex: 1, // Ocupa espacio
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
  // Estilo para el botón de Cancelar (botón secundario)
  cancelButton: {
    backgroundColor: Colors.industrial.surface,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    flex: 1, // Ocupa espacio
    marginRight: 8,
  },
  cancelButtonPressed: {
    backgroundColor: Colors.industrial.surfaceHover, // Necesitarías este color
  },
  cancelButtonText: {
    color: Colors.industrial.textSecondary,
    fontSize: 16,
    fontWeight: "700" as const,
    textTransform: "uppercase" as const,
  },
});
