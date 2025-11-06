import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "@/constants/colors";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";

interface StatusBadgeProps {
  status: string;
  type?: "maquinaria" | "orden" | "prioridad";
  size?: "small" | "medium";
  estado?: number;
}

export default function MantenimientoBadge({
  status,
  type = "maquinaria",
  size = "medium",
  estado,
}: StatusBadgeProps) {
  const getStatusColor = () => {
    
    if (estado !== undefined) {
      if (estado <= 4) {
        return Colors.industrial.error;
      } else if (estado >= 5 && estado <= 8) {
        return Colors.industrial.warning;
      } else if (estado >= 9 && estado <= 22) {
        return Colors.industrial.success;
      }
    }
    return Colors.industrial.textSecondary;
  };

  const getStatus = () => {
    
    if (estado !== undefined) {
      if (estado <= 4) {
        return "Por favor realizar mantenimiento";
      } else if (estado >= 5 && estado <= 8) {
        return "Proximo mantenimiento";
      } else if (estado >= 9 && estado <= 22) {
        return "Mantenimiento al dia";
      }
    }
    return Colors.industrial.textSecondary;
  };

  const color = getStatusColor();
  const mensaje = getStatus();
  const isSmall = size === "small";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: `${color}20` },
        isSmall && styles.containerSmall,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }, isSmall && styles.textSmall]}>
        {mensaje}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
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
    fontWeight: "600" as const,
  },
  textSmall: {
    fontSize: 11,
  },
});
