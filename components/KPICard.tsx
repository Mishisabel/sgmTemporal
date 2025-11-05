import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import type { KPI } from '@/types';

interface KPICardProps {
  kpi: KPI;
  onPress?: () => void;
}

export default function KPICard({ kpi, onPress }: KPICardProps) {
  const getTrendIcon = () => {
    if (!kpi.tendencia) return null;
    
    const iconProps = {
      size: 16,
      color: kpi.tendencia === 'up' ? Colors.industrial.success : 
             kpi.tendencia === 'down' ? Colors.industrial.error : 
             Colors.industrial.textSecondary,
    };

    if (kpi.tendencia === 'up') return <TrendingUp {...iconProps} />;
    if (kpi.tendencia === 'down') return <TrendingDown {...iconProps} />;
    return <Minus {...iconProps} />;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && onPress && styles.containerPressed,
      ]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <Text style={styles.label}>{kpi.nombre}</Text>
      </View>
      
      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {kpi.valor}
          <Text style={styles.unit}>{kpi.unidad}</Text>
        </Text>
        {kpi.tendencia && (
          <View style={styles.trendContainer}>
            {getTrendIcon()}
            {kpi.cambio !== undefined && (
              <Text style={[
                styles.cambio,
                kpi.tendencia === 'up' && styles.cambioPositivo,
                kpi.tendencia === 'down' && styles.cambioNegativo,
              ]}>
                {kpi.cambio > 0 ? '+' : ''}{kpi.cambio}
              </Text>
            )}
          </View>
        )}
      </View>

      {kpi.objetivo && (
        <View style={styles.objetivoContainer}>
          <Text style={styles.objetivoLabel}>Objetivo: {kpi.objetivo}{kpi.unidad}</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min((kpi.valor / kpi.objetivo) * 100, 100)}%`,
                  backgroundColor: kpi.valor >= kpi.objetivo 
                    ? Colors.industrial.success 
                    : Colors.industrial.warning,
                },
              ]} 
            />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.industrial.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.industrial.border,
    minWidth: 160,
  },
  containerPressed: {
    backgroundColor: Colors.industrial.surfaceHover,
    transform: [{ scale: 0.98 }],
  },
  header: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: Colors.industrial.textSecondary,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  value: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: Colors.industrial.text,
  },
  unit: {
    fontSize: 18,
    fontWeight: '500' as const,
    color: Colors.industrial.textSecondary,
    marginLeft: 4,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cambio: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.industrial.textSecondary,
  },
  cambioPositivo: {
    color: Colors.industrial.success,
  },
  cambioNegativo: {
    color: Colors.industrial.error,
  },
  objetivoContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.industrial.border,
  },
  objetivoLabel: {
    fontSize: 11,
    color: Colors.industrial.textMuted,
    marginBottom: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.industrial.backgroundTertiary,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});
