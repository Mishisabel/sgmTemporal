import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Menu, Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/apiService';
import Sidebar from '@/components/Sidebar';
import StatusBadge from '@/components/StatusBadge';

const isWeb = Platform.OS === 'web';

export default function WorkOrdersScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(isWeb);

  const { data: ordenes, isLoading } = useQuery({
    queryKey: ['ordenes-trabajo'],
    queryFn: () => apiService.getOrdenesTrabajo(),
  });

  return (
    <View style={styles.container}>
      {sidebarOpen && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}
      
      <View style={styles.mainContent}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          {!isWeb && (
            <Pressable onPress={() => setSidebarOpen(!sidebarOpen)} style={styles.menuButton}>
              <Menu size={24} color={Colors.industrial.text} />
            </Pressable>
          )}
          
          <Text style={styles.headerTitle}>Órdenes de Trabajo</Text>
          
          <Pressable style={styles.addButton}>
            <Plus size={20} color={Colors.industrial.text} />
          </Pressable>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>Cargando...</Text>
          ) : (
            ordenes?.map((orden) => (
              <Pressable key={orden.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{orden.id}</Text>
                  <StatusBadge status={orden.prioridad} type="prioridad" size="small" />
                </View>
                <Text style={styles.cardSubtitle}>{orden.maquinariaNombre}</Text>
                <Text style={styles.cardDescription} numberOfLines={2}>
                  {orden.descripcionProblema}
                </Text>
                <View style={styles.cardFooter}>
                  <StatusBadge status={orden.estado} type="orden" size="small" />
                  <Text style={styles.cardDate}>{orden.fechaCreacion}</Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.industrial.background,
    flexDirection: isWeb ? 'row' : 'column',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
    fontWeight: '700' as const,
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingText: {
    color: Colors.industrial.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: Colors.industrial.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
  },
  cardSubtitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.industrial.primary,
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.industrial.textSecondary,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: Colors.industrial.textMuted,
  },
});
