import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Linking,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/hooks/use-theme';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSanket, HazardReport } from '@/context/SanketContext';

export default function AlertsScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const {
    activeAlerts,
    hazardReports,
    addHazardReport,
    shelters,
    emergencyContact,
    triggerSosAlert,
    sosTriggered,
  } = useSanket();

  const [activeTab, setActiveTab] = useState<'bulletins' | 'sos' | 'community' | 'shelters'>('bulletins');
  const [reportModalVisible, setReportModalVisible] = useState(false);

  // Form state
  const [reportType, setReportType] = useState<HazardReport['type']>('Waterlogging');
  const [reportLocation, setReportLocation] = useState('');
  const [reportDepth, setReportDepth] = useState('1-2 ft');
  const [reportUrgency, setReportUrgency] = useState<'High' | 'Medium' | 'Low'>('High');

  const contentPadding = Platform.select({
    web: { paddingTop: 76, paddingBottom: 40 },
    default: {
      paddingTop: Math.max(safeAreaInsets.top, 16),
      paddingBottom: Math.max(safeAreaInsets.bottom, 24) + 60,
    },
  });

  const handleReportSubmit = () => {
    if (!reportLocation.trim()) return;
    addHazardReport({
      type: reportType,
      location: reportLocation,
      depth: reportDepth,
      urgency: reportUrgency,
    });
    setReportLocation('');
    setReportModalVisible(false);
  };

  const handleDial = (num: string) => {
    const cleanNum = num.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNum}`).catch(() => {});
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, contentPadding]}>
      <View style={styles.maxWidthWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Alerts &amp; SOS</Text>
          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
            Emergency bulletins &amp; dispatch network
          </Text>
        </View>

        {/* SOS Banner */}
        {sosTriggered && (
          <View style={[styles.sosActiveBanner, { backgroundColor: theme.danger }]}>
            <MaterialCommunityIcons name="alarm-light" size={20} color="#FFF" />
            <Text style={styles.sosActiveText}>
              DISTRESS BEACON BROADCASTING ACROSS SANKET LORA MESH
            </Text>
          </View>
        )}

        {/* Minimal Non-Overlapping Segment Tabs (Scrollable on small screens) */}
        <View style={[styles.segmentWrapper, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.segmentScrollContent}>
            {[
              { key: 'bulletins', label: `Bulletins (${activeAlerts.length})`, icon: 'alert-triangle' },
              { key: 'sos', label: 'Emergency SOS', icon: 'phone-call' },
              { key: 'community', label: `Reports (${hazardReports.length})`, icon: 'send' },
              { key: 'shelters', label: `Shelters (${shelters.length})`, icon: 'map-pin' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <TouchableOpacity
                  key={tab.key}
                  style={[
                    styles.segmentBtn,
                    isActive && {
                      backgroundColor: theme.primary,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.15,
                      shadowRadius: 4,
                    },
                  ]}
                  onPress={() => setActiveTab(tab.key as any)}>
                  <Feather
                    name={tab.icon as any}
                    size={13}
                    color={isActive ? '#FFF' : theme.textSecondary}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.segmentBtnText,
                      {
                        color: isActive ? '#FFF' : theme.textSecondary,
                        fontWeight: isActive ? '700' : '600',
                      },
                    ]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* TAB 1: OFFICIAL BULLETINS */}
        {activeTab === 'bulletins' && (
          <View style={styles.tabSection}>
            {activeAlerts.length === 0 ? (
              <View
                style={[
                  styles.emptyStateCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}>
                <Feather name="check-circle" size={32} color={theme.success} />
                <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                  All River Sectors Clear
                </Text>
                <Text style={[styles.emptyStateDesc, { color: theme.textSecondary }]}>
                  No active flood or flash surge alerts issued by the Flood Forecasting Division.
                </Text>
              </View>
            ) : (
              activeAlerts.map((alert) => (
                <View
                  key={alert.id}
                  style={[
                    styles.bulletinCard,
                    {
                      backgroundColor: theme.card,
                      borderColor: alert.severity === 'CRITICAL' ? theme.danger : theme.warning,
                    },
                  ]}>
                  <View style={styles.bulletinHeader}>
                    <View
                      style={[
                        styles.severityPill,
                        {
                          backgroundColor:
                            alert.severity === 'CRITICAL' ? theme.dangerBg : theme.warningBg,
                        },
                      ]}>
                      <MaterialCommunityIcons
                        name={alert.severity === 'CRITICAL' ? 'alert-octagon' : 'alert'}
                        size={14}
                        color={alert.severity === 'CRITICAL' ? theme.danger : theme.warning}
                      />
                      <Text
                        style={[
                          styles.severityPillText,
                          {
                            color: alert.severity === 'CRITICAL' ? theme.danger : theme.warning,
                          },
                        ]}>
                        {alert.severity} BULLETIN
                      </Text>
                    </View>
                    <Text style={[styles.bulletinTime, { color: theme.textSecondary }]}>
                      {alert.issuedAt}
                    </Text>
                  </View>

                  <Text style={[styles.bulletinTitle, { color: theme.text }]}>{alert.title}</Text>
                  <Text style={[styles.bulletinZone, { color: theme.primary }]}>
                    📍 Affected Sector: {alert.zone}
                  </Text>
                  <Text style={[styles.bulletinMsg, { color: theme.textSecondary }]}>
                    {alert.message}
                  </Text>

                  <View
                    style={[
                      styles.bulletinActionBox,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.cardBorder,
                      },
                    ]}>
                    <Text style={[styles.actionHeader, { color: theme.text }]}>
                      Recommended Action:
                    </Text>
                    <Text style={[styles.actionCopy, { color: theme.textSecondary }]}>
                      {alert.action}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 2: EMERGENCY SOS & FIRST AID */}
        {activeTab === 'sos' && (
          <View style={styles.tabSection}>
            {/* Distress Beacon Card */}
            <View style={[styles.sosBroadcastCard, { backgroundColor: theme.danger }]}>
              <MaterialCommunityIcons name="radio-tower" size={28} color="#FFF" />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.sosBroadcastTitle}>Transmit LoRa Mesh SOS Beacon</Text>
                <Text style={styles.sosBroadcastSub}>
                  Broadcasts emergency GPS packet to all relay nodes within 12km radius.
                </Text>
              </View>
              <TouchableOpacity
                style={styles.sosBroadcastBtn}
                activeOpacity={0.8}
                onPress={triggerSosAlert}>
                <Text style={styles.sosBroadcastBtnText}>SOS</Text>
              </TouchableOpacity>
            </View>

            {/* Direct Dialing Directory */}
            <Text style={[styles.subSectionTitle, { color: theme.text }]}>
              Official Emergency Hotlines
            </Text>

            <View style={styles.contactsGrid}>
              {[
                { name: '112 Unified Emergency Helpline', num: '112', tag: 'All Services' },
                { name: 'State Disaster Control Room', num: '1070', tag: 'Disaster Ops' },
                { name: 'District Emergency Operations (DEOC)', num: '1077', tag: 'Local Collector' },
                { name: 'National Disaster Response Force (NDRF)', num: '011-24363260', tag: 'Water Rescue' },
                { name: 'Ambulance & Trauma Medical Triage', num: '108', tag: 'Paramedic' },
                { name: 'Fire & Water Rescue Battalion', num: '101', tag: 'Fire / Flood' },
              ].map((c) => (
                <TouchableOpacity
                  key={c.num}
                  activeOpacity={0.7}
                  onPress={() => handleDial(c.num)}
                  style={[
                    styles.contactCard,
                    { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  ]}>
                  <View style={styles.contactCardInfo}>
                    <Text
                      style={[styles.contactCardName, { color: theme.text }]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {c.name}
                    </Text>
                    <View style={[styles.tagPill, { backgroundColor: theme.backgroundElement }]}>
                      <Text style={[styles.contactCardTag, { color: theme.textSecondary }]}>
                        {c.tag}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.dialButton, { backgroundColor: theme.primary }]}>
                    <Feather name="phone-call" size={12} color="#FFF" />
                    <Text style={styles.dialButtonText}>{c.num}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* First Aid Tips */}
            <Text style={[styles.subSectionTitle, { color: theme.text, marginTop: Spacing.four }]}>
              Disaster First-Aid &amp; Survival
            </Text>

            {[
              {
                title: 'Hypothermia & Prolonged Submersion',
                desc: 'Strip off soaked clothing immediately. Wrap body in thermal foil blankets or dry wool. Offer warm, sweetened tea or ORS if conscious.',
                icon: 'thermometer',
              },
              {
                title: 'Submerged Electrical Current & Downed Wires',
                desc: 'Never step into standing water in contact with utility poles or sagging wires. De-energize main household breakers before water reaches outlet level.',
                icon: 'zap',
              },
              {
                title: 'Safe Drinking Water & Sanitation',
                desc: 'Drink boiled or chlorine-tablet treated water only. Never ingest floodwater. Keep food stored in sealed plastic containers.',
                icon: 'droplet',
              },
            ].map((tip, idx) => (
              <View
                key={idx}
                style={[
                  styles.tipCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}>
                <View style={[styles.tipIcon, { backgroundColor: theme.backgroundElement }]}>
                  <Feather name={tip.icon as any} size={18} color={theme.primary} />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={[styles.tipTitle, { color: theme.text }]}>{tip.title}</Text>
                  <Text style={[styles.tipDesc, { color: theme.textSecondary }]}>{tip.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: COMMUNITY HAZARD REPORTS */}
        {activeTab === 'community' && (
          <View style={styles.tabSection}>
            {/* Create Report Button */}
            <TouchableOpacity
              style={[styles.createReportBtn, { backgroundColor: theme.primary }]}
              onPress={() => setReportModalVisible(true)}>
              <Feather name="plus-circle" size={16} color="#FFF" />
              <Text style={styles.createReportBtnText}>Report Field Hazard / Waterlogging</Text>
            </TouchableOpacity>

            {/* Reports List */}
            {hazardReports.length === 0 ? (
              <View
                style={[
                  styles.emptyStateCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}>
                <Feather name="check-circle" size={32} color={theme.success} />
                <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                  No Community Hazards Reported
                </Text>
                <Text style={[styles.emptyStateDesc, { color: theme.textSecondary }]}>
                  All roadways and culverts in your sector are reporting clear. Tap above to submit a field report if you observe waterlogging or embankment issues.
                </Text>
              </View>
            ) : (
              hazardReports.map((rep) => (
              <View
                key={rep.id}
                style={[
                  styles.reportCard,
                  { backgroundColor: theme.card, borderColor: theme.cardBorder },
                ]}>
                <View style={styles.reportHeader}>
                  <View style={[styles.hazardPill, { backgroundColor: theme.warningBg }]}>
                    <Text style={[styles.hazardPillText, { color: theme.warning }]}>
                      {rep.type}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: theme.backgroundElement }]}>
                    <Text style={[styles.statusBadgeText, { color: theme.textSecondary }]}>
                      {rep.status}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.reportLoc, { color: theme.text }]}>📍 {rep.location}</Text>

                <View style={styles.reportMetaRow}>
                  <View style={[styles.metaChip, { backgroundColor: theme.backgroundElement }]}>
                    <Text style={[styles.metaKey, { color: theme.textSecondary }]}>Depth: </Text>
                    <Text style={[styles.metaVal, { color: theme.danger }]}>{rep.depth}</Text>
                  </View>
                  <View style={[styles.metaChip, { backgroundColor: theme.backgroundElement }]}>
                    <Text style={[styles.metaKey, { color: theme.textSecondary }]}>Urgency: </Text>
                    <Text style={[styles.metaVal, { color: theme.text }]}>{rep.urgency}</Text>
                  </View>
                  <View style={[styles.metaChip, { backgroundColor: theme.backgroundElement }]}>
                    <Text style={[styles.metaKey, { color: theme.textSecondary }]}>Time: </Text>
                    <Text style={[styles.metaVal, { color: theme.textSecondary }]}>{rep.time}</Text>
                  </View>
                </View>
              </View>
            )))}
          </View>
        )}

        {/* TAB 4: SAFE SHELTERS DIRECTORY */}
        {activeTab === 'shelters' && (
          <View style={styles.tabSection}>
            {shelters.map((shelter) => {
              const occPct = Math.round((shelter.occupied / shelter.capacity) * 100);
              return (
                <View
                  key={shelter.id}
                  style={[
                    styles.shelterCard,
                    { backgroundColor: theme.card, borderColor: theme.cardBorder },
                  ]}>
                  <View style={styles.shelterTopRow}>
                    <View style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
                      <Text
                        style={[styles.shelterName, { color: theme.text }]}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {shelter.name}
                      </Text>
                      <Text
                        style={[styles.shelterAddress, { color: theme.textSecondary }]}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        📍 {shelter.address}
                      </Text>
                    </View>
                    <View style={[styles.distBadge, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[styles.distText, { color: theme.primary }]}>
                        {shelter.distanceKm} km
                      </Text>
                    </View>
                  </View>

                  <View style={styles.elevationRow}>
                    <Feather name="arrow-up-right" size={13} color={theme.success} />
                    <Text style={[styles.elevationText, { color: theme.success }]}>
                      {shelter.elevationM}m ASL High Ground Safe Haven
                    </Text>
                  </View>

                  {/* Occupancy bar */}
                  <View style={styles.occupancySection}>
                    <View style={styles.occLabels}>
                      <Text style={[styles.occText, { color: theme.textSecondary }]}>
                        Capacity: {shelter.occupied} / {shelter.capacity} citizens
                      </Text>
                      <Text style={[styles.occPct, { color: theme.text }]}>{occPct}% Full</Text>
                    </View>
                    <View style={styles.occTrack}>
                      <View
                        style={[
                          styles.occBar,
                          {
                            width: `${occPct}%`,
                            backgroundColor:
                              occPct > 80 ? theme.danger : occPct > 50 ? theme.warning : theme.success,
                          },
                        ]}
                      />
                    </View>
                  </View>

                  {/* Supplies Icons in Wrapped Chips */}
                  <View style={styles.suppliesRow}>
                    {shelter.supplies.food && (
                      <View style={[styles.supplyItemPill, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                        <MaterialCommunityIcons name="food-apple" size={13} color={theme.primary} />
                        <Text style={[styles.supplyText, { color: theme.text }]}>Food Rations</Text>
                      </View>
                    )}
                    {shelter.supplies.medical && (
                      <View style={[styles.supplyItemPill, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                        <MaterialCommunityIcons name="medical-bag" size={13} color={theme.danger} />
                        <Text style={[styles.supplyText, { color: theme.text }]}>Medical Triage</Text>
                      </View>
                    )}
                    {shelter.supplies.power && (
                      <View style={[styles.supplyItemPill, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                        <Feather name="zap" size={13} color={theme.warning} />
                        <Text style={[styles.supplyText, { color: theme.text }]}>Backup Generator</Text>
                      </View>
                    )}
                    {shelter.supplies.boat && (
                      <View style={[styles.supplyItemPill, { backgroundColor: theme.backgroundElement, borderColor: theme.cardBorder }]}>
                        <MaterialCommunityIcons name="sail-boat" size={13} color={theme.primary} />
                        <Text style={[styles.supplyText, { color: theme.text }]}>Rescue Dinghy</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Hazard Report Modal */}
      <Modal visible={reportModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Feather name="send" size={20} color={theme.warning} />
                <Text style={[styles.modalTitle, { color: theme.text }]}>Report Hazard</Text>
              </View>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Feather name="x" size={22} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Submit real-time ground water levels and infrastructure blockage reports.
            </Text>

            <Text style={[styles.formLabel, { color: theme.text }]}>Hazard Category</Text>
            <View style={styles.typeRow}>
              {(['Waterlogging', 'Embankment Seepage', 'Blocked Culvert', 'Submerged Road'] as const).map(
                (t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.typeChip,
                      {
                        backgroundColor:
                          reportType === t ? theme.primary : theme.backgroundElement,
                      },
                    ]}
                    onPress={() => setReportType(t)}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: reportType === t ? '#FFF' : theme.text,
                      }}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={[styles.formLabel, { color: theme.text, marginTop: 12 }]}>
              Street Location / Landmark
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: theme.backgroundElement,
                  color: theme.text,
                  borderColor: theme.cardBorder,
                },
              ]}
              placeholder="e.g. Sluice culvert underpass near Market"
              placeholderTextColor={theme.textSecondary}
              value={reportLocation}
              onChangeText={setReportLocation}
            />

            <Text style={[styles.formLabel, { color: theme.text, marginTop: 12 }]}>
              Observed Water Level
            </Text>
            <View style={styles.typeRow}>
              {['< 6 in', '1-2 ft', '> 3 ft'].map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor:
                        reportDepth === d ? theme.warning : theme.backgroundElement,
                    },
                  ]}
                  onPress={() => setReportDepth(d)}>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: reportDepth === d ? '#FFF' : theme.text,
                    }}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.submitBtn,
                { backgroundColor: theme.primary, opacity: reportLocation ? 1 : 0.5 },
              ]}
              disabled={!reportLocation}
              onPress={handleReportSubmit}>
              <Text style={styles.submitBtnText}>Submit Field Hazard Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    marginBottom: Spacing.three,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
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
  sosActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: Spacing.three,
  },
  sosActiveText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  segmentWrapper: {
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  segmentScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  segmentBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  segmentBtnText: {
    fontSize: 12,
  },
  tabSection: {
    gap: Spacing.three,
  },
  emptyStateCard: {
    padding: Spacing.four,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyStateDesc: {
    fontSize: 13,
    textAlign: 'center',
  },
  bulletinCard: {
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  bulletinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  severityPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bulletinTime: {
    fontSize: 11,
  },
  bulletinTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  bulletinZone: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  bulletinMsg: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  bulletinActionBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionHeader: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionCopy: {
    fontSize: 12,
    lineHeight: 16,
  },
  sosBroadcastCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: Spacing.three,
    borderRadius: 18,
    marginBottom: Spacing.three,
  },
  sosBroadcastTitle: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '800',
  },
  sosBroadcastSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    lineHeight: 15,
  },
  sosBroadcastBtn: {
    backgroundColor: '#FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sosBroadcastBtnText: {
    color: '#DC2626',
    fontWeight: '900',
    fontSize: 13,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  contactsGrid: {
    gap: 8,
    marginBottom: Spacing.three,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  contactCardInfo: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
    gap: 3,
  },
  contactCardName: {
    fontSize: 13,
    fontWeight: '700',
  },
  tagPill: {
    alignSelf: 'flex-start',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
    marginTop: 2,
  },
  contactCardTag: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  dialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexShrink: 0,
  },
  dialButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: Spacing.three,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  tipDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  createReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: Spacing.two,
  },
  createReportBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  reportCard: {
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  hazardPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  hazardPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  reportLoc: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  reportMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: 8,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  metaKey: {
    fontSize: 11,
  },
  metaVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  shelterCard: {
    borderRadius: 16,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: 8,
  },
  shelterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  shelterName: {
    fontSize: 15,
    fontWeight: '800',
  },
  shelterAddress: {
    fontSize: 12,
  },
  distBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  distText: {
    fontSize: 12,
    fontWeight: '700',
  },
  elevationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  elevationText: {
    fontSize: 11,
    fontWeight: '700',
  },
  occupancySection: {
    marginBottom: 10,
  },
  occLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  occText: {
    fontSize: 11,
  },
  occPct: {
    fontSize: 11,
    fontWeight: '700',
  },
  occTrack: {
    height: 6,
    backgroundColor: 'rgba(150, 150, 150, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  occBar: {
    height: '100%',
    borderRadius: 3,
  },
  suppliesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.15)',
    paddingTop: 8,
  },
  supplyItemPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  supplyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.three,
  },
  modalContent: {
    width: '100%',
    maxWidth: 520,
    borderRadius: 20,
    padding: Spacing.four,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.three,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
  },
  submitBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: Spacing.four,
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
