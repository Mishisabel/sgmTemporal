import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Menu, FileText, BarChart3, Bell } from "lucide-react-native";
import Colors from "@/constants/colors";
import Sidebar from "@/components/Sidebar";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/services/apiService";
import NotificationPanel from "@/components/NotificationPanel";

const isWeb = Platform.OS === "web";

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(isWeb);
  const [isPanelVisible, setIsPanelVisible] = useState(false);

  const reportTypes = [
    {
      id: "1",
      title: "Historial de Mantenimiento",
      icon: <FileText size={32} color={Colors.industrial.primary} />,
      description: "Reporte completo por máquina",
    },
    {
      id: "2",
      title: "Costos por OT",
      icon: <BarChart3 size={32} color={Colors.industrial.accent} />,
      description: "Análisis de costos operativos",
    },
  ];

  const { data: notificaciones } = useQuery({
    queryKey: ["notificaciones"],
    queryFn: () => apiService.getNotificaciones(),
  });
  const unreadCount = notificaciones?.filter((n) => !n.leida).length || 0;

  return (
    <View style={styles.container as ViewStyle}>
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

          <Text style={styles.headerTitle}>Reportes</Text>

          <View style={styles.headerActions}>
            <Pressable
              style={styles.iconButton}
              onPress={() => setIsPanelVisible(true)}
            >
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
          style={styles.content as any}
          contentContainerStyle={styles.contentContainer as any}
        >
          <View style={styles.grid}>
            {reportTypes.map((report) => (
              <Pressable key={report.id} style={styles.card}>
                <View style={styles.cardIcon}>{report.icon}</View>
                <Text style={styles.cardTitle}>{report.title}</Text>
                <Text style={styles.cardDescription}>{report.description}</Text>
                <Pressable style={styles.generateButton}>
                  <Text style={styles.generateButtonText}>Generar Reporte</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  grid: {
    gap: 16,
    ...Platform.select({
      web: {
        flexDirection: "row",
        flexWrap: "wrap",
      },
      default: {
        flexDirection: "column",
      },
    }),
  },
  card: {
    backgroundColor: Colors.industrial.surface,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    alignItems: "center",
    ...Platform.select({
      web: {
        width: "48%",
        marginRight: 16,
        marginBottom: 16,
      },
      default: {
        width: "100%",
        marginBottom: 16,
      },
    }),
  },
  cardIcon: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.industrial.text,
    textAlign: "center",
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.industrial.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: Colors.industrial.primary,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  generateButtonText: {
    color: Colors.industrial.text,
    fontSize: 14,
    fontWeight: "600" as const,
  },
  badgeText: {
    color: Colors.industrial.text,
    fontSize: 10,
    fontWeight: "700" as const,
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
});
