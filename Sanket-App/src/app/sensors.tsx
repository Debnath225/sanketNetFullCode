import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSanket, NodeCategory, SensorNode } from '@/context/SanketContext';

export default function SensorsScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const { nodes, gatewayStatus } = useSanket();

  const [selectedFilter, setSelectedFilter] = useState<'all' | NodeCategory>('all');
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>('NODE-01');

  const contentPadding = Platform.select({
    web: { paddingTop: 76, paddingBottom: 40 },
    default: {
      paddingTop: Math.max(safeAreaInsets.top, 16),
      paddingBottom: Math.max(safeAreaInsets.bottom, 24) + 60,
    },
  });

  const filteredNodes =
    selectedFilter === 'all'
      ? nodes
      : nodes.filter((n) => n.category === selectedFilter);

  const getStatusColor = (level: number, danger: number) => {
    if (level >= danger) return theme.danger;
    if (level >= danger - 0.7) return theme.warning;
    return theme.primary;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, contentPadding]}>
      <View style={styles.maxWidthWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text }]}>Live Field Sensors</Text>
            <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
              Real-time telemetry from catchment nodes
            </Text>
          </View>

          <View style={[styles.meshStatBox, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <MaterialCommunityIcons name="radio-tower" size={13} color={theme.primary} />
            <Text style={[styles.meshStatText, { color: theme.text }]}>
              {nodes.length} Nodes Active
            </Text>
          </View>
        </View>

        {/* Mesh Network Health Strip */}
        <View
          style={[
            styles.meshHealthCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}>
          <View style={styles.meshHealthItem}>
            <Text style={[styles.meshHealthLabel, { color: theme.textSecondary }]}>
              Carrier Band
            </Text>
            <Text style={[styles.meshHealthVal, { color: theme.text }]}>868.10 MHz</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.meshHealthItem}>
            <Text style={[styles.meshHealthLabel, { color: theme.textSecondary }]}>
              RF Modulation
            </Text>
            <Text style={[styles.meshHealthVal, { color: theme.primary }]}>SX1262 SF7</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.meshHealthItem}>
            <Text style={[styles.meshHealthLabel, { color: theme.textSecondary }]}>
              Security
            </Text>
            <Text style={[styles.meshHealthVal, { color: theme.success }]}>AES-128-GCM</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.meshHealthItem}>
            <Text style={[styles.meshHealthLabel, { color: theme.textSecondary }]}>
              Relay Latency
            </Text>
            <Text style={[styles.meshHealthVal, { color: theme.text }]}>32 ms</Text>
          </View>
        </View>

        {/* Category Filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersScroll}
          contentContainerStyle={styles.filtersContainer}>
          {[
            { key: 'all', label: 'All Stations' },
            { key: 'river', label: 'River Gauges' },
            { key: 'embankment', label: 'Embankments' },
            { key: 'drainage', label: 'Canals & Pumps' },
            { key: 'urban', label: 'Urban Lowlands' },
          ].map((f) => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedFilter === f.key ? theme.primary : theme.card,
                  borderColor:
                    selectedFilter === f.key ? theme.primary : theme.cardBorder,
                },
              ]}
              onPress={() => setSelectedFilter(f.key as any)}>
              <Text
                style={[
                  styles.filterChipText,
                  {
                    color: selectedFilter === f.key ? '#FFF' : theme.textSecondary,
                    fontWeight: selectedFilter === f.key ? '700' : '500',
                  },
                ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sensor Node Cards */}
        {filteredNodes.length === 0 ? (
          <View
            style={{
              backgroundColor: theme.card,
              borderColor: theme.cardBorder,
              borderWidth: 1,
              borderRadius: 16,
              padding: 28,
              alignItems: 'center',
              gap: 10,
              marginTop: 12,
            }}>
            <MaterialCommunityIcons name="access-point-network-off" size={36} color={theme.textSecondary} />
            <Text style={{ fontSize: 16, fontWeight: '700', color: theme.text }}>
              No Reporting Stations Found
            </Text>
            <Text style={{ fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 18 }}>
              No telemetry nodes match the current filter. Field sensors and LoRa gateways will automatically register here upon transmitting their first packet.
            </Text>
          </View>
        ) : (
          filteredNodes.map((node) => {
          const isExpanded = expandedNodeId === node.id;
          const statusColor = getStatusColor(node.waterLevel, node.waterLevelDanger);
          const pct = Math.min(100, Math.round((node.waterLevel / node.waterLevelMax) * 100));

          return (
            <View
              key={node.id}
              style={[
                styles.nodeCard,
                {
                  backgroundColor: theme.card,
                  borderColor:
                    node.waterLevel >= node.waterLevelDanger
                      ? theme.danger
                      : theme.cardBorder,
                },
              ]}>
              {/* Card Top Row */}
              <View style={styles.nodeHeader}>
                <View>
                  <View style={styles.nodeIdRow}>
                    <Text style={[styles.nodeIdTag, { color: theme.primary }]}>
                      {node.id}
                    </Text>
                    <View style={[styles.categoryPill, { backgroundColor: theme.backgroundElement }]}>
                      <Text style={[styles.categoryPillText, { color: theme.textSecondary }]}>
                        {node.category.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.nodeName, { color: theme.text }]}>{node.name}</Text>
                  <Text style={[styles.nodeLocation, { color: theme.textSecondary }]}>
                    📍 {node.location}
                  </Text>
                </View>

                {/* Battery & RSSI info */}
                <View style={styles.telemetryStatusCol}>
                  <View style={styles.statusPillSmall}>
                    <Feather
                      name={node.battery > 50 ? 'battery-charging' : 'battery'}
                      size={13}
                      color={node.battery > 30 ? theme.success : theme.danger}
                    />
                    <Text style={[styles.statusSmallText, { color: theme.text }]}>
                      {node.battery}%
                    </Text>
                  </View>
                  <View style={styles.statusPillSmall}>
                    <Feather name="wifi" size={12} color={theme.primary} />
                    <Text style={[styles.statusSmallText, { color: theme.textSecondary }]}>
                      {node.rssi} dBm
                    </Text>
                  </View>
                </View>
              </View>

              {/* Water Level Telemetry Bar */}
              <View style={[styles.waterLevelContainer, { backgroundColor: theme.backgroundElement }]}>
                <View style={styles.waterLevelTopRow}>
                  <Text style={[styles.waterLevelLabel, { color: theme.textSecondary }]}>
                    Water Stage Elevation
                  </Text>
                  <Text style={[styles.waterLevelVal, { color: statusColor }]}>
                    {node.waterLevel.toFixed(2)}{' '}
                    <Text style={{ fontSize: 13, color: theme.textSecondary }}>m</Text>
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${pct}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>

                <View style={styles.thresholdRow}>
                  <Text style={{ fontSize: 11, color: theme.textSecondary }}>
                    Current: {node.waterLevel.toFixed(2)}m / Max: {node.waterLevelMax}m
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '700',
                      color:
                        node.waterLevel >= node.waterLevelDanger ? theme.danger : theme.textSecondary,
                    }}>
                    Danger Mark: {node.waterLevelDanger}m
                  </Text>
                </View>
              </View>

              {/* Environmental Sub-Sensors */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <View style={styles.metricIconWrap}>
                    <Feather name="cloud-rain" size={14} color="#3B82F6" />
                  </View>
                  <View>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                      Precipitation
                    </Text>
                    <Text style={[styles.metricText, { color: theme.text }]}>
                      {node.rainfallRate} mm/h
                    </Text>
                  </View>
                </View>

                <View style={styles.metricItem}>
                  <View style={styles.metricIconWrap}>
                    <MaterialCommunityIcons name="water-percent" size={16} color="#10B981" />
                  </View>
                  <View>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                      Soil Moisture
                    </Text>
                    <Text style={[styles.metricText, { color: theme.text }]}>
                      {node.soilMoisture}%
                    </Text>
                  </View>
                </View>

                <View style={styles.metricItem}>
                  <View style={styles.metricIconWrap}>
                    <MaterialCommunityIcons name="water-check" size={16} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={[styles.metricLabel, { color: theme.textSecondary }]}>
                      Turbidity
                    </Text>
                    <Text style={[styles.metricText, { color: theme.text }]}>
                      {node.turbidity} NTU
                    </Text>
                  </View>
                </View>
              </View>

              {/* Mini Trend Sparkline */}
              <View style={styles.trendRow}>
                <Text style={[styles.trendLabel, { color: theme.textSecondary }]}>
                  Recent 6h Trend:
                </Text>
                <View style={styles.sparklineContainer}>
                  {node.history.map((val, idx) => {
                    const barHeight = Math.max(8, Math.min(32, (val / node.waterLevelMax) * 32));
                    return (
                      <View key={idx} style={styles.sparkBarCol}>
                        <View
                          style={[
                            styles.sparkBar,
                            {
                              height: barHeight,
                              backgroundColor:
                                idx === node.history.length - 1 ? statusColor : theme.primary,
                              opacity: 0.4 + (idx / node.history.length) * 0.6,
                            },
                          ]}
                        />
                      </View>
                    );
                  })}
                </View>
                <Text style={[styles.trendChange, { color: statusColor }]}>
                  +{((node.waterLevel - node.history[0])).toFixed(2)}m
                </Text>
              </View>

              {/* Expand Toggle */}
              <TouchableOpacity
                style={[styles.expandToggle, { borderColor: theme.cardBorder }]}
                onPress={() => setExpandedNodeId(isExpanded ? null : node.id)}>
                <Text style={[styles.expandToggleText, { color: theme.primary }]}>
                  {isExpanded ? 'Hide Technical Diagnostics' : 'View LoRa Mesh & RF Diagnostics'}
                </Text>
                <Feather
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color={theme.primary}
                />
              </TouchableOpacity>

              {/* Expanded Diagnostics */}
              {isExpanded && (
                <View
                  style={[
                    styles.diagnosticsBox,
                    { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder },
                  ]}>
                  <View style={styles.diagRow}>
                    <Text style={[styles.diagKey, { color: theme.textSecondary }]}>
                      LoRa SNR:
                    </Text>
                    <Text style={[styles.diagVal, { color: theme.text }]}>{node.snr} dB</Text>
                  </View>
                  <View style={styles.diagRow}>
                    <Text style={[styles.diagKey, { color: theme.textSecondary }]}>
                      Mesh Relay Hops:
                    </Text>
                    <Text style={[styles.diagVal, { color: theme.text }]}>
                      {node.hops} hop(s) to Gateway
                    </Text>
                  </View>
                  <View style={styles.diagRow}>
                    <Text style={[styles.diagKey, { color: theme.textSecondary }]}>
                      Last Packet Sync:
                    </Text>
                    <Text style={[styles.diagVal, { color: theme.text }]}>{node.lastSeen}</Text>
                  </View>
                  <View style={styles.diagRow}>
                    <Text style={[styles.diagKey, { color: theme.textSecondary }]}>
                      Hardware Architecture:
                    </Text>
                    <Text style={[styles.diagVal, { color: theme.text }]}>
                      ESP32-S3 + Semtech SX1262
                    </Text>
                  </View>
                </View>
              )}
            </View>
          );
        }))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  maxWidthWrapper: {
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 12.5,
    marginTop: 2,
  },
  meshStatBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  meshStatText: {
    fontSize: 12,
    fontWeight: '700',
  },
  meshHealthCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  meshHealthItem: {
    alignItems: 'center',
    flex: 1,
  },
  meshHealthLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  meshHealthVal: {
    fontSize: 12,
    fontWeight: '800',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
  },
  filtersScroll: {
    marginBottom: Spacing.three,
  },
  filtersContainer: {
    gap: 8,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
  },
  nodeCard: {
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1.5,
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  nodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  nodeIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  nodeIdTag: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  categoryPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  nodeName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 2,
  },
  nodeLocation: {
    fontSize: 12,
  },
  telemetryStatusCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusPillSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  statusSmallText: {
    fontSize: 11,
    fontWeight: '600',
  },
  waterLevelContainer: {
    padding: Spacing.three,
    borderRadius: 14,
    marginBottom: Spacing.two,
  },
  waterLevelTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  waterLevelLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  waterLevelVal: {
    fontSize: 22,
    fontWeight: '900',
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
    marginBottom: 8,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  metricText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
    paddingVertical: 4,
  },
  trendLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sparklineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    height: 32,
  },
  sparkBarCol: {
    width: 8,
    height: 32,
    justifyContent: 'flex-end',
  },
  sparkBar: {
    width: 8,
    borderRadius: 2,
  },
  trendChange: {
    fontSize: 12,
    fontWeight: '800',
  },
  expandToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  expandToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  diagnosticsBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  diagKey: {
    fontSize: 11,
  },
  diagVal: {
    fontSize: 11,
    fontWeight: '700',
  },
});
