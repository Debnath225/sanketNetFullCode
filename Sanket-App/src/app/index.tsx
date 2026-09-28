import  { useMemo } from 'react';

import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSanket } from '@/context/SanketContext';
import { useTheme } from '@/hooks/use-theme';
import { createStyles } from '@/styles/index.styles';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { GuideStep } from '@/components/onboarding/GuideStep';
import { AuthStep } from '@/components/onboarding/AuthStep';
import { AreaSelectStep } from '@/components/onboarding/AreaSelectStep';
import { SensorActivityChart } from '@/components/SensorActivityChart';
import { DashboardHero } from '@/components/onboarding/DashbordHero';

export default function IndexPage() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const {
    userFlowStep,
    setUserFlowStep,
    selectedArea,
    currentUser,
    areaNodes,
    mqttData,
    simulationScenario,
    setSimulationScenario,
    logout,
    threatLevel,
    shelters,
    sosTriggered,
    triggerSosAlert,
    connection,
  } = useSanket();

  const styles = useMemo(() => createStyles(theme), [theme]);

  // ONBOARDING FLOW GATES
  if (userFlowStep === 'welcome') return <WelcomeStep />;
  if (userFlowStep === 'guide') return <GuideStep />;
  if (userFlowStep === 'auth') return <AuthStep />;
  if (userFlowStep === 'area') return <AreaSelectStep />;

  const isDanger = threatLevel.status === 'CRITICAL';
  const isWarning = threatLevel.status === 'ADVISORY';

  // Sensor calculations from live MQTT stream
  const water = mqttData.waterLevelPct;
  const temp = mqttData.temperatureC;
  const gas = mqttData.gasVoltage;
  const pressure = mqttData.pressureHpa;
  const maxAccel = mqttData.maxAccel;
  const battery = mqttData.batteryPct;
  const batteryVolts = mqttData.batteryVolts;

  const contentPadding = Platform.select({
    web: { paddingTop: 76, paddingBottom: 40 },
    default: {
      paddingTop: Math.max(insets.top, 16),
      paddingBottom: Math.max(insets.bottom, 24) + 60,
    },
  });

  // const handleLogout = () => {
  //   if (Platform.OS === 'web') {
  //     if (typeof window !== 'undefined' && window.confirm('Sign out and return to welcome screen?')) {
  //       logout();
  //     }
  //   } else {
  //     Alert.alert('Sign Out', 'Return to welcome screen?', [
  //       { text: 'Cancel', style: 'cancel' },
  //       { text: 'Sign Out', style: 'destructive', onPress: logout },
  //     ]);
  //   }
  // };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, contentPadding]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.maxWidthWrapper}>

<DashboardHero
  theme={theme}
  selectedArea={selectedArea}
  connection={connection}
  threatLevel={threatLevel}
  mqttData={mqttData}
  onChangeArea={() => setUserFlowStep('area')}
  onOpenAlerts={() => router.push('/alerts')}
  onSOS={triggerSosAlert}
/>

        {/* ================= 2. RIVER BASIN SPILL MARGIN GAUGE ================= */}
        {(() => {
          const maxRiverStage = 6.5;
          const dangerRiverStage = 5.2;
          const warningRiverStage = 3.8;
          const currentRiverStage = Number((1.5 + (water / 100) * 4.3).toFixed(2));
          const remainingMargin = Number((dangerRiverStage - currentRiverStage).toFixed(2));
          const stagePercentage = Math.min(96, Math.max(2, (currentRiverStage / maxRiverStage) * 100));
          const isOverDanger = currentRiverStage >= dangerRiverStage;
          const isOverWarning = currentRiverStage >= warningRiverStage;
          const statusColor = isOverDanger ? theme.danger : isOverWarning ? theme.warning : theme.success;
          const statusBg = isOverDanger ? theme.dangerBg : isOverWarning ? theme.warningBg : theme.successBg;

          return (
            <View style={styles.riverGaugeCard}>
              <View style={styles.riverGaugeHead}>
                <View style={styles.riverGaugeTitleBox}>
                  <Text style={styles.riverGaugeTitle}>
                    River Stage &amp; Spill Margin
                  </Text>
                  <Text style={styles.riverGaugeSub}>
                    Stage: {currentRiverStage}m • Extreme Danger Mark: {dangerRiverStage}m
                  </Text>
                </View>
                <View
                  style={[
                    styles.riverGaugeMarginPill,
                    {
                      backgroundColor: statusBg,
                      borderColor: statusColor,
                    },
                  ]}>
                  <Text style={[styles.riverGaugeMarginVal, { color: statusColor }]}>
                    {isOverDanger
                      ? `SPILL BREACHED (${Math.abs(remainingMargin)}m)`
                      : `+${remainingMargin}m Spill Margin`}
                  </Text>
                </View>
              </View>

              {/* Multi-Zone Visual Gauge Track */}
              <View style={styles.gaugeScaleContainer}>
                <View style={styles.gaugeTrack}>
                  <View style={styles.gaugeZoneSafe} />
                  <View style={styles.gaugeZoneWarning} />
                  <View style={styles.gaugeZoneDanger} />
                </View>

                {/* Needle Pin Marker */}
                <View
                  style={[
                    styles.gaugeIndicatorLine,
                    {
                      backgroundColor: statusColor,
                      marginLeft: `${stagePercentage}%`,
                    },
                  ]}
                />

                {/* Non-overlapping Tick Labels */}
                <View style={styles.gaugeMarkerRow}>
                  <Text style={styles.gaugeTickText}>0.0m</Text>
                  <Text style={styles.gaugeTickText}>3.8m Adv</Text>
                  <Text style={[styles.gaugeTickText, { color: theme.danger, fontWeight: '700' }]}>
                    5.2m Danger
                  </Text>
                  <Text style={styles.gaugeTickText}>6.5m Crest</Text>
                </View>
              </View>
            </View>
          );
        })()}

        {/* ================= 3. 8 CORE TELEMETRY METRIC CARDS ================= */}
        <View style={styles.metricGrid}>
          {/* 1. Water Level */}
          <View style={styles.cardMetric}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Water Level</Text>
              <View style={styles.sensorIcon}>
                <Text style={{ color: theme.primary, fontSize: 15 }}>≋</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {water.toFixed(1)} <Text style={styles.metricUnit}>%</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, Math.max(0, water))}%`,
                    backgroundColor: water > 70 ? theme.danger : theme.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.metricFooter}>
              <Text style={styles.metricFooterLabel}>Flood indicator</Text>
              <Text style={[styles.metricFooterVal, { color: water > 70 ? theme.danger : theme.textSecondary }]}>
                {water > 70 ? 'HIGH' : 'Normal'}
              </Text>
            </View>
          </View>

          {/* 2. Temperature */}
          <View style={styles.cardMetric}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Temperature</Text>
              <View style={styles.sensorIcon}>
                <Text style={{ color: theme.primary, fontSize: 15 }}>°</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {temp.toFixed(1)} <Text style={styles.metricUnit}>°C</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, (temp / 60) * 100)}%`,
                    backgroundColor: temp > 50 ? theme.danger : theme.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.metricFooter}>
              <Text style={styles.metricFooterLabel}>Atmospheric</Text>
              <Text style={[styles.metricFooterVal, { color: temp > 50 ? theme.danger : theme.textSecondary }]}>
                {temp > 50 ? 'HIGH' : 'Normal'}
              </Text>
            </View>
          </View>

          {/* 3. Gas / Smoke */}
          <View style={styles.cardMetric}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Gas / Smoke</Text>
              <View style={styles.sensorIcon}>
                <Text style={{ color: theme.primary, fontSize: 15 }}>◌</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {gas.toFixed(2)} <Text style={styles.metricUnit}>V</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, (gas / 3.3) * 100)}%`,
                    backgroundColor: gas > 1.5 ? theme.danger : theme.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.metricFooter}>
              <Text style={styles.metricFooterLabel}>MQ-2 analog</Text>
              <Text style={[styles.metricFooterVal, { color: gas > 1.5 ? theme.danger : theme.textSecondary }]}>
                {gas > 1.5 ? 'ELEVATED' : 'Normal'}
              </Text>
            </View>
          </View>

          {/* 4. Pressure */}
          <View style={styles.cardMetric}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Pressure</Text>
              <View style={styles.sensorIcon}>
                <Text style={{ color: theme.primary, fontSize: 15 }}>⌁</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {pressure.toFixed(0)} <Text style={styles.metricUnit}>hPa</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, Math.max(0, ((pressure - 900) / 150) * 100))}%`,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.metricFooter}>
              <Text style={styles.metricFooterLabel}>BMP180</Text>
              <Text style={styles.metricFooterVal}>Atmospheric</Text>
            </View>
          </View>

          {/* 5. Max Acceleration */}
          <View style={styles.cardMetric}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Max Acceleration</Text>
              <View style={styles.sensorIcon}>
                <Text style={{ color: theme.primary, fontSize: 15 }}>✣</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {maxAccel.toFixed(2)} <Text style={styles.metricUnit}>m/s²</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, (maxAccel / 8) * 100)}%`,
                    backgroundColor: maxAccel > 4 ? theme.danger : theme.primary,
                  },
                ]}
              />
            </View>
            <View style={styles.metricFooter}>
              <Text style={styles.metricFooterLabel}>MPU6050</Text>
              <Text style={[styles.metricFooterVal, { color: maxAccel > 4 ? theme.danger : theme.textSecondary }]}>
                {maxAccel > 4 ? 'UNSTABLE' : 'Stable'}
              </Text>
            </View>
          </View>

          {/* 6. Battery */}
          <View style={styles.cardMetric}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Battery</Text>
              <View style={styles.sensorIcon}>
                <Text style={{ color: theme.primary, fontSize: 15 }}>▮</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>
              {battery.toFixed(0)} <Text style={styles.metricUnit}>%</Text>
            </Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  {
                    width: `${Math.min(100, Math.max(0, battery))}%`,
                    backgroundColor: battery <= 20 ? theme.danger : theme.success,
                  },
                ]}
              />
            </View>
            <View style={styles.metricFooter}>
              <Text style={styles.metricFooterLabel}>{batteryVolts.toFixed(2)} V</Text>
              <Text style={[styles.metricFooterVal, { color: battery <= 20 ? theme.danger : theme.success }]}>
                {battery <= 20 ? 'LOW' : 'Healthy'}
              </Text>
            </View>
          </View>

          {/* 7. Data Packets */}
          <View style={styles.cardMetric}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Data Packets</Text>
              <View style={styles.sensorIcon}>
                <Text style={{ color: theme.primary, fontSize: 15 }}>↯</Text>
              </View>
            </View>
            <Text style={styles.metricValue}>{mqttData.packetCount}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '100%', backgroundColor: theme.primary }]} />
            </View>
            <View style={styles.metricFooter}>
              <Text style={styles.metricFooterLabel}>MQTT received</Text>
              <Text style={[styles.metricFooterVal, { color: theme.success }]}>Live</Text>
            </View>
          </View>

          {/* 8. Device Status */}
          <View style={styles.cardMetric}>
            <View style={styles.cardHead}>
              <Text style={styles.cardTitle}>Device Status</Text>
              <View style={styles.sensorIcon}>
                <Text style={{ color: theme.success, fontSize: 15 }}>●</Text>
              </View>
            </View>
            <Text style={[styles.metricValue, { fontSize: 20, color: theme.success }]}>
              {mqttData.deviceStatus || 'ONLINE'}
            </Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressBar, { width: '100%', backgroundColor: theme.success }]} />
            </View>
            <View style={styles.metricFooter}>
              <Text style={styles.metricFooterLabel}>ESP32-S3</Text>
              <Text style={styles.metricFooterVal}>Telemetry active</Text>
            </View>
          </View>
        </View>

        {/* ================= 4. SENSOR ACTIVITY TIMELINE & HAZARD SUMMARY ================= */}
        <View style={styles.twoCol}>
          {/* Left Panel: Sensor Activity Timeline */}
          <View style={[styles.cardPanel, { flex: 1.45 }]}>
            <View style={styles.cardHeading}>
              <View>
                <Text style={styles.cardHeadingTitle}>Sensor Activity</Text>
                <Text style={styles.cardHeadingSub}>Last 60 readings</Text>
              </View>
            </View>
            <SensorActivityChart
              waterHistory={mqttData.waterHistory}
              tempHistory={mqttData.tempHistory}
              gasHistory={mqttData.gasHistory}
              currentWater={water}
              currentTemp={temp}
              currentGas={gas}
            />
          </View>

          {/* Right Panel: Hazard Summary */}
          <View style={[styles.cardPanel, { flex: 0.8 }]}>
            <View style={styles.cardHeading}>
              <View>
                <Text style={styles.cardHeadingTitle}>Hazard Summary</Text>
                <Text style={styles.cardHeadingSub}>Real-time</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Current condition</Text>
              <Text
                style={[
                  styles.infoValue,
                  { color: isDanger ? theme.danger : isWarning ? theme.warning : theme.success },
                ]}>
                {isDanger ? (mqttData.hazardType || 'SURGE').toUpperCase() : 'NORMAL'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Water level</Text>
              <Text style={[styles.infoValue, { color: water > 70 ? theme.danger : theme.primary }]}>
                {water.toFixed(1)} %
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Temperature</Text>
              <Text style={styles.infoValue}>{temp.toFixed(1)} °C</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gas voltage</Text>
              <Text style={[styles.infoValue, { color: gas > 1.5 ? theme.danger : theme.text }]}>
                {gas.toFixed(2)} V
              </Text>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <Text style={styles.infoLabel}>Motion</Text>
              <Text style={[styles.infoValue, { color: maxAccel > 4 ? theme.danger : theme.text }]}>
                {maxAccel.toFixed(2)} m/s²
              </Text>
            </View>
          </View>
        </View>

        {/* ================= 5. HAZARD INTELLIGENCE 4-GRID ================= */}
        <View style={styles.hazardGrid}>
          {/* Flood Risk */}
          <View style={[styles.hazardCard, water > 70 && styles.hazardCardActive]}>
            <Text style={[styles.hazardSymbol, { color: theme.primary }]}>≋</Text>
            <Text style={styles.hazardCardTitle}>Flood Risk</Text>
            <Text style={styles.hazardCardDesc}>
              Water-level monitoring for rising water conditions.
            </Text>
            <Text style={[styles.hazardState, { color: water > 70 ? theme.danger : theme.success }]}>
              {water > 70 ? '● ACTIVE' : '● NORMAL'}
            </Text>
          </View>

          {/* Fire / Smoke */}
          <View style={[styles.hazardCard, gas > 1.5 && styles.hazardCardActive]}>
            <Text style={[styles.hazardSymbol, { color: theme.warning }]}>△</Text>
            <Text style={styles.hazardCardTitle}>Fire / Smoke</Text>
            <Text style={styles.hazardCardDesc}>
              Temperature and gas/smoke sensor correlation.
            </Text>
            <Text style={[styles.hazardState, { color: gas > 1.5 ? theme.danger : theme.success }]}>
              {gas > 1.5 ? '● ACTIVE' : '● NORMAL'}
            </Text>
          </View>

          {/* Landslide / Movement */}
          <View style={[styles.hazardCard, maxAccel > 4 && styles.hazardCardActive]}>
            <Text style={[styles.hazardSymbol, { color: theme.danger }]}>⌁</Text>
            <Text style={styles.hazardCardTitle}>Landslide / Movement</Text>
            <Text style={styles.hazardCardDesc}>
              Accelerometer and gyroscope based movement detection.
            </Text>
            <Text style={[styles.hazardState, { color: maxAccel > 4 ? theme.danger : theme.success }]}>
              {maxAccel > 4 ? '● ACTIVE' : '● NORMAL'}
            </Text>
          </View>

          {/* System Health */}
          <View style={styles.hazardCard}>
            <Text style={[styles.hazardSymbol, { color: theme.success }]}>◎</Text>
            <Text style={styles.hazardCardTitle}>System Health</Text>
            <Text style={styles.hazardCardDesc}>
              Connectivity, battery and telemetry availability.
            </Text>
            <Text style={[styles.hazardState, { color: theme.success }]}>
              ● ONLINE
            </Text>
          </View>
        </View>

        {/* ================= 6. CATCHMENT TELEMETRY NODES ================= */}
        <View style={styles.nodesCard}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ color: theme.text, fontSize: 14, fontWeight: '800' }}>
                CATCHMENT TELEMETRY NODES
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 1 }}>
                Distributed LoRa sensor nodes across {selectedArea.name}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 10,
                backgroundColor: theme.primaryLight,
              }}
              onPress={() => setUserFlowStep('area')}>
              <Feather name="map" size={12} color={theme.primary} />
              <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '700' }}>
                Open Map
              </Text>
            </TouchableOpacity>
          </View>

          {areaNodes.map((node) => {
            const isDangerNode = node.waterLevel >= node.waterLevelDanger;
            const isWarningNode = node.waterLevel >= node.waterLevelDanger * 0.85;
            const nodeColor = isDangerNode ? theme.danger : isWarningNode ? theme.warning : theme.success;
            return (
              <View key={node.id} style={styles.nodeRowItem}>
                <View style={styles.nodeRowLeft}>
                  <View style={[styles.nodeRowDot, { backgroundColor: nodeColor }]} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    <Text style={styles.nodeRowName} numberOfLines={1}>{node.name}</Text>
                    <Text style={styles.nodeRowLocation} numberOfLines={1}>{node.location}</Text>
                  </View>
                </View>
                <View style={styles.nodeRowRight}>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.nodeRowWaterVal, { color: nodeColor }]}>
                      {node.waterLevel.toFixed(2)}m
                    </Text>
                    <Text style={styles.nodeRowBatteryText}>
                      Max {node.waterLevelMax}m
                    </Text>
                  </View>
                  <View
                    style={{
                      paddingVertical: 3,
                      paddingHorizontal: 7,
                      borderRadius: 6,
                      backgroundColor: isDangerNode ? theme.dangerBg : isWarningNode ? theme.warningBg : theme.successBg,
                    }}>
                    <Text style={{ fontSize: 9.5, fontWeight: '800', color: nodeColor }}>
                      {isDangerNode ? 'CRITICAL' : isWarningNode ? 'ADVISORY' : 'NORMAL'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* ================= 7. EMERGENCY QUICK ACTIONS ================= */}
        <View style={styles.quickActionsRow}>
          {/* 1. SOS Dispatch */}
          <TouchableOpacity
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: sosTriggered ? theme.danger : theme.dangerBg,
                borderColor: theme.danger,
              },
            ]}
            activeOpacity={0.8}
            onPress={triggerSosAlert}>
            <View
              style={[
                styles.quickActionIconBox,
                { backgroundColor: sosTriggered ? '#FFFFFF' : theme.danger },
              ]}>
              <MaterialCommunityIcons
                name="alarm-light"
                size={18}
                color={sosTriggered ? theme.danger : '#FFFFFF'}
              />
            </View>
            <View style={styles.quickActionTextBox}>
              <Text
                style={[
                  styles.quickActionTitle,
                  { color: sosTriggered ? '#FFFFFF' : theme.danger },
                ]}>
                {sosTriggered ? 'SOS ACTIVE' : 'EMERGENCY SOS'}
              </Text>
              <Text
                style={[
                  styles.quickActionSub,
                  { color: sosTriggered ? '#FFFFFF' : theme.textSecondary },
                ]}
                numberOfLines={1}>
                {sosTriggered ? 'NDRF Dispatched' : '1-Tap Rescue Beacon'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 2. Nearest Shelter */}
          <TouchableOpacity
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => router.push('/alerts')}>
            <View
              style={[
                styles.quickActionIconBox,
                { backgroundColor: theme.primary },
              ]}>
              <Feather name="shield" size={17} color="#FFFFFF" />
            </View>
            <View style={styles.quickActionTextBox}>
              <Text style={[styles.quickActionTitle, { color: theme.primary }]}>
                EVACUATION SHELTER
              </Text>
              <Text style={[styles.quickActionSub, { color: theme.textSecondary }]} numberOfLines={1}>
                {shelters[0]?.name ? `${shelters[0].name.slice(0, 16)}... (${shelters[0].distanceKm}km)` : 'High-Ground Camps'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* 3. Report Hazard */}
          <TouchableOpacity
            style={[
              styles.quickActionBtn,
              {
                backgroundColor: theme.warningBg,
                borderColor: theme.warning,
              },
            ]}
            activeOpacity={0.8}
            onPress={() => router.push('/alerts')}>
            <View
              style={[
                styles.quickActionIconBox,
                { backgroundColor: theme.warning },
              ]}>
              <Feather name="alert-triangle" size={17} color="#FFFFFF" />
            </View>
            <View style={styles.quickActionTextBox}>
              <Text style={[styles.quickActionTitle, { color: theme.warning }]}>
                REPORT HAZARD
              </Text>
              <Text style={[styles.quickActionSub, { color: theme.textSecondary }]} numberOfLines={1}>
                Log street surge / waterlogging
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ================= 8. SYSTEM FOOTER ================= */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>SANKAT-NET • ENVIRONMENTAL MONITORING PLATFORM</Text>
          <Text style={styles.footerText}>ESP32-S3 • MQTT • REAL-TIME TELEMETRY</Text>
        </View>
      </View>
    </ScrollView>
  );
}