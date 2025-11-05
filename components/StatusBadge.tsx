import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';

interface StatusBadgeProps {
  status: string;
  type?: 'maquinaria' | 'orden' | 'prioridad';
  size?: 'small' | 'medium';
}

export default function StatusBadge({ status, type = 'maquinaria', size = 'medium' }: StatusBadgeProps) {
  const getStatusColor = () => {
    if (type === 'maquinaria') {
      switch (status) {
        case 'Activo':
          return Colors.industrial.statusOperativo;
        case 'En Mantenimiento':
          return Colors.industrial.statusMantenimiento;
        case 'Averiado':
          return Colors.industrial.statusAveriado;
        case 'Fuera de Servicio':
          return Colors.industrial.statusFueraServicio;
        default:
          return Colors.industrial.textSecondary;
      }
    }
    
    if (type === 'orden') {
      switch (status) {
        case 'Abierta':
          return Colors.industrial.info;
        case 'En Progreso':
          return Colors.industrial.primary;
        case 'Pendiente Repuesto':
          return Colors.industrial.warning;
        case 'Cerrada':
          return Colors.industrial.success;
        case 'Cancelada':
          return Colors.industrial.textMuted;
        default:
          return Colors.industrial.textSecondary;
      }
    }
    
    if (type === 'prioridad') {
      switch (status) {
        case 'Alta':
          return Colors.industrial.prioridadAlta;
        case 'Media':
          return Colors.industrial.prioridadMedia;
        case 'Baja':
          return Colors.industrial.prioridadBaja;
        default:
          return Colors.industrial.textSecondary;
      }
    }
    
    return Colors.industrial.textSecondary;
  };

  const color = getStatusColor();
  const isSmall = size === 'small';

  return (
    <View style={[
      styles.container,
      { backgroundColor: `${color}20` },
      isSmall && styles.containerSmall,
    ]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[
        styles.text,
        { color },
        isSmall && styles.textSmall,
      ]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  textSmall: {
    fontSize: 11,
  },
});
