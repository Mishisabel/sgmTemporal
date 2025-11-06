import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Menu, Bell, Search } from "lucide-react-native";
import Colors from "@/constants/colors";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/apiService";
import Sidebar from "@/components/Sidebar";
import KPICard from "@/components/KPICard";
import StatusBadge from "@/components/StatusBadge";
import NotificationPanel from '@/components/NotificationPanel';

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { currentUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(isWeb);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["dashboard", currentUser?.rol],
    queryFn: () => apiService.getDashboardData(currentUser?.rol || ""),
    enabled: !!currentUser,
  });

  const { data: notificaciones } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: () => apiService.getNotificaciones(),
  });

  const unreadCount = notificaciones?.filter((n) => !n.leida).length || 0;

  if (currentUser?.rol === "Operador") {
    return (
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
      >
        <View style={[styles.header, { paddingTop: insets.top }]}>
          <Text style={styles.headerTitle}>Panel del Operador</Text>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.operatorContainer}>
            <Text style={styles.operatorTitle}>Acciones Rápidas</Text>
            <View style={styles.operatorButtons}>
              <Pressable style={styles.operatorButton}>
                <Text style={styles.operatorButtonText}>⏱️</Text>
                <Text style={styles.operatorButtonLabel}>
                  Actualizar Horómetro
                </Text>
              </Pressable>
              <Pressable
                style={[styles.operatorButton, styles.operatorButtonDanger]}
              >
                <Text style={styles.operatorButtonText}>⚠️</Text>
                <Text style={styles.operatorButtonLabel}>
                  Reportar Incidencia
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {sidebarOpen && (
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      )}

      <View style={styles.mainContent}>
        <View style={[styles.header, { paddingTop: insets.top }]}>
          {!isWeb && (
            <Pressable
              onPress={() => setSidebarOpen(!sidebarOpen)}
              style={styles.menuButton}
            >
              <Menu size={24} color={Colors.industrial.text} />
            </Pressable>
          )}

          <Text style={styles.headerTitle}>Dashboard</Text>

          <View style={styles.headerActions}>
            <Pressable style={styles.iconButton}>
              <Search size={20} color={Colors.industrial.textSecondary} />
            </Pressable>
            <Pressable style={styles.iconButton} onPress={() => setIsPanelVisible(true)}>
              <Bell size={20} color={Colors.industrial.textSecondary} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              )}
            </Pressable>
          </View>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Cargando...</Text>
            </View>
          ) : (
            <>
              {dashboardData?.kpis && dashboardData.kpis.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>KPIs</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.kpiContainer}
                  >
                    {dashboardData.kpis.map((kpi, index) => (
                      <KPICard key={index} kpi={kpi} />
                    ))}
                  </ScrollView>
                </View>
              )}

              {dashboardData?.ordenesAbiertas &&
                dashboardData.ordenesAbiertas.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>
                      Órdenes de Trabajo Abiertas
                    </Text>
                    <View style={styles.card}>
                      {dashboardData.ordenesAbiertas.map((orden) => (
                        <View key={orden.id} style={styles.listItem}>
                          <View style={styles.listItemHeader}>
                            <Text style={styles.listItemTitle}>{orden.id}</Text>
                            <StatusBadge
                              status={orden.prioridad}
                              type="prioridad"
                              size="small"
                            />
                          </View>
                          <Text style={styles.listItemSubtitle}>
                            {orden.maquinariaNombre}
                          </Text>
                          <Text
                            style={styles.listItemDescription}
                            numberOfLines={2}
                          >
                            {orden.descripcionProblema}
                          </Text>
                          <View style={styles.listItemFooter}>
                            <StatusBadge
                              status={orden.estado}
                              type="orden"
                              size="small"
                            />
                            <Text style={styles.listItemDate}>
                              {orden.fechaCreacion}
                            </Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
            </>
          )}
        </ScrollView>
        {isPanelVisible && (
          <NotificationPanel onClose={() => setIsPanelVisible(false)} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.industrial.background,
    flexDirection: isWeb ? "row" : "column",
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontWeight: "700" as const,
    color: Colors.industrial.text,
    flex: 1,
    ...Platform.select({
      web: { marginLeft: 0 },
      default: { marginLeft: 12 },
    }),
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.industrial.surface,
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: Colors.industrial.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: Colors.industrial.text,
    fontSize: 10,
    fontWeight: "700" as const,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    color: Colors.industrial.textSecondary,
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.industrial.text,
    marginBottom: 16,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  kpiContainer: {
    gap: 16,
    paddingRight: 20,
  },
  card: {
    backgroundColor: Colors.industrial.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
  },
  listItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.industrial.border,
  },
  listItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: Colors.industrial.text,
  },
  listItemSubtitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.industrial.primary,
    marginBottom: 4,
  },
  listItemDescription: {
    fontSize: 14,
    color: Colors.industrial.textSecondary,
    marginBottom: 8,
  },
  listItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listItemDate: {
    fontSize: 12,
    color: Colors.industrial.textMuted,
  },
  alertItem: {
    flexDirection: "row",
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.industrial.border,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.industrial.warning}20`,
    alignItems: "center",
    justifyContent: "center",
  },
  alertIconText: {
    fontSize: 20,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.industrial.text,
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 13,
    color: Colors.industrial.textSecondary,
  },
  operatorContainer: {
    padding: 20,
  },
  operatorTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.industrial.text,
    marginBottom: 24,
    textAlign: "center",
  },
  operatorButtons: {
    gap: 20,
  },
  operatorButton: {
    backgroundColor: Colors.industrial.primary,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  operatorButtonDanger: {
    backgroundColor: Colors.industrial.warning,
  },
  operatorButtonText: {
    fontSize: 48,
  },
  operatorButtonLabel: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.industrial.text,
    textAlign: "center",
  },
});
