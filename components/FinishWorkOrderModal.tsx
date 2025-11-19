import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/apiService';
import { useQueryClient } from '@tanstack/react-query';
import type { OrdenTrabajo } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  orden: OrdenTrabajo | null; // <-- Ahora recibimos el objeto completo
}

export default function FinishWorkOrderModal({ visible, onClose, onSave, orden }: Props) {
  const [horometro, setHorometro] = useState('');
  const [trabajo, setTrabajo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  // Efecto para pre-llenar datos al abrir
  useEffect(() => {
    if (visible && orden) {
      // Pre-llenamos con el horómetro actual de la máquina (o el de ingreso si no hay actual)
      const valorInicial = orden.maquinariaHorometro || orden.horometroIngreso || 0;
      setHorometro(String(valorInicial));
      setTrabajo('');
      setError('');
    }
  }, [visible, orden]);

  const handleSave = async () => {
    if (!horometro || !trabajo) {
      setError('Todos los campos son obligatorios');
      return;
    }
    
    // Validación básica: Salida no puede ser menor que Entrada
    if (orden?.horometroIngreso && parseFloat(horometro) < orden.horometroIngreso) {
      setError(`El horómetro de salida no puede ser menor al de ingreso (${orden.horometroIngreso})`);
      return;
    }

    if (!orden?.id) return;

    setIsLoading(true);
    setError('');

    try {
      await apiService.finalizarOrdenTrabajo(orden.id, {
        horometroSalida: parseFloat(horometro),
        trabajoRealizado: trabajo
      });
      
      await queryClient.invalidateQueries({ queryKey: ['ordenes-trabajo'] });
      await queryClient.invalidateQueries({ queryKey: ['maquinaria'] });
      
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al finalizar');
    } finally {
      setIsLoading(false);
    }
  };

  if (!orden) return null;

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>Finalizar Mantenimiento</Text>
          
          {/* --- NUEVA SECCIÓN DE RESUMEN --- */}
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>{orden.maquinariaNombre}</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Código:</Text>
              <Text style={styles.summaryValue}>{orden.maquinariaCodigo}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Modelo:</Text>
              <Text style={styles.summaryValue}>{orden.maquinariaModelo}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Horómetro Inicial:</Text>
              <Text style={styles.summaryValue}>{orden.horometroIngreso} hrs</Text>
            </View>
          </View>
          {/* -------------------------------- */}

          <Text style={styles.label}>Horómetro de Salida:</Text>
          <TextInput
            style={styles.input}
            value={horometro}
            onChangeText={setHorometro}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={Colors.industrial.textMuted}
          />

          <Text style={styles.label}>Trabajo Realizado:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={trabajo}
            onChangeText={setTrabajo}
            multiline
            numberOfLines={3}
            placeholder="Describe el trabajo realizado..."
            placeholderTextColor={Colors.industrial.textMuted}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.buttons}>
            <Pressable onPress={onClose} style={[styles.btn, styles.btnCancel]}>
              <Text style={styles.btnText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={handleSave} style={[styles.btn, styles.btnConfirm]}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Finalizar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: Colors.industrial.surface,
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    maxHeight: '90%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.industrial.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  // Estilos del Resumen
  summaryContainer: {
    backgroundColor: Colors.industrial.background,
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.industrial.primary,
    marginBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  summaryLabel: {
    color: Colors.industrial.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: Colors.industrial.text,
    fontWeight: '600',
    fontSize: 14,
  },
  // Fin estilos resumen
  label: {
    color: Colors.industrial.textSecondary,
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: Colors.industrial.backgroundTertiary,
    color: Colors.industrial.text,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: Colors.industrial.error,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  btn: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: Colors.industrial.surface,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
  },
  btnConfirm: {
    backgroundColor: Colors.industrial.success,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});