import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface SensorActivityChartProps {
  waterHistory: number[];
  tempHistory: number[];
  gasHistory: number[];
  currentWater: number;
  currentTemp: number;
  currentGas: number;
}

type StreamMode = 'all' | 'water' | 'temp' | 'gas';

export function SensorActivityChart({
  waterHistory = [],
  tempHistory = [],
  gasHistory = [],
  currentWater = 0,
  currentTemp = 0,
  currentGas = 0,
}: SensorActivityChartProps) {
  const theme = useTheme();
  const [activeStream, setActiveStream] = useState<StreamMode>('all');

  // Mobile optimization: Sample exactly 14 points so columns are wide (20px+) and never collapse or clip
  const sampleCount = 14;

  const points = useMemo(() => {
    const rawLen = Math.max(waterHistory.length, tempHistory.length, gasHistory.length, 1);
    const step = Math.max(1, Math.floor(rawLen / sampleCount));
    const sampledIndices: number[] = [];

    for (let i = 0; i < sampleCount; i++) {
      const idx = Math.min(rawLen - 1, Math.floor(i * step));
      sampledIndices.push(idx);
    }
    // Ensure the very latest reading is included at the end
    if (sampledIndices[sampledIndices.length - 1] !== rawLen - 1) {
      sampledIndices[sampledIndices.length - 1] = rawLen - 1;
    }

    return sampledIndices.map((idx, sampleIdx) => {
      const wVal = waterHistory[idx] ?? currentWater;
      const tVal = tempHistory[idx] ?? currentTemp;
      const gVal = gasHistory[idx] ?? currentGas;

      return {
        id: sampleIdx,
        waterPct: Math.min(100, Math.max(4, wVal)),
        tempPct: Math.min(100, Math.max(4, (tVal / 60) * 100)),
        gasPct: Math.min(100, Math.max(4, (gVal / 3.3) * 100)),
        waterRaw: wVal,
        tempRaw: tVal,
        gasRaw: gVal,
      };
    });
  }, [waterHistory, tempHistory, gasHistory, currentWater, currentTemp, currentGas]);

  const showWater = activeStream === 'all' || activeStream === 'water';
  const showTemp = activeStream === 'all' || activeStream === 'temp';
  const showGas = activeStream === 'all' || activeStream === 'gas';

  return (
    <View style={styles.container}>
      {/* Stream Selector Chips (Compact single row for mobile) */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All', color: theme.primary },
          { key: 'water', label: `Water ${currentWater.toFixed(0)}%`, color: '#0284c7' },
          { key: 'temp', label: `Temp ${currentTemp.toFixed(0)}°`, color: '#d97706' },
          { key: 'gas', label: `Gas ${currentGas.toFixed(2)}V`, color: '#8b5cf6' },
        ].map((item) => {
          const isSelected = activeStream === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor: isSelected ? item.color : theme.backgroundElement,
                  borderColor: isSelected ? item.color : theme.cardBorder,
                },
              ]}
              activeOpacity={0.7}
              onPress={() => setActiveStream(item.key as StreamMode)}>
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: isSelected ? '#FFFFFF' : theme.textSecondary,
                    fontWeight: isSelected ? '800' : '600',
                  },
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Visual Timeline Canvas */}
      <View
        style={[
          styles.plotArea,
          {
            backgroundColor: theme.backgroundElement,
            borderColor: theme.cardBorder,
          },
        ]}>
        {/* Horizontal Threshold Grid Lines */}
        <View style={styles.gridContainer} pointerEvents="none">
          {[100, 75, 50, 25, 0].map((level) => (
            <View key={level} style={styles.gridLineRow}>
              <Text style={[styles.gridLabel, { color: theme.textSecondary }]}>{level}%</Text>
              <View
                style={[
                  styles.gridLine,
                  level === 75 && {
                    borderColor: '#ef4444',
                    borderStyle: 'dashed',
                    opacity: 0.8,
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Proportional Mobile Timeline Bar Columns */}
        <View style={styles.barsContainer}>
          {points.map((pt, idx) => {
            const isLatest = idx === points.length - 1;
            const isCriticalWater = pt.waterRaw > 70;

            return (
              <View key={pt.id} style={styles.timelineCol}>
                <View style={styles.columnTrack}>
                  {showWater && (
                    <View
                      style={[
                        styles.barPill,
                        {
                          height: `${pt.waterPct}%`,
                          backgroundColor: isCriticalWater ? '#ef4444' : '#0284c7',
                          opacity: isLatest ? 1 : 0.75,
                        },
                      ]}
                    />
                  )}
                  {showTemp && (
                    <View
                      style={[
                        styles.barPill,
                        {
                          height: `${pt.tempPct}%`,
                          backgroundColor: '#d97706',
                          opacity: isLatest ? 0.95 : 0.6,
                        },
                      ]}
                    />
                  )}
                  {showGas && (
                    <View
                      style={[
                        styles.barPill,
                        {
                          height: `${pt.gasPct}%`,
                          backgroundColor: '#8b5cf6',
                          opacity: isLatest ? 0.95 : 0.6,
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Pulsing Live Dot on Latest Telemetry Reading */}
                {isLatest && (
                  <View
                    style={[
                      styles.livePulseDot,
                      { backgroundColor: isCriticalWater ? '#ef4444' : theme.primary },
                    ]}
                  />
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Time Axis Labels */}
      <View style={styles.timeAxisRow}>
        <Text style={[styles.timeAxisText, { color: theme.textSecondary }]}>-60m</Text>
        <Text style={[styles.timeAxisText, { color: theme.textSecondary }]}>-30m</Text>
        <Text style={[styles.timeAxisText, { color: theme.textSecondary }]}>-15m</Text>
        <Text style={[styles.timeAxisText, { color: theme.primary, fontWeight: '800' }]}>
          ● Live
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 10,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipText: {
    fontSize: 10.5,
  },
  plotArea: {
    height: 160,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  gridContainer: {
    position: 'absolute',
    top: 8,
    bottom: 8,
    left: 6,
    right: 6,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  gridLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gridLabel: {
    fontSize: 9,
    width: 28,
    textAlign: 'right',
    fontWeight: '600',
  },
  gridLine: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.12)',
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: 36,
    marginRight: 4,
    zIndex: 2,
    height: '100%',
  },
  timelineCol: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 1,
  },
  columnTrack: {
    width: '100%',
    maxWidth: 16,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 1.5,
  },
  barPill: {
    flex: 1,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    minHeight: 4,
  },
  livePulseDot: {
    position: 'absolute',
    top: -4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timeAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 42,
    paddingRight: 8,
    marginTop: 6,
  },
  timeAxisText: {
    fontSize: 9.5,
  },
});
