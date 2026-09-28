import { NativeTabs } from "expo-router/unstable-native-tabs";
import { usePathname } from "expo-router";

import { useTheme } from "@/hooks/use-theme";
import { useSanket } from "@/context/SanketContext";
import { border } from "@expo/ui/jetpack-compose/modifiers";

export default function AppTabs() {
  const theme = useTheme();
  const { userFlowStep, currentUser } = useSanket();
  const pathname = usePathname();

  return (
    <NativeTabs
      backgroundColor={theme.surface}
      indicatorColor={theme.primaryLightTab}
      labelStyle={{
        selected: { color: theme.primary },
        default: { color: theme.textSecondary },
      }}
      hidden={userFlowStep !== 'dashboard' || pathname === '/chat'}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="sensors">
        <NativeTabs.Trigger.Label>Live Sensors</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/explore.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="chat">
        <NativeTabs.Trigger.Label>AI Chat</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/chat.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="alerts">
        <NativeTabs.Trigger.Label>Alerts & SOS</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/alerts.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/settings.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
      {currentUser?.role === 'ADMIN' && <NativeTabs.Trigger name="admin">
        <NativeTabs.Trigger.Label>Admin</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon src={require("@/assets/images/tabIcons/settings.png")} renderingMode="template" />
      </NativeTabs.Trigger>}
    </NativeTabs>
  );
}
