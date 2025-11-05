import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Menu, Plus, AlertTriangle } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/apiService';
import Sidebar from '@/components/Sidebar';

const isWeb = Platform.OS === 'web';

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(isWeb);

  const { data: repuestos, isLoading } = useQuery({
    queryKey: ['repuestos'],
    queryFn: () => apiService.getRepuestos(),
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
          
          <Text style={styles.headerTitle}>Inventario</Text>
          
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
            repuestos?.map((repuesto) => {
              const isLowStock = repuesto.stock <= repuesto.stockMinimo;
              return (
                <Pressable key={repuesto.id} style={[
                  styles.card,
                  isLowStock && styles.cardAlert,
                ]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <Text style={styles.cardSku}>{repuesto.sku}</Text>
                      <Text style={styles.cardTitle}>{repuesto.nombre}</Text>
                    </View>
                    {isLowStock && (
                      <View style={styles.alertBadge}>
                        <AlertTriangle size={16} color={Colors.industrial.warning} />
                      </View>
                    )}
                  </View>
                  
                  <View style={styles.cardDetails}>
                    <View style={styles.cardDetailRow}>
                      <Text style={styles.cardDetailLabel}>Stock:</Text>
                      <Text style={[
                        styles.cardDetailValue,
                        isLowStock && styles.cardDetailValueAlert,
                      ]}>
                        {repuesto.stock} / {repuesto.stockMinimo}
                      </Text>
                    </View>
                    {repuesto.ubicacion && (
                      <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>Ubicación:</Text>
                        <Text style={styles.cardDetailValue}>{repuesto.ubicacion}</Text>
                      </View>
                    )}
                    {repuesto.precio && (
                      <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>Precio:</Text>
                        <Text style={styles.cardDetailValue}>${repuesto.precio}</Text>
                      </View>
                    )}
                    {repuesto.proveedorNombre && (
                      <View style={styles.cardDetailRow}>
                        <Text style={styles.cardDetailLabel}>Proveedor:</Text>
                        <Text style={styles.cardDetailValue}>{repuesto.proveedorNombre}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })
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
  cardAlert: {
    borderColor: Colors.industrial.warning,
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  cardSku: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.industrial.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
    marginTop: 4,
  },
  alertBadge: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: `${Colors.industrial.warning}20`,
  },
  cardDetails: {
    gap: 8,
  },
  cardDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardDetailLabel: {
    fontSize: 13,
    color: Colors.industrial.textMuted,
  },
  cardDetailValue: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.industrial.text,
  },
  cardDetailValueAlert: {
    color: Colors.industrial.warning,
  },
});
