import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Menu, Plus, Phone, Mail, MapPin } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/apiService';
import Sidebar from '@/components/Sidebar';

const isWeb = Platform.OS === 'web';

export default function SuppliersScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(isWeb);

  const { data: proveedores, isLoading } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => apiService.getProveedores(),
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
          
          <Text style={styles.headerTitle}>Proveedores</Text>
          
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
            proveedores?.map((proveedor) => (
              <Pressable key={proveedor.id} style={styles.card}>
                <Text style={styles.cardTitle}>{proveedor.nombre}</Text>
                <Text style={styles.cardSubtitle}>Contacto: {proveedor.contacto}</Text>
                
                <View style={styles.cardDetails}>
                  <View style={styles.cardDetailRow}>
                    <Phone size={16} color={Colors.industrial.textMuted} />
                    <Text style={styles.cardDetailText}>{proveedor.telefono}</Text>
                  </View>
                  <View style={styles.cardDetailRow}>
                    <Mail size={16} color={Colors.industrial.textMuted} />
                    <Text style={styles.cardDetailText}>{proveedor.email}</Text>
                  </View>
                  {proveedor.direccion && (
                    <View style={styles.cardDetailRow}>
                      <MapPin size={16} color={Colors.industrial.textMuted} />
                      <Text style={styles.cardDetailText}>{proveedor.direccion}</Text>
                    </View>
                  )}
                </View>

                {proveedor.tiempoEntrega !== undefined && (
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardFooterText}>
                      Tiempo de entrega: {proveedor.tiempoEntrega} días
                    </Text>
                  </View>
                )}
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.industrial.textSecondary,
    marginBottom: 12,
  },
  cardDetails: {
    gap: 8,
    marginBottom: 12,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardDetailText: {
    fontSize: 13,
    color: Colors.industrial.textSecondary,
    flex: 1,
  },
  cardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.industrial.border,
  },
  cardFooterText: {
    fontSize: 12,
    color: Colors.industrial.primary,
    fontWeight: '600' as const,
  },
});
