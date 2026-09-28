import React, { useState } from 'react';
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

  const width = 560;
  const height = 180;
  const padding = { top: 20, right: 24, bottom: 28, left: 36 };

  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  // Build SVG path with smooth bezier curves
  const buildSmoothPath = (data: number[], maxVal: number) => {
    if (!data || data.length < 2) return { linePath: '', areaPath: '', points: [] };

    const pts = data.map((val, idx) => {
      const x = padding.left + (idx / (data.length - 1)) * plotW;
      const normalized = Math.min(1, Math.max(0, val / maxVal));
      const y = padding.top + (1 - normalized) * plotH;
      return { x, y, val };
    });

    // Generate smooth cubic bezier SVG curve
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const mx = (p0.x + p1.x) / 2;
      d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${d} L ${pts[pts.length - 1].x} ${padding.top + plotH} L ${pts[0].x} ${padding.top + plotH} Z`;

    return { linePath: d, areaPath: areaD, points: pts };
  };

  const waterCurve = buildSmoothPath(waterHistory.length >= 2 ? waterHistory : [currentWater, currentWater], 100);
  const tempCurve = buildSmoothPath(tempHistory.length >= 2 ? tempHistory : [currentTemp, currentTemp], 60);
  const gasCurve = buildSmoothPath(gasHistory.length >= 2 ? gasHistory : [currentGas, currentGas], 3.3);

  const showWater = activeStream === 'all' || activeStream === 'water';
  const showTemp = activeStream === 'all' || activeStream === 'temp';
  const showGas = activeStream === 'all' || activeStream === 'gas';

  return (
    <View style={styles.container}>
      {/* Stream Selector Chips */}
      <View style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'water', label: `Water ${currentWater.toFixed(0)}%`, color: '#22d3ee' },
          { key: 'temp', label: `Temp ${currentTemp.toFixed(0)}°`, color: '#f59e0b' },
          { key: 'gas', label: `Gas ${currentGas.toFixed(2)}V`, color: '#a78bfa' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.filterChip,
              {
                backgroundColor:
                  activeStream === item.key
                    ? item.color || theme.primary
                    : theme.backgroundElement,
                borderColor:
                  activeStream === item.key
                    ? item.color || theme.primary
                    : theme.cardBorder,
              },
            ]}
            onPress={() => setActiveStream(item.key as StreamMode)}>
            <Text
              style={[
                styles.filterChipText,
                {
                  color:
                    activeStream === item.key
                      ? '#FFFFFF'
                      : theme.textSecondary,
                  fontWeight: activeStream === item.key ? '700' : '500',
                },
              ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* SVG Timeline Canvas */}
      <View style={styles.svgWrapper}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 180, display: 'block', overflow: 'visible' }}>
          <defs>
            {/* Water Gradient */}
            <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
            </linearGradient>

            {/* Temp Gradient */}
            <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            {/* Gas Gradient */}
            <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (0, 25, 50, 75, 100%) */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = padding.top + (1 - pct) * plotH;
            return (
              <g key={i}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="rgba(150, 150, 150, 0.12)"
                  strokeDasharray={pct === 0.5 ? '4 4' : undefined}
                  strokeWidth={1}
                />
                <text
                  x={padding.left - 6}
                  y={y + 3.5}
                  textAnchor="end"
                  fill="rgba(150, 150, 150, 0.7)"
                  fontSize="9.5"
                  fontFamily="system-ui, -apple-system, sans-serif">
                  {Math.round(pct * 100)}%
                </text>
              </g>
            );
          })}

          {/* Critical Water Threshold Line (70%) */}
          {showWater && (
            <line
              x1={padding.left}
              y1={padding.top + (1 - 0.7) * plotH}
              x2={width - padding.right}
              y2={padding.top + (1 - 0.7) * plotH}
              stroke="#ef4444"
              strokeWidth={1}
              strokeDasharray="3 3"
              opacity={0.6}
            />
          )}

          {/* Water Area & Line */}
          {showWater && waterCurve.linePath && (
            <g>
              <path d={waterCurve.areaPath} fill="url(#waterGrad)" />
              <path
                d={waterCurve.linePath}
                fill="none"
                stroke="#22d3ee"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {waterCurve.points.map((pt, i) => (
                <circle
                  key={`w-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={i === waterCurve.points.length - 1 ? 4.5 : 2.5}
                  fill={i === waterCurve.points.length - 1 ? '#FFFFFF' : '#22d3ee'}
                  stroke="#22d3ee"
                  strokeWidth={2}
                />
              ))}
            </g>
          )}

          {/* Temperature Area & Line */}
          {showTemp && tempCurve.linePath && (
            <g>
              <path d={tempCurve.areaPath} fill="url(#tempGrad)" />
              <path
                d={tempCurve.linePath}
                fill="none"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeLinecap="round"
              />
              {tempCurve.points.map((pt, i) => (
                <circle
                  key={`t-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={i === tempCurve.points.length - 1 ? 4 : 2}
                  fill={i === tempCurve.points.length - 1 ? '#FFFFFF' : '#f59e0b'}
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          )}

          {/* Gas Area & Line */}
          {showGas && gasCurve.linePath && (
            <g>
              <path d={gasCurve.areaPath} fill="url(#gasGrad)" />
              <path
                d={gasCurve.linePath}
                fill="none"
                stroke="#a78bfa"
                strokeWidth={2}
                strokeLinecap="round"
              />
              {gasCurve.points.map((pt, i) => (
                <circle
                  key={`g-${i}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={i === gasCurve.points.length - 1 ? 4 : 2}
                  fill={i === gasCurve.points.length - 1 ? '#FFFFFF' : '#a78bfa'}
                  stroke="#a78bfa"
                  strokeWidth={1.5}
                />
              ))}
            </g>
          )}

          {/* X Axis Time Labels */}
          {['T-60m', 'T-45m', 'T-30m', 'T-15m', 'Live Now'].map((timeLabel, idx) => {
            const x = padding.left + (idx / 4) * plotW;
            return (
              <text
                key={idx}
                x={x}
                y={height - 8}
                textAnchor={idx === 0 ? 'start' : idx === 4 ? 'end' : 'middle'}
                fill="rgba(150, 150, 150, 0.7)"
                fontSize="9"
                fontFamily="system-ui, -apple-system, sans-serif">
                {timeLabel}
              </text>
            );
          })}
        </svg>
      </View>

      {/* Modern Status Footnote */}
      <View style={styles.footnoteRow}>
        <View style={styles.legendIndicator}>
          <View style={[styles.legendDot, { backgroundColor: '#22d3ee' }]} />
          <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>
            Water: <Text style={{ color: '#22d3ee', fontWeight: '700' }}>{currentWater.toFixed(1)}%</Text>
          </Text>
        </View>

        <View style={styles.legendIndicator}>
          <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
          <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>
            Temp: <Text style={{ color: '#f59e0b', fontWeight: '700' }}>{currentTemp.toFixed(1)}°C</Text>
          </Text>
        </View>

        <View style={styles.legendIndicator}>
          <View style={[styles.legendDot, { backgroundColor: '#a78bfa' }]} />
          <Text style={[styles.legendLabel, { color: theme.textSecondary }]}>
            Gas: <Text style={{ color: '#a78bfa', fontWeight: '700' }}>{currentGas.toFixed(2)}V</Text>
          </Text>
        </View>
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
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 11,
  },
  svgWrapper: {
    width: '100%',
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footnoteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.12)',
  },
  legendIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
  },
});
