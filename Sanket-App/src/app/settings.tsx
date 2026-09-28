import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ModernSwitch } from "@/components/ModernSwitch";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { ThreatStatus, useSanket } from "@/context/SanketContext";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const {
    simulationScenario,
    setSimulationScenario,
    emergencyContact,
    updateEmergencyContact,
    themePreference,
    setThemePreference,
    resolvedTheme,
    mqttData,
    connection,
    setServerUrl,
    testConnection,
    currentUser,
    updateAccount,
    deleteAccount,
    logout,
  } = useSanket();

  const [editingAccount, setEditingAccount] = useState(false);
  const [accountName, setAccountName] = useState(currentUser?.name ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [accountMessage, setAccountMessage] = useState<string | null>(null);

  // Contact editing state
  const [contactName, setContactName] = useState(emergencyContact.name);
  const [contactPhone, setContactPhone] = useState(emergencyContact.phone);
  const [contactRel, setContactRel] = useState(emergencyContact.relationship);
  const [savedContactMsg, setSavedContactMsg] = useState(false);

  // App-Related Preferences & Customizations
  const [unitWater, setUnitWater] = useState<"m" | "ft">("m");
  const [unitTemp, setUnitTemp] = useState<"C" | "F">("C");
  const [unitDistance, setUnitDistance] = useState<"km" | "mi">("km");
  const [defaultMapType, setDefaultMapType] = useState<
    "standard" | "satellite"
  >("standard");
  const [autoFocusAlertNodes, setAutoFocusAlertNodes] = useState(true);
  const [alertSensitivity, setAlertSensitivity] = useState<
    "standard" | "high" | "critical-only"
  >("standard");

  // Toggles
  const [sirenEnabled, setSirenEnabled] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [vibrationAlert, setVibrationAlert] = useState(true);
  const [smsFallback, setSmsFallback] = useState(true);
  const [highFreqTelemetry, setHighFreqTelemetry] = useState(false);
  const [meshPowerSave, setMeshPowerSave] = useState(true);
  const [cacheSynced, setCacheSynced] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Server connection state
  const [editServerUrl, setEditServerUrl] = useState(connection.serverUrl);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);

  const contentPadding = Platform.select({
    web: { paddingTop: 76, paddingBottom: 40 },
    default: {
      paddingTop: Math.max(safeAreaInsets.top, 16),
      paddingBottom: Math.max(safeAreaInsets.bottom, 24) + 60,
    },
  });

  const handleSaveContact = () => {
    updateEmergencyContact({
      name: contactName,
      phone: contactPhone,
      relationship: contactRel,
    });
    setSavedContactMsg(true);
    setTimeout(() => setSavedContactMsg(false), 3000);
  };

  const handleSyncCache = () => {
    setCacheSynced(true);
    setTimeout(() => setCacheSynced(false), 3000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setTestResult(null);
    const result = await testConnection(editServerUrl);
    setTestResult(
      result.ok
        ? { ok: true, message: "Connected successfully!" }
        : { ok: false, message: result.error ?? "Connection failed" },
    );
    setIsTestingConnection(false);
    if (result.ok) {
      setTimeout(() => setTestResult(null), 4000);
    }
  };

  const handleSaveServerUrl = async () => {
    await setServerUrl(editServerUrl);
    setTestResult({ ok: true, message: "Server URL saved & reconnecting…" });
    setTimeout(() => setTestResult(null), 3000);
  };

  const handleSaveAccount = async () => {
    if (!currentPassword) return setAccountMessage("Enter your current password to save changes.");
    if (newPassword && newPassword.length < 8) return setAccountMessage("New password must be at least 8 characters.");
    const result = await updateAccount({ username: accountName.trim(), currentPassword, newPassword: newPassword || undefined });
    if (!result.success) return setAccountMessage(result.error === "incorrect_password" ? "Current password is incorrect." : result.error ?? "Unable to save account.");
    setCurrentPassword("");
    setNewPassword("");
    setEditingAccount(false);
    setAccountMessage("Account details saved.");
  };

  const handleDeleteAccount = () => {
    const remove = async () => {
      const result = await deleteAccount();
      if (!result.success) setAccountMessage(result.error ?? "Unable to delete account.");
    };
    if (Platform.OS === "web") {
      if (window.confirm("Delete your account and chat history permanently?")) remove();
    } else Alert.alert("Delete account?", "Your account and chat history will be permanently removed.", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: remove }]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.contentContainer, contentPadding]}
    >
      <View style={styles.maxWidthWrapper}>
        {/* Short, Clean Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
          <Text style={[styles.subTitle, { color: theme.textSecondary }]}>
            App customizations &amp; ESP32-S3 hardware diagnostics
          </Text>
        </View>

        {/* ACCOUNT */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
          <View style={styles.sectionHeader}>
            <Feather name="user" size={18} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>Profile & Account</Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>{currentUser?.role === "ADMIN" ? "Administrator account" : "Manage your personal SanketNet account"}</Text>
            </View>
          </View>
          <View style={[styles.serverStatusRow, { backgroundColor: theme.backgroundElement }]}>
            <View style={{ flex: 1 }}><Text style={[styles.hwLabel, { color: theme.textSecondary }]}>SIGNED IN AS</Text><Text style={[styles.hwVal, { color: theme.text }]}>{currentUser?.name ?? "User"}</Text></View>
            <Text style={[styles.onlineText, { color: theme.primary }]}>{currentUser?.role ?? "USER"}</Text>
          </View>
          {accountMessage && <Text style={{ color: accountMessage.includes("saved") ? theme.success : theme.danger, fontSize: 12, fontWeight: "600" }}>{accountMessage}</Text>}
          {editingAccount && currentUser?.role !== "ADMIN" && <View style={{ gap: 10 }}>
            <TextInput style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.cardBorder }]} value={accountName} onChangeText={setAccountName} placeholder="Username" placeholderTextColor={theme.textSecondary} autoCapitalize="none" />
            <TextInput style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.cardBorder }]} value={currentPassword} onChangeText={setCurrentPassword} placeholder="Current password (required)" placeholderTextColor={theme.textSecondary} secureTextEntry />
            <TextInput style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.cardBorder }]} value={newPassword} onChangeText={setNewPassword} placeholder="New password (optional)" placeholderTextColor={theme.textSecondary} secureTextEntry />
          </View>}
          <View style={styles.serverBtnRow}>
            {currentUser?.role !== "ADMIN" && <TouchableOpacity style={[styles.cacheBtn, { borderColor: theme.primary }]} onPress={editingAccount ? handleSaveAccount : () => setEditingAccount(true)}><Feather name={editingAccount ? "check" : "edit-3"} size={14} color={theme.primary} /><Text style={[styles.cacheBtnText, { color: theme.primary }]}>{editingAccount ? "Save Account" : "Edit Account"}</Text></TouchableOpacity>}
            <TouchableOpacity style={[styles.cacheBtn, { borderColor: theme.cardBorder }]} onPress={logout}><Feather name="log-out" size={14} color={theme.textSecondary} /><Text style={[styles.cacheBtnText, { color: theme.textSecondary }]}>Sign Out</Text></TouchableOpacity>
          </View>
          {currentUser?.role !== "ADMIN" && <TouchableOpacity onPress={handleDeleteAccount}><Text style={{ color: theme.danger, fontSize: 12, fontWeight: "700", textAlign: "center" }}>Delete account permanently</Text></TouchableOpacity>}
        </View>

        {/* SECTION 0: SERVER CONNECTION */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="server" size={18} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Server Connection
              </Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Backend API endpoint and real-time WebSocket link
              </Text>
            </View>
            <View
              style={[
                styles.onlineBadge,
                {
                  backgroundColor: connection.mode === "live"
                    ? theme.successBg
                    : `${theme.warning}18`,
                  borderColor: connection.mode === "live"
                    ? theme.success
                    : `${theme.warning}50`,
                },
              ]}
            >
              <View
                style={[
                  styles.onlineDot,
                  {
                    backgroundColor: connection.mode === "live"
                      ? theme.success
                      : theme.warning,
                  },
                ]}
              />
              <Text
                style={[
                  styles.onlineText,
                  {
                    color: connection.mode === "live"
                      ? theme.success
                      : theme.warning,
                  },
                ]}
              >
                {connection.mode === "live" ? "LIVE" : "OFFLINE"}
              </Text>
            </View>
          </View>

          {/* Status Row */}
          <View
            style={[
              styles.serverStatusRow,
              { backgroundColor: theme.backgroundElement },
            ]}
          >
            <View style={styles.serverStatusItem}>
              <Text style={[styles.hwLabel, { color: theme.textSecondary }]}>
                API Status
              </Text>
              <Text
                style={[
                  styles.hwVal,
                  {
                    color: connection.isConnected
                      ? theme.success
                      : theme.danger,
                  },
                ]}
              >
                {connection.isConnected ? "Connected" : "Disconnected"}
              </Text>
            </View>
            <View style={styles.serverStatusItem}>
              <Text style={[styles.hwLabel, { color: theme.textSecondary }]}>
                WebSocket
              </Text>
              <Text
                style={[
                  styles.hwVal,
                  {
                    color: connection.wsConnected
                      ? theme.success
                      : theme.textSecondary,
                  },
                ]}
              >
                {connection.wsConnected ? "Streaming" : "Inactive"}
              </Text>
            </View>
            <View style={styles.serverStatusItem}>
              <Text style={[styles.hwLabel, { color: theme.textSecondary }]}>
                Last Sync
              </Text>
              <Text style={[styles.hwVal, { color: theme.text }]}>
                {connection.lastSync
                  ? new Date(connection.lastSync).toLocaleTimeString()
                  : "—"}
              </Text>
            </View>
          </View>

          {/* Server URL Input */}
          <View style={{ marginTop: 12 }}>
            <Text style={[styles.fieldLabel, { color: theme.text }]}>
              Backend Server URL
            </Text>
            <View
              style={[
                styles.serverUrlRow,
              ]}
            >
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.cardBorder,
                    flex: 1,
                  },
                ]}
                value={editServerUrl}
                onChangeText={(text) => {
                  setEditServerUrl(text);
                  setTestResult(null);
                }}
                placeholder="http://localhost:3000"
                placeholderTextColor={theme.textSecondary}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
            </View>

            {/* Test / Save buttons */}
            <View style={styles.serverBtnRow}>
              <TouchableOpacity
                style={[
                  styles.cacheBtn,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.cardBorder,
                    flex: 1,
                  },
                ]}
                onPress={handleTestConnection}
                disabled={isTestingConnection}
              >
                {isTestingConnection ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Feather name="wifi" size={14} color={theme.primary} />
                )}
                <Text style={[styles.cacheBtnText, { color: theme.text }]}>
                  Test Connection
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cacheBtn,
                  {
                    backgroundColor: editServerUrl !== connection.serverUrl
                      ? theme.primary
                      : theme.backgroundElement,
                    borderColor: editServerUrl !== connection.serverUrl
                      ? theme.primary
                      : theme.cardBorder,
                    flex: 1,
                  },
                ]}
                onPress={handleSaveServerUrl}
                disabled={editServerUrl === connection.serverUrl}
              >
                <Feather
                  name="save"
                  size={14}
                  color={
                    editServerUrl !== connection.serverUrl
                      ? "#FFFFFF"
                      : theme.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.cacheBtnText,
                    {
                      color:
                        editServerUrl !== connection.serverUrl
                          ? "#FFFFFF"
                          : theme.textSecondary,
                    },
                  ]}
                >
                  Save & Reconnect
                </Text>
              </TouchableOpacity>
            </View>

            {/* Test result */}
            {testResult && (
              <View
                style={[
                  styles.testResultBanner,
                  {
                    backgroundColor: testResult.ok
                      ? theme.successBg
                      : `${theme.danger}15`,
                    borderColor: testResult.ok
                      ? theme.success
                      : `${theme.danger}40`,
                  },
                ]}
              >
                <Feather
                  name={testResult.ok ? "check-circle" : "x-circle"}
                  size={14}
                  color={testResult.ok ? theme.success : theme.danger}
                />
                <Text
                  style={[
                    styles.testResultText,
                    {
                      color: testResult.ok ? theme.success : theme.danger,
                    },
                  ]}
                >
                  {testResult.message}
                </Text>
              </View>
            )}

            {/* Connection error */}
            {connection.error && !testResult && (
              <View
                style={[
                  styles.testResultBanner,
                  {
                    backgroundColor: `${theme.warning}12`,
                    borderColor: `${theme.warning}30`,
                  },
                ]}
              >
                <Feather
                  name="alert-triangle"
                  size={14}
                  color={theme.warning}
                />
                <Text
                  style={[
                    styles.testResultText,
                    { color: theme.warning },
                  ]}
                >
                  {connection.error}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* SECTION 0.5: APPEARANCE & THEME */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="moon" size={18} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Appearance
              </Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Obsidian Dark, Clean White, Cyber Ocean, or System Default
              </Text>
            </View>
          </View>

          <View style={styles.themeOptionsGrid}>
            {[
              {
                key: "system",
                label: "System Default",
                sub: `Matches device (${resolvedTheme === "light" ? "White" : "Dark"})`,
                previewBg: "#1e293b",
                previewDot: "#38bdf8",
              },
              {
                key: "Obsidian_dark",
                label: "Obsidian Dark",
                sub: "Cybernetic midnight theme",
                previewBg: "#07111f",
                previewDot: "#38bdf8",
              },
              {
                key: "dark",
                label: "Dark",
                sub: "Midnight theme",
                previewBg: "#000000",
                previewDot: "#38bdf8",
              },
              {
                key: "light",
                label: "Pure White",
                sub: "High-contrast bright daylight",
                previewBg: "#ffffff",
                previewDot: "#0284c7",
                border: "#cbd5e1",
              },
              {
                key: "ocean",
                label: "Cyber Ocean",
                sub: "Deep aquatic blue theme",
                previewBg: "#0a192f",
                previewDot: "#00e5ff",
              },
            ].map((item) => {
              const isSelected = themePreference === item.key;
              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.themeOptionCard,
                    {
                      backgroundColor: isSelected
                        ? theme.primaryLight
                        : theme.backgroundElement,
                      borderColor: isSelected
                        ? theme.primary
                        : theme.cardBorder,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setThemePreference(item.key as any)}
                >
                  <View style={styles.themeOptionTop}>
                    <View
                      style={[
                        styles.themePreviewSwatch,
                        {
                          backgroundColor: item.previewBg,
                          borderColor:
                            item.border || "rgba(255, 255, 255, 0.15)",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.swatchDot,
                          { backgroundColor: item.previewDot },
                        ]}
                      />
                    </View>

                    <View
                      style={[
                        styles.themeRadioCircle,
                        {
                          borderColor: isSelected
                            ? theme.primary
                            : theme.cardBorder,
                          backgroundColor: isSelected
                            ? theme.primary
                            : "transparent",
                        },
                      ]}
                    >
                      {isSelected && (
                        <Feather name="check" size={11} color="#FFFFFF" />
                      )}
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.themeOptionLabel,
                      { color: isSelected ? theme.primary : theme.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                  <Text
                    style={[
                      styles.themeOptionSub,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {item.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* SECTION 1: APP PREFERENCES & CUSTOMIZATIONS */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="sliders" size={18} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Telemetry &amp; Map Preferences
              </Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Measurement units and interactive map behaviors
              </Text>
            </View>
          </View>

          {/* Unit Selectors */}
          <View style={styles.prefGroup}>
            <Text
              style={[styles.prefGroupTitle, { color: theme.textSecondary }]}
            >
              UNITS OF MEASUREMENT
            </Text>

            {/* Water Stage Unit */}
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefRowTitle, { color: theme.text }]}>
                  River Stage Elevation
                </Text>
                <Text
                  style={[styles.prefRowSub, { color: theme.textSecondary }]}
                >
                  Gauge crest height display
                </Text>
              </View>
              <View style={styles.segmentedCtrl}>
                <TouchableOpacity
                  style={[
                    styles.segBtn,
                    unitWater === "m" && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setUnitWater("m")}
                >
                  <Text
                    style={[
                      styles.segBtnText,
                      {
                        color:
                          unitWater === "m" ? "#FFFFFF" : theme.textSecondary,
                      },
                    ]}
                  >
                    Meters (m)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segBtn,
                    unitWater === "ft" && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setUnitWater("ft")}
                >
                  <Text
                    style={[
                      styles.segBtnText,
                      {
                        color:
                          unitWater === "ft" ? "#FFFFFF" : theme.textSecondary,
                      },
                    ]}
                  >
                    Feet (ft)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Temperature Unit */}
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefRowTitle, { color: theme.text }]}>
                  Atmospheric Temperature
                </Text>
                <Text
                  style={[styles.prefRowSub, { color: theme.textSecondary }]}
                >
                  Sensor temperature reading
                </Text>
              </View>
              <View style={styles.segmentedCtrl}>
                <TouchableOpacity
                  style={[
                    styles.segBtn,
                    unitTemp === "C" && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setUnitTemp("C")}
                >
                  <Text
                    style={[
                      styles.segBtnText,
                      {
                        color:
                          unitTemp === "C" ? "#FFFFFF" : theme.textSecondary,
                      },
                    ]}
                  >
                    Celsius (°C)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segBtn,
                    unitTemp === "F" && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setUnitTemp("F")}
                >
                  <Text
                    style={[
                      styles.segBtnText,
                      {
                        color:
                          unitTemp === "F" ? "#FFFFFF" : theme.textSecondary,
                      },
                    ]}
                  >
                    Fahrenheit (°F)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Distance Unit */}
            <View style={styles.prefRow}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.prefRowTitle, { color: theme.text }]}>
                  Shelter Distance
                </Text>
                <Text
                  style={[styles.prefRowSub, { color: theme.textSecondary }]}
                >
                  Evacuation camp radius
                </Text>
              </View>
              <View style={styles.segmentedCtrl}>
                <TouchableOpacity
                  style={[
                    styles.segBtn,
                    unitDistance === "km" && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setUnitDistance("km")}
                >
                  <Text
                    style={[
                      styles.segBtnText,
                      {
                        color:
                          unitDistance === "km"
                            ? "#FFFFFF"
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    Kilometers (km)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.segBtn,
                    unitDistance === "mi" && { backgroundColor: theme.primary },
                  ]}
                  onPress={() => setUnitDistance("mi")}
                >
                  <Text
                    style={[
                      styles.segBtnText,
                      {
                        color:
                          unitDistance === "mi"
                            ? "#FFFFFF"
                            : theme.textSecondary,
                      },
                    ]}
                  >
                    Miles (mi)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Map Preferences */}
          <View style={[styles.prefGroup, { marginTop: 14 }]}>
            <Text
              style={[styles.prefGroupTitle, { color: theme.textSecondary }]}
            >
              MAP &amp; RADAR DEFAULTS
            </Text>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>
                  Auto-Focus on Critical Nodes
                </Text>
                <Text
                  style={[styles.switchDesc, { color: theme.textSecondary }]}
                >
                  Centers map on sensor nodes experiencing flood surge
                  overtopping.
                </Text>
              </View>
              <ModernSwitch
                value={autoFocusAlertNodes}
                onValueChange={setAutoFocusAlertNodes}
              />
            </View>

            <View style={styles.switchRow}>
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={[styles.switchTitle, { color: theme.text }]}>
                  Haptic / Vibration Alerts
                </Text>
                <Text
                  style={[styles.switchDesc, { color: theme.textSecondary }]}
                >
                  Vibrates device on rapid water stage rate-of-rise alerts.
                </Text>
              </View>
              <ModernSwitch
                value={vibrationAlert}
                onValueChange={setVibrationAlert}
              />
            </View>
          </View>
        </View>

        {/* SECTION 2: ESP32-S3 HARDWARE HEALTH DIAGNOSTICS (MOVED FROM HOME) */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="chip"
              size={20}
              color={theme.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                ESP32-S3 Hardware Health
              </Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Node telemetry &amp; hardware component diagnostics
              </Text>
            </View>
            <View
              style={[
                styles.onlineBadge,
                {
                  backgroundColor: theme.successBg,
                  borderColor: theme.success,
                },
              ]}
            >
              <View
                style={[styles.onlineDot, { backgroundColor: theme.success }]}
              />
              <Text style={[styles.onlineText, { color: theme.success }]}>
                100% HEALTH
              </Text>
            </View>
          </View>

          <View style={styles.hardwareGrid}>
            <View
              style={[
                styles.hardwareItem,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <Text style={[styles.hwLabel, { color: theme.textSecondary }]}>
                Microcontroller
              </Text>
              <Text style={[styles.hwVal, { color: theme.text }]}>
                ESP32-S3 Dual-Core
              </Text>
              <Text style={[styles.hwSub, { color: theme.textSecondary }]}>
                240MHz Xtensa LX7
              </Text>
            </View>

            <View
              style={[
                styles.hardwareItem,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <Text style={[styles.hwLabel, { color: theme.textSecondary }]}>
                Battery &amp; Solar
              </Text>
              <Text
                style={[
                  styles.hwVal,
                  {
                    color:
                      mqttData.batteryPct <= 20 ? theme.danger : theme.success,
                  },
                ]}
              >
                {mqttData.batteryPct.toFixed(0)}% (
                {mqttData.batteryVolts.toFixed(2)}V)
              </Text>
              <Text style={[styles.hwSub, { color: theme.textSecondary }]}>
                Solar INA219 Active
              </Text>
            </View>

            <View
              style={[
                styles.hardwareItem,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <Text style={[styles.hwLabel, { color: theme.textSecondary }]}>
                RF Mesh Transceiver
              </Text>
              <Text style={[styles.hwVal, { color: theme.primary }]}>
                Semtech SX1262
              </Text>
              <Text style={[styles.hwSub, { color: theme.textSecondary }]}>
                868.10 MHz LoRa
              </Text>
            </View>

            <View
              style={[
                styles.hardwareItem,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <Text style={[styles.hwLabel, { color: theme.textSecondary }]}>
                Sensor Bus
              </Text>
              <Text style={[styles.hwVal, { color: theme.success }]}>
                6 Sensors Online
              </Text>
              <Text style={[styles.hwSub, { color: theme.textSecondary }]}>
                I2C / ADC / UART
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION 3: LIVE FLOOD SIMULATOR CONTROLLER */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons
              name="access-point-network"
              size={20}
              color={theme.primary}
            />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Hardware & Telemetry Gateway
              </Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Live link status to field sensor nodes, LoRa gateways, and backend
              </Text>
            </View>
          </View>

          <View style={styles.scenarioGrid}>
            <View
              style={[
                styles.scenarioCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.scHeader}>
                <Text style={[styles.scLabel, { color: theme.text }]}>
                  Backend Link
                </Text>
                <View
                  style={[
                    styles.scRiskPill,
                    {
                      backgroundColor: connection.isConnected
                        ? `${theme.success}20`
                        : `${theme.danger}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.scRiskText,
                      {
                        color: connection.isConnected
                          ? theme.success
                          : theme.danger,
                      },
                    ]}
                  >
                    {connection.isConnected ? "CONNECTED" : "OFFLINE"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.scDesc, { color: theme.textSecondary }]}>
                {connection.serverUrl}
              </Text>
            </View>

            <View
              style={[
                styles.scenarioCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.scHeader}>
                <Text style={[styles.scLabel, { color: theme.text }]}>
                  WebSocket Stream
                </Text>
                <View
                  style={[
                    styles.scRiskPill,
                    {
                      backgroundColor: connection.wsConnected
                        ? `${theme.primary}20`
                        : `${theme.warning}20`,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.scRiskText,
                      {
                        color: connection.wsConnected
                          ? theme.primary
                          : theme.warning,
                      },
                    ]}
                  >
                    {connection.wsConnected ? "STREAMING" : "STANDBY"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.scDesc, { color: theme.textSecondary }]}>
                {connection.lastSync
                  ? `Last synced ${new Date(connection.lastSync).toLocaleTimeString()}`
                  : "Awaiting incoming packet"}
              </Text>
            </View>

            <View
              style={[
                styles.scenarioCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.scHeader}>
                <Text style={[styles.scLabel, { color: theme.text }]}>
                  Ingested Packets
                </Text>
                <View
                  style={[
                    styles.scRiskPill,
                    { backgroundColor: `${theme.primary}20` },
                  ]}
                >
                  <Text style={[styles.scRiskText, { color: theme.primary }]}>
                    {mqttData.packetCount} PKTS
                  </Text>
                </View>
              </View>
              <Text style={[styles.scDesc, { color: theme.textSecondary }]}>
                Telemetry: {mqttData.lastUpdate}
              </Text>
            </View>
          </View>
        </View>

        {/* SECTION 4: PERSONAL EMERGENCY SOS CONTACT */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="user-check" size={18} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Emergency SOS Contact
              </Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Notified via SMS beacon when SOS is triggered
              </Text>
            </View>
          </View>

          <Text style={[styles.fieldLabel, { color: theme.text }]}>
            Contact Full Name
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundElement,
                color: theme.text,
                borderColor: theme.cardBorder,
              },
            ]}
            value={contactName}
            onChangeText={setContactName}
          />

          <Text
            style={[styles.fieldLabel, { color: theme.text, marginTop: 10 }]}
          >
            Phone Number
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundElement,
                color: theme.text,
                borderColor: theme.cardBorder,
              },
            ]}
            value={contactPhone}
            onChangeText={setContactPhone}
          />

          <Text
            style={[styles.fieldLabel, { color: theme.text, marginTop: 10 }]}
          >
            Relationship
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundElement,
                color: theme.text,
                borderColor: theme.cardBorder,
              },
            ]}
            value={contactRel}
            onChangeText={setContactRel}
          />

          <TouchableOpacity
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}
            onPress={handleSaveContact}
          >
            <Feather name="check" size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>
              {savedContactMsg
                ? "Saved Successfully!"
                : "Save Emergency Contact"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* SECTION 5: NOTIFICATIONS & DISASTER SIREN */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="bell" size={18} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Acoustic Alarms &amp; Sirens
              </Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Acoustic alerts and notification behaviors
              </Text>
            </View>
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.switchTitle, { color: theme.text }]}>
                Audible Disaster Siren
              </Text>
              <Text style={[styles.switchDesc, { color: theme.textSecondary }]}>
                High-decibel acoustic siren during critical flash flood
                warnings.
              </Text>
            </View>
            <ModernSwitch
              value={sirenEnabled}
              onValueChange={setSirenEnabled}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.switchTitle, { color: theme.text }]}>
                Cellular SMS Fallback
              </Text>
              <Text style={[styles.switchDesc, { color: theme.textSecondary }]}>
                Sends SMS text message if LoRa RF gateway is unreachable.
              </Text>
            </View>
            <ModernSwitch value={smsFallback} onValueChange={setSmsFallback} />
          </View>

          <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={[styles.switchTitle, { color: theme.text }]}>
                Mesh Power Saver Mode
              </Text>
              <Text style={[styles.switchDesc, { color: theme.textSecondary }]}>
                Reduces SX1262 transmit power when node battery falls below 25%.
              </Text>
            </View>
            <ModernSwitch
              value={meshPowerSave}
              onValueChange={setMeshPowerSave}
            />
          </View>
        </View>

        {/* SECTION 6: OFFLINE CACHE & STORAGE */}
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={styles.sectionHeader}>
            <Feather name="hard-drive" size={18} color={theme.primary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>
                Offline Storage &amp; Cache
              </Text>
              <Text style={[styles.cardSub, { color: theme.textSecondary }]}>
                Offline basin map, shelters directory, and local telemetry cache
              </Text>
            </View>
          </View>

          <View style={styles.cacheInfoRow}>
            <Text
              style={[styles.cacheInfoText, { color: theme.textSecondary }]}
            >
              Offline Basin Maps &amp; Shelters:{" "}
              <Text style={{ color: theme.text, fontWeight: "700" }}>
                Cached (4.2 MB)
              </Text>
            </Text>
          </View>

          <View style={styles.cacheActionRow}>
            <TouchableOpacity
              style={[
                styles.cacheBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                },
              ]}
              onPress={handleSyncCache}
            >
              <Feather name="refresh-cw" size={14} color={theme.primary} />
              <Text style={[styles.cacheBtnText, { color: theme.text }]}>
                {cacheSynced ? "Cache Up to Date!" : "Sync Latest Mesh Cache"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cacheBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.cardBorder,
                },
              ]}
              onPress={handleClearCache}
            >
              <Feather name="trash-2" size={14} color={theme.danger} />
              <Text style={[styles.cacheBtnText, { color: theme.danger }]}>
                {cacheCleared ? "Cache Cleared!" : "Purge Cache"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 7: SYSTEM ABOUT */}
        <View style={styles.aboutFooter}>
          <Text style={[styles.aboutText, { color: theme.textSecondary }]}>
            SanketNet Flood Management System • App v1.2.0
          </Text>
          <Text style={[styles.aboutSubText, { color: theme.textSecondary }]}>
            LoRa SX1262 433MHz Mesh • End-to-End Encrypted Disaster Early
            Warning
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    alignItems: "center",
    paddingHorizontal: Spacing.three,
  },
  maxWidthWrapper: {
    width: "100%",
    maxWidth: MaxContentWidth,
  },
  header: {
    marginBottom: Spacing.three,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: 18,
    padding: Spacing.three,
    borderWidth: 1,
    marginBottom: Spacing.three,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: Spacing.two,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  cardSub: {
    fontSize: 11.5,
    lineHeight: 15,
    marginTop: 1,
  },
  themeOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 8,
  },
  themeOptionCard: {
    flexBasis: "47%",
    flexGrow: 0,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  themeOptionTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  themePreviewSwatch: {
    width: 32,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  swatchDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  themeRadioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  themeOptionLabel: {
    fontSize: 13,
    fontWeight: "800",
  },
  themeOptionSub: {
    fontSize: 10,
    lineHeight: 14,
  },
  prefGroup: {
    marginTop: 4,
  },
  prefGroupTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 8,
  },
  prefRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.1)",
    gap: 8,
  },
  prefRowTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  prefRowSub: {
    fontSize: 10.5,
    marginTop: 1,
  },
  segmentedCtrl: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(150, 150, 150, 0.2)",
    overflow: "hidden",
  },
  segBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },
  onlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: "800",
  },
  hardwareGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  hardwareItem: {
    flexBasis: "47%",
    flexGrow: 1,
    padding: 12,
    borderRadius: 12,
  },
  hwLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  hwVal: {
    fontSize: 13.5,
    fontWeight: "800",
  },
  hwSub: {
    fontSize: 10,
    marginTop: 2,
  },
  scenarioGrid: {
    gap: 8,
    marginTop: 4,
  },
  scenarioCard: {
    padding: 12,
    borderRadius: 14,
  },
  scHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  scLabel: {
    fontSize: 14,
    fontWeight: "800",
  },
  scRiskPill: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  scRiskText: {
    fontSize: 11,
    fontWeight: "800",
  },
  scDesc: {
    fontSize: 11.5,
    lineHeight: 15,
  },
  fieldLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  saveBtn: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontSize: 13.5,
    fontWeight: "800",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(150, 150, 150, 0.1)",
  },
  switchTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  switchDesc: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  cacheInfoRow: {
    marginBottom: 10,
  },
  cacheInfoText: {
    fontSize: 12,
  },
  cacheActionRow: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  cacheBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  cacheBtnText: {
    fontSize: 12,
    fontWeight: "700",
  },
  aboutFooter: {
    alignItems: "center",
    paddingVertical: Spacing.three,
    gap: 4,
  },
  aboutText: {
    fontSize: 11,
    fontWeight: "700",
  },
  aboutSubText: {
    fontSize: 10,
  },
  serverStatusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    gap: 8,
  },
  serverStatusItem: {
    flex: 1,
    alignItems: "center",
  },
  serverUrlRow: {
    marginTop: 6,
  },
  serverBtnRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  testResultBanner: {
    marginTop: 8,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  testResultText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
