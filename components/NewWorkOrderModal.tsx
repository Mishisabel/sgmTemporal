// components/NewWorkOrderModal.tsx
import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Modal, 
  ActivityIndicator
} from 'react-native';
import Colors from '@/constants/colors';
import type { Maquinaria, User } from '@/types';
import { apiService } from '@/services/apiService';
import { useQueryClient } from '@tanstack/react-query';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  maquinaria: Maquinaria | null;
  user: User | null;
}

export default function NewWorkOrderModal({ visible, onClose, onSave, maquinaria, user }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // Almacenamos la fecha de inicio en el momento que se abre el modal
  const inicioMtto = useMemo(() => {
    return new Date();
  }, [visible]); // Se recalcula solo cuando el modal se hace visible

  if (!maquinaria || !user) return null;

  const handleSubmit = async () => {
    setIsLoading(true);
    setError('');

    const dataParaAPI = {
      maquinariaId: maquinaria.maquinaria_id,
      descripcionFalla: `Inicio de mantenimiento para ${maquinaria.nombre_equipo}`,
      fechaInicio: inicioMtto.toISOString(),
    };

    try {
      // 1. Llamamos a la nueva función del apiService (que crearemos en el paso 2.2)
      await apiService.createOrdenInicioMtto(dataParaAPI);

      // 2. Refrescamos la lista de maquinaria para ver el estado actualizado
      await queryClient.invalidateQueries({ queryKey: ['maquinaria'] });

      // 3. Llamamos a onSave (que podría hacer más cosas) y cerramos
      onSave();
      onClose();

    } catch (err) {
      setError('Error al crear la orden de trabajo. Intente de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Overlay para cerrar al presionar fuera */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <View 
          style={styles.modalContent}
          // Evita que el clic en el modal cierre el modal
          onStartShouldSetResponder={() => true}
        >
          <Text style={styles.title}>Confirmar Inicio de Mantenimiento</Text>
          
          <View style={styles.summary}>
            <SummaryRow label="Analista" value={user.nombre} />
            <SummaryRow label="Frente" value={maquinaria.nombre_frente} />
            <SummaryRow label="Máquina" value={maquinaria.nombre_equipo} />
            <SummaryRow label="ID Máquina" value={maquinaria.maquinaria_id.toString()} />
            <SummaryRow label="Horómetro" value={`${maquinaria.horometro_actual} hrs`} />
            <SummaryRow label="Inicio Mtto" value={inicioMtto.toLocaleString()} />
            <SummaryRow label="Nuevo Estado" value="En Mantenimiento" isStatus={true} />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.button, styles.confirmButton, pressed && styles.pressed, isLoading && styles.disabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading 
                ? <ActivityIndicator color={Colors.industrial.text} /> 
                : <Text style={styles.confirmButtonText}>Confirmar</Text>
              }
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

// Pequeño componente helper para las filas del resumen
const SummaryRow = ({ label, value, isStatus = false }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}:</Text>
    <Text style={[styles.value, isStatus && styles.statusValue]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.industrial.surface,
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  summary: {
    marginBottom: 24,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: Colors.industrial.textSecondary,
    fontWeight: '500' as const,
  },
  value: {
    fontSize: 16,
    color: Colors.industrial.text,
    fontWeight: '600' as const,
  },
  statusValue: {
    color: Colors.industrial.statusMantenimiento, // Azul
    fontWeight: '700' as const,
  },
  errorText: {
    color: Colors.industrial.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  cancelButton: {
    backgroundColor: Colors.industrial.backgroundTertiary,
  },
  cancelButtonText: {
    color: Colors.industrial.textSecondary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  confirmButton: {
    backgroundColor: Colors.industrial.primary,
  },
  confirmButtonText: {
    color: Colors.industrial.text,
    fontSize: 16,
    fontWeight: '700' as const,
  },
});