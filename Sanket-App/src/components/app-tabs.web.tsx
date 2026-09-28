import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import { usePathname } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, View, Text, StyleSheet, useWindowDimensions } from 'react-native';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useSanket } from '@/context/SanketContext';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabs() {
  const { userFlowStep, currentUser } = useSanket();
  const pathname = usePathname();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList isVisible={userFlowStep === 'dashboard' && pathname !== '/chat'}>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="home">Safety Hub</TabButton>
          </TabTrigger>
          <TabTrigger name="sensors" href="/sensors" asChild>
            <TabButton icon="activity">Live Sensors</TabButton>
          </TabTrigger>
          <TabTrigger name="chat" href="/chat" asChild>
            <TabButton icon="message-square">AI Assistant</TabButton>
          </TabTrigger>
          <TabTrigger name="alerts" href="/alerts" asChild>
            <TabButton icon="alert-triangle">Alerts & SOS</TabButton>
          </TabTrigger>
          <TabTrigger name="settings" href="/settings" asChild>
            <TabButton icon="settings">Settings</TabButton>
          </TabTrigger>
          {currentUser?.role === 'ADMIN' && <TabTrigger name="admin" href="/admin" asChild>
            <TabButton icon="shield">Admin</TabButton>
          </TabTrigger>}
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({
  children,
  isFocused,
  icon,
  ...props
}: TabTriggerSlotProps & { icon?: any }) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isCompact = width < 640;

  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View
        style={[
          styles.tabButtonView,
          isCompact && { paddingHorizontal: 8, paddingVertical: 5 },
          isFocused
            ? {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
                borderWidth: 1,
              }
            : {
                backgroundColor: 'transparent',
                borderColor: 'transparent',
                borderWidth: 1,
              },
        ]}>
        {icon && (
          <Feather
            name={icon}
            size={isCompact ? 13 : 14}
            color={isFocused ? theme.primary : theme.textSecondary}
          />
        )}
        <Text
          style={{
            color: isFocused ? theme.primary : theme.textSecondary,
            fontSize: isCompact ? 11 : 13,
            fontWeight: isFocused ? '800' : '600',
          }}>
          {children}
        </Text>
      </View>
    </Pressable>
  );
}

export function CustomTabList({
  isVisible = true,
  ...props
}: TabListProps & { isVisible?: boolean }) {
  const theme = useTheme();
  const { threatLevel } = useSanket();
  const { width } = useWindowDimensions();
  const isSmall = width < 720;
  const isTiny = width < 480;

  return (
    <View
      {...props}
      style={[
        styles.tabListContainer,
        !isVisible && { display: 'none' },
      ]}>
      <View
        style={[
          styles.innerContainer,
          {
            backgroundColor: theme.surface,
            borderColor: theme.cardBorder,
            borderWidth: 1,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 16,
          },
          isSmall && { paddingHorizontal: Spacing.two, gap: Spacing.one },
        ]}>
        {/* Brand Header */}
        {!isTiny && (
          <View style={styles.brandRow}>
            <View style={[styles.brandIcon, { backgroundColor: theme.primary }]}>
              <MaterialCommunityIcons name="waves" size={16} color="#FFFFFF" />
            </View>
            {!isSmall && (
              <View>
                <Text style={[styles.brandText, { color: theme.text, fontWeight: '700' }]}>
                  SanketNet
                </Text>
                <View style={styles.liveIndicator}>
                  <View
                    style={[
                      styles.pulsingDot,
                      {
                        backgroundColor:
                          threatLevel.status === 'CRITICAL'
                            ? theme.danger
                            : threatLevel.status === 'ADVISORY'
                            ? theme.warning
                            : theme.success,
                      },
                    ]}
                  />
                  <Text style={{ fontSize: 10, color: theme.textSecondary }}>
                    LoRa Active
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={styles.tabsRow}>{props.children}</View>

        {/* Threat Alert Badge in Navbar */}
        <View
          style={[
            styles.alertPill,
            {
              backgroundColor:
                threatLevel.status === 'CRITICAL'
                  ? theme.dangerBg
                  : threatLevel.status === 'ADVISORY'
                  ? theme.warningBg
                  : theme.successBg,
              borderColor:
                threatLevel.status === 'CRITICAL'
                  ? theme.danger
                  : threatLevel.status === 'ADVISORY'
                  ? theme.warning
                  : theme.success,
            },
            isTiny && { display: 'none' },
          ]}>
          <Feather
            name={threatLevel.status === 'CRITICAL' ? 'alert-octagon' : 'shield'}
            size={12}
            color={
              threatLevel.status === 'CRITICAL'
                ? theme.danger
                : threatLevel.status === 'ADVISORY'
                ? theme.warning
                : theme.success
            }
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: '700',
              color:
                threatLevel.status === 'CRITICAL'
                  ? theme.danger
                  : threatLevel.status === 'ADVISORY'
                  ? theme.warning
                  : theme.success,
            }}>
            {threatLevel.score}%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    width: '100%',
    paddingHorizontal: Spacing.two,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    pointerEvents: 'box-none' as any,
  },
  innerContainer: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexGrow: 0,
    gap: Spacing.two,
    maxWidth: MaxContentWidth,
    backdropFilter: 'blur(16px)',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandText: {
    fontSize: 13,
    letterSpacing: 0.3,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pulsingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tabsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  tabButtonView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  alertPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
});
