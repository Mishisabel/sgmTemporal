// Archivo: components/NotificationPanel.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  ActivityIndicator,
  Platform
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/apiService';
import type { Notificacion } from '@/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NotificationPanelProps {
  onClose: () => void;
}

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  const insets = useSafeAreaInsets();
  
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notificaciones'],
    queryFn: apiService.getNotificaciones,
    // Opcional: Refresca las notificaciones cada 30 segundos
    refetchInterval: 30000, 
  });

  const getIcon = (tipo: Notificacion['tipo']) => {
    switch (tipo) {
      case 'alerta':
        return <AlertTriangle size={24} color={Colors.industrial.error} />;
      case 'warning':
        return <AlertTriangle size={24} color={Colors.industrial.warning} />;
      case 'success':
        return <CheckCircle size={24} color={Colors.industrial.success} />;
      case 'info':
      default:
        return <Info size={24} color={Colors.industrial.info} />;
    }
  };

  return (
    // Usamos un Pressable como overlay para cerrar al tocar fuera
    <Pressable style={[styles.overlay]} onPress={onClose}>
      <View 
        style={[
          styles.panel, 
          { 
            paddingTop: insets.top || 16, 
            paddingBottom: insets.bottom || 16 
          }
        ]}
        // Evita que el clic en el panel cierre el modal
        onStartShouldSetResponder={() => true} 
      >
        <View style={styles.header}>
          <Text style={styles.title}>Notificaciones</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.industrial.textSecondary} />
          </Pressable>
        </View>
        
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={Colors.industrial.primary} />
          </View>
        ) : !notifications || notifications.length === 0 ? (
          <View style={styles.centered}>
            <Text style={styles.emptyText}>No hay notificaciones nuevas</Text>
          </View>
        ) : (
          <ScrollView style={styles.list}>
            {notifications.map((notif) => (
              <View key={notif.id} style={[
                styles.item, 
                !notif.leida && styles.itemUnread
              ]}>
                <View style={styles.itemIcon}>
                  {getIcon(notif.tipo)}
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemTitle}>{notif.titulo}</Text>
                  <Text style={styles.itemMessage}>{notif.mensaje}</Text>
                  <Text style={styles.itemDate}>
                    {new Date(notif.fecha).toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 1000,
    ...Platform.select({
      web: {
        // En web, 'fixed' funciona mejor para el overlay
        position: 'fixed' as any,
      }
    })
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '90%',
    maxWidth: 360,
    backgroundColor: Colors.industrial.backgroundSecondary,
    borderLeftWidth: 1,
    borderLeftColor: Colors.industrial.border,
    zIndex: 1001,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
      }
    })
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.industrial.border,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
  },
  closeButton: {
    padding: 4,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.industrial.textSecondary,
  },
  list: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.industrial.border,
    gap: 12,
  },
  itemUnread: {
    backgroundColor: Colors.industrial.surface,
  },
  itemIcon: {
    paddingTop: 4,
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.industrial.text,
    marginBottom: 4,
  },
  itemMessage: {
    fontSize: 14,
    color: Colors.industrial.textSecondary,
    marginBottom: 8,
  },
  itemDate: {
    fontSize: 12,
    color: Colors.industrial.textMuted,
  },
});