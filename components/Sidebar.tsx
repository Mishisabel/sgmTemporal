import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import {
  LayoutDashboard,
  Settings,
  Package,
  ClipboardList,
  TrendingUp,
  Users,
  LogOut,
  MessageSquare,
  Menu,
  X,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  roles: string[];
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} color={Colors.industrial.textSecondary} />,
      href: '/dashboard',
      roles: ['Operador', 'Analista', 'Coordinador', 'Gerencia'],
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare size={20} color={Colors.industrial.textSecondary} />,
      href: '/chat',
      roles: ['Operador', 'Analista', 'Coordinador', 'Gerencia'], // Todos pueden chatear
    },
    {
      id: 'machinery',
      label: 'Maquinaria',
      icon: <Settings size={20} color={Colors.industrial.textSecondary} />,
      href: '/machinery',
      roles: ['Analista', 'Coordinador', 'Gerencia'],
    },
    {
      id: 'work-orders',
      label: 'Órdenes de Trabajo',
      icon: <ClipboardList size={20} color={Colors.industrial.textSecondary} />,
      href: '/work-orders',
      roles: ['Analista', 'Coordinador', 'Gerencia'],
    },
    {
      id: 'reports',
      label: 'Reportes',
      icon: <TrendingUp size={20} color={Colors.industrial.textSecondary} />,
      href: '/reports',
      roles: ['Analista', 'Coordinador', 'Gerencia'],
    }
  ];

  const filteredNavItems = navItems.filter((item) =>
    currentUser ? item.roles.includes(currentUser.rol) : false
  );

  const handleNavigation = (href: string) => {
    router.push(href as never);
    if (Platform.OS !== 'web') {
      onClose();
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  if (!isOpen && Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={[styles.container, Platform.OS === 'web' && styles.containerWeb]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Settings size={24} color={Colors.industrial.primary} />
          <Text style={styles.headerTitle}>SGM</Text>
        </View>
        {Platform.OS !== 'web' && (
          <Pressable onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.industrial.textSecondary} />
          </Pressable>
        )}
      </View>

      {currentUser && (
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>
              {currentUser.nombre?.charAt(0).toUpperCase()|| '?'}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{currentUser.nombre}</Text>
            <Text style={styles.userRole}>{currentUser.rol}</Text>
          </View>
        </View>
      )}

      <ScrollView style={styles.nav} showsVerticalScrollIndicator={false}>
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.navItem,
                isActive && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
              onPress={() => handleNavigation(item.href)}
            >
              {item.icon}
              <Text
                style={[
                  styles.navItemText,
                  isActive && styles.navItemTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed,
          ]}
          onPress={handleLogout}
        >
          <LogOut size={20} color={Colors.industrial.error} />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 280,
    backgroundColor: Colors.industrial.backgroundSecondary,
    borderRightWidth: 1,
    borderRightColor: Colors.industrial.border,
    ...Platform.select({
      web: {
        height: '100%',
      },
      default: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 1000,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
    }),
  },
  containerWeb: {
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.industrial.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
    letterSpacing: 1,
  },
  closeButton: {
    padding: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.industrial.border,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.industrial.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.industrial.text,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 13,
    color: Colors.industrial.textSecondary,
  },
  nav: {
    flex: 1,
    padding: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: Colors.industrial.surface,
    borderLeftWidth: 3,
    borderLeftColor: Colors.industrial.primary,
  },
  navItemPressed: {
    backgroundColor: Colors.industrial.surfaceHover,
  },
  navItemText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.industrial.textSecondary,
  },
  navItemTextActive: {
    color: Colors.industrial.text,
    fontWeight: '600' as const,
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.industrial.border,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  logoutButtonPressed: {
    backgroundColor: Colors.industrial.surface,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '500' as const,
    color: Colors.industrial.error,
  },
});
