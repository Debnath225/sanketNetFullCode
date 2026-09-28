import { StyleSheet } from 'react-native';
import { ColorPalette, MaxContentWidth, Spacing } from '@/constants/theme';

export function createStyles(theme: ColorPalette) {
  return StyleSheet.create({
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
      gap: 14,
    },

    /* Header */
    header: {
      marginBottom: 4,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 10,
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
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    areaPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderWidth: 1,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 14,
    },
    areaPillText: {
      fontSize: 11.5,
      fontWeight: '700',
    },
    simBtn: {
      paddingVertical: 6,
      paddingHorizontal: 11,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    simBtnText: {
      color: '#FFFFFF',
      fontSize: 11.5,
      fontWeight: '800',
      letterSpacing: 0.3,
    },
    userProfileBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    userInitials: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },

    /* Alert Banner */
    alertBanner: {
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1.5,
      gap: 12,
      flexWrap: 'wrap',
    },
    alertNormal: {
      borderColor: theme.success,
      backgroundColor: theme.successBg,
    },
    alertWarning: {
      borderColor: theme.warning,
      backgroundColor: theme.warningBg,
    },
    alertDanger: {
      borderColor: theme.danger,
      backgroundColor: theme.dangerBg,
    },
    alertLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      flex: 1,
      minWidth: 220,
    },
    alertIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    alertIconNormal: {
      backgroundColor: theme.successBg,
    },
    alertIconWarning: {
      backgroundColor: theme.warningBg,
    },
    alertIconDanger: {
      backgroundColor: theme.dangerBg,
    },
    alertIconText: {
      fontSize: 22,
      fontWeight: '900',
    },
    alertStatusLabel: {
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1.2,
      fontSize: 9.5,
      fontWeight: '700',
    },
    alertTitle: {
      color: theme.text,
      fontSize: 17,
      fontWeight: '800',
      marginTop: 2,
    },
    alertSub: {
      color: theme.textSecondary,
      fontSize: 11.5,
      marginTop: 2,
      lineHeight: 15,
    },
    alertTimeBox: {
      alignItems: 'flex-end',
      flexShrink: 0,
    },
    alertTimeLabel: {
      color: theme.textSecondary,
      fontSize: 8.5,
      fontWeight: '700',
      letterSpacing: 0.8,
    },
    alertTimeValue: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 2,
    },

    /* River Basin Spill Margin Gauge */
    riverGaugeCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 15,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
    },
    riverGaugeHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
      flexWrap: 'wrap',
      gap: 8,
    },
    riverGaugeTitleBox: {
      flex: 1,
      minWidth: 200,
    },
    riverGaugeTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
    },
    riverGaugeSub: {
      color: theme.textSecondary,
      fontSize: 11,
      marginTop: 2,
    },
    riverGaugeMarginPill: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
    },
    riverGaugeMarginVal: {
      fontSize: 11.5,
      fontWeight: '800',
    },
    gaugeScaleContainer: {
      marginTop: 6,
      marginBottom: 6,
    },
    gaugeTrack: {
      height: 10,
      borderRadius: 5,
      flexDirection: 'row',
      overflow: 'hidden',
      backgroundColor: theme.backgroundElement,
    },
    gaugeZoneSafe: {
      flex: 3.5,
      backgroundColor: '#22C55E',
      opacity: 0.85,
    },
    gaugeZoneWarning: {
      flex: 1.3,
      backgroundColor: '#F59E0B',
      opacity: 0.85,
    },
    gaugeZoneDanger: {
      flex: 1.7,
      backgroundColor: '#EF4444',
      opacity: 0.85,
    },
    gaugeMarkerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    gaugeTickText: {
      color: theme.textSecondary,
      fontSize: 9.5,
      fontWeight: '600',
    },
    gaugeIndicatorLine: {
      height: 6,
      width: 14,
      borderRadius: 3,
      alignSelf: 'center',
      marginTop: -8,
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
    },

    /* 8 Core Telemetry Cards Grid */
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    cardMetric: {
      flexBasis: '22%',
      flexGrow: 1,
      minWidth: 160,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 15,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 2,
    },
    cardHead: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardTitle: {
      color: theme.textSecondary,
      fontSize: 10,
      textTransform: 'uppercase',
      letterSpacing: 1,
      fontWeight: '700',
    },
    sensorIcon: {
      width: 28,
      height: 28,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.primaryLight,
    },
    metricValue: {
      color: theme.text,
      fontSize: 26,
      fontWeight: '800',
      marginTop: 12,
      letterSpacing: -0.5,
    },
    metricUnit: {
      color: theme.textSecondary,
      fontSize: 12,
      fontWeight: '500',
    },
    progressTrack: {
      height: 5,
      backgroundColor: theme.backgroundElement,
      borderRadius: 5,
      marginTop: 10,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 5,
    },
    metricFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    metricFooterLabel: {
      color: theme.textSecondary,
      fontSize: 10,
    },
    metricFooterVal: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: '700',
    },

    /* Two Column Section */
    twoCol: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 14,
    },
    cardPanel: {
      flex: 1,
      minWidth: 300,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 15,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
    },
    cardHeading: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    cardHeadingTitle: {
      color: theme.text,
      fontSize: 14,
      fontWeight: '800',
    },
    cardHeadingSub: {
      color: theme.textSecondary,
      fontSize: 10.5,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: theme.cardBorder,
      paddingVertical: 11,
    },
    infoLabel: {
      color: theme.textSecondary,
      fontSize: 11.5,
    },
    infoValue: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '700',
    },

    /* Hazard Intelligence 4-Grid */
    hazardGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    hazardCard: {
      flexBasis: '22%',
      flexGrow: 1,
      minWidth: 160,
      padding: 16,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      backgroundColor: theme.card,
    },
    hazardCardActive: {
      borderColor: 'rgba(239, 68, 68, 0.6)',
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
    hazardSymbol: {
      fontSize: 24,
      marginBottom: 8,
    },
    hazardCardTitle: {
      color: theme.text,
      fontSize: 13.5,
      fontWeight: '800',
    },
    hazardCardDesc: {
      color: theme.textSecondary,
      fontSize: 10.5,
      marginTop: 4,
      lineHeight: 14,
    },
    hazardState: {
      marginTop: 12,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },

    /* Catchment Telemetry Nodes */
    nodesCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.cardBorder,
      borderRadius: 15,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 10,
      elevation: 3,
    },
    nodeRowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(150, 150, 150, 0.1)',
      gap: 10,
    },
    nodeRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flex: 1,
      minWidth: 0,
    },
    nodeRowDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      flexShrink: 0,
    },
    nodeRowName: {
      color: theme.text,
      fontSize: 12.5,
      fontWeight: '700',
    },
    nodeRowLocation: {
      color: theme.textSecondary,
      fontSize: 10.5,
      marginTop: 1,
    },
    nodeRowRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0,
    },
    nodeRowWaterVal: {
      fontSize: 13,
      fontWeight: '800',
    },
    nodeRowBatteryText: {
      color: theme.textSecondary,
      fontSize: 9.5,
    },

    /* Emergency Quick Actions */
    quickActionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    quickActionBtn: {
      flex: 1,
      minWidth: 160,
      borderRadius: 14,
      borderWidth: 1.5,
      paddingVertical: 12,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      elevation: 2,
    },
    quickActionIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    quickActionTextBox: {
      flex: 1,
      minWidth: 0,
    },
    quickActionTitle: {
      fontSize: 12,
      fontWeight: '800',
    },
    quickActionSub: {
      fontSize: 10,
      marginTop: 2,
    },

    /* System Footer */
    footer: {
      alignItems: 'center',
      paddingVertical: 16,
      gap: 4,
    },
    footerText: {
      color: theme.textSecondary,
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
  });
}
