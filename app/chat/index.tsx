// app/chat/index.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Menu, User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { apiService } from '@/services/apiService';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'expo-router';
import { ChatUser } from '@/types';

const isWeb = Platform.OS === 'web';

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(isWeb);
  const router = useRouter();

  // Obtenemos la lista de usuarios desde la API
  const { data: users, isLoading } = useQuery({
    queryKey: ['chatUsers'],
    queryFn: () => apiService.getUsuariosChat(),
  });

const handleUserPress = (user: ChatUser) => {
    // Navegamos a la pantalla de chat, pasando el ID y el nombre
    // Hacemos un cast a any para evitar el tipo literal generado por expo-router
    router.push({
      pathname: '/chat/[id]', // <-- 1. Usa el nombre del archivo de la ruta
      params: { 
        id: user.id,          // <-- 2. Pasa el 'id' para llenar [id]
        nombre: user.nombre   // <-- 3. Pasa 'nombre' como parámetro extra
      }
    } as unknown as any);
  };

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
          <Text style={styles.headerTitle}>Iniciar un Chat</Text>
        </View>

        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>Cargando usuarios...</Text>
          ) : (
            users?.map((user) => (
              <Pressable 
                key={user.id} 
                style={styles.card}
                onPress={() => handleUserPress(user)}
              >
                <View style={styles.avatar}>
                  <User size={24} color={Colors.industrial.primary} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>{user.nombre}</Text>
                  <Text style={styles.cardSubtitle}>{user.rol}</Text>
                </View>
              </Pressable>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// Estilos (puedes reusar los de work-orders)
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.industrial.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.industrial.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.industrial.textSecondary,
  },
});