// components/NewWorkOrderModal.tsx
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  ActivityIndicator,
  TextInput
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

  useEffect(() => {
    if (visible) {
      setDescripcion('');
      setError('');
      setIsLoading(false);
    }
  }, [visible]);

  // Almacenamos la fecha de inicio en el momento que se abre el modal
  const inicioMtto = useMemo(() => {
    return new Date();
  }, [visible]); // Se recalcula solo cuando el modal se hace visible


 const getGuatemalaTime = () => {
    const now = new Date();
  
    const guatemalaDateStr = now.toLocaleString("en-US", { timeZone: "America/Guatemala" });
    const guatemalaDate = new Date(guatemalaDateStr);

    return guatemalaDate;
  };



  const [descripcion, setDescripcion] = useState('');

  if (!maquinaria || !user) return null;

  const handleSubmit = async () => {

    if (!descripcion) {
      setError('La descripción es obligatoria.');
      return;
    }
    setIsLoading(true);
    setError('');

    const fechaGuate = getGuatemalaTime(); 

    const year = fechaGuate.getFullYear();
    const month = String(fechaGuate.getMonth() + 1).padStart(2, '0');
    const day = String(fechaGuate.getDate()).padStart(2, '0');
    const hours = String(fechaGuate.getHours()).padStart(2, '0');
    const minutes = String(fechaGuate.getMinutes()).padStart(2, '0');
    const seconds = String(fechaGuate.getSeconds()).padStart(2, '0');
    
    const fechaInicioGuatemala = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    const dataParaAPI = {
      maquinariaId: maquinaria.maquinaria_id.toString(),
      descripcionFalla: descripcion, 
      fechaInicio: fechaInicioGuatemala,
      horometroIngreso: maquinaria.horometro_actual
    };

    try {
     
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

  const isAlreadyInMtto = maquinaria?.estado_actual === 'En mantenimiento';


  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* Overlay para cerrar al presionar fuera */}
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={styles.modalContent}
          
        >
          <Text style={styles.title}>Confirmar Inicio de Mantenimiento</Text>

          <View style={styles.summary}>
            <SummaryRow label="Analista" value={user.nombre} />
            <SummaryRow label="Frente" value={maquinaria.nombre_frente} />
            <SummaryRow label="Máquina" value={maquinaria.nombre_equipo} />
            <SummaryRow label="ID Máquina" value={maquinaria.maquinaria_id.toString()} />
            <SummaryRow label="Horómetro" value={`${maquinaria.horometro_actual} hrs`} />
            <SummaryRow label="Inicio Mtto" value={inicioMtto.toLocaleString("es-GT", { timeZone: "America/Guatemala" })}/>
            <SummaryRow
              label="Nuevo Estado"
              value={isAlreadyInMtto ? "Ya está 'En Mantenimiento'" : "En Mantenimiento"}
              isStatus={true}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Descripción (Falla/Trabajo):</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ej: Falla en sistema hidráulico"
              placeholderTextColor={Colors.industrial.textMuted}
              value={descripcion}
              onChangeText={setDescripcion}
              multiline={true}
              numberOfLines={3}
              editable={!isLoading && !isAlreadyInMtto} // Deshabilitado si ya está en mtto
            />
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          {isAlreadyInMtto && (
            <Text style={styles.warningText}>
              Esta máquina ya se encuentra en mantenimiento.
            </Text>
          )}

          <View style={styles.buttonContainer}>
            <Pressable
              style={({ pressed }) => [styles.button, styles.cancelButton, pressed && styles.pressed]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.confirmButton,
                pressed && styles.pressed,
                (isLoading || isAlreadyInMtto) && styles.disabled // <--- CAMBIO
              ]}
              onPress={handleSubmit}
              disabled={isLoading || isAlreadyInMtto} // <--- CAMBIO
            >
              {isLoading
                ? <ActivityIndicator color={Colors.industrial.text} />
                : <Text style={styles.confirmButtonText}>Confirmar</Text>
              }
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

interface SummaryRowProps {
  label: string;
  value: string | number;
  isStatus?: boolean;
}

const SummaryRow: React.FC<SummaryRowProps> = ({ label, value, isStatus = false }) => (
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
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    color: Colors.industrial.textSecondary,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Colors.industrial.backgroundTertiary,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: Colors.industrial.text,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  warningText: {
    color: Colors.industrial.warning, // Color naranja
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 15,
    fontWeight: '500' as const,
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
    marginBottom: 16,
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