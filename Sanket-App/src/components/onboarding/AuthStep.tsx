import { useSanket } from "@/context/SanketContext";
import { useTheme } from "@/hooks/use-theme";
import { Feather, FontAwesome5 } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export function AuthStep() {
  const {
    loginUser,
    loginWithCredentials,
    registerWithCredentials,
    setUserFlowStep,
    // setServerUrl,
    connection,
  } = useSanket();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  // const [serverUrlInput, setServerUrlInput] = useState(connection.serverUrl);
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdminRegistration, setIsAdminRegistration] = useState(false);
  const [adminCode, setAdminCode] = useState("");

  const handleCredentialAuth = async () => {
    setErrorMsg(null);

    const cleanUsername = username.trim();
    if (!cleanUsername) {
      setErrorMsg("Username is required");
      return;
    }
    if (!/^[a-zA-Z0-9_.-]{3,64}$/.test(cleanUsername)) {
      setErrorMsg(
        "Username must be 3-64 characters (letters, numbers, _, ., -)",
      );
      return;
    }
    if (!password.trim()) {
      setErrorMsg("Password is required");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters");
      return;
    }
    if (authMode === "signup" && password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    // Save custom server URL if changed
    // if (serverUrlInput.trim() && serverUrlInput.trim() !== connection.serverUrl) {
    //   await setServerUrl(serverUrlInput.trim());
    // }

    setIsSubmitting(true);

    if (authMode === "login") {
      const result = await loginWithCredentials(cleanUsername, password);
      if (!result.success) {
        setErrorMsg(result.error ?? "Login failed");
      }
    } else {
      const result = await registerWithCredentials(
        cleanUsername,
        password,
        isAdminRegistration ? "ADMIN" : "USER",
        isAdminRegistration ? adminCode : undefined,
      );
      if (!result.success) {
        setErrorMsg(result.error ?? "Registration failed");
      }
    }

    setIsSubmitting(false);
  };

  /** Citizen guest login */
  const handleSocialLogin = (provider: "google" | "github" | "apple") => {
    loginUser(provider);
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* Ambient background glow */}
      <View
        style={[
          styles.ambientGlow,
          { backgroundColor: `${theme.primary}12`, flex: 1 },
        ]}
      />
      <View
        style={[
          styles.ambientGlowTwo,
          { backgroundColor: `${theme.success}19`, flex: 1 },
        ]}
      />

      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 24),
              paddingBottom: Math.max(insets.bottom, 24),
              paddingLeft: Math.max(insets.left, 24),
              paddingRight: Math.max(insets.right, 24),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.maxWidthWrapper}>
            {/* Top Navigation Row */}
            <View
              style={
                authMode == "login"
                  ? styles.topNavRow
                  : [styles.topNavRow, { flex: 1.2 }]
              }
            >
              <TouchableOpacity
                onPress={() => setUserFlowStep("guide")}
                style={styles.backBtn}
                activeOpacity={0.7}
              >
                <Feather
                  name="arrow-left"
                  size={16}
                  color={theme.textSecondary}
                />
                <Text
                  style={[styles.backBtnText, { color: theme.textSecondary }]}
                >
                  Back to Guide
                </Text>
              </TouchableOpacity>

              <View style={styles.brandMini}>
                <Text style={[styles.brandMiniText, { color: theme.primary }]}>
                  ◈ SANKET-NET
                </Text>
              </View>
            </View>

            {/* Heading Block */}
            <View style={styles.headerBlock}>
              <Text style={[styles.badgeText, { color: theme.primary }]}>
                SECURE ACCOUNT ACCESS
              </Text>
              <Text style={[styles.title, { color: theme.text }]}>
                {authMode === "login"
                  ? "Sign in to your account"
                  : "Create your account"}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Connect to the Sanket-Net backend for live telemetry and flood
                intelligence
              </Text>
            </View>

            {/* Connection status indicator */}
            {connection.error && !errorMsg && (
              <View
                style={[
                  styles.connectionBanner,
                  {
                    backgroundColor: `${theme.warning}18`,
                    borderColor: `${theme.warning}40`,
                  },
                ]}
              >
                <Feather name="wifi-off" size={13} color={theme.warning} />
                <Text
                  style={[
                    styles.connectionBannerText,
                    { color: theme.warning },
                  ]}
                  numberOfLines={2}
                >
                  {connection.error}
                </Text>
              </View>
            )}

            {/* Error message */}
            {errorMsg && (
              <View
                style={[
                  styles.errorBanner,
                  {
                    backgroundColor: `${theme.danger}15`,
                    borderColor: `${theme.danger}40`,
                  },
                ]}
              >
                <Feather name="alert-circle" size={14} color={theme.danger} />
                <Text
                  style={[styles.errorBannerText, { color: theme.danger }]}
                  numberOfLines={3}
                >
                  {errorMsg}
                </Text>
              </View>
            )}

            {/* Social Authentication Row */}
            <View style={styles.socialButtonsRow}>
              {/* Google */}
              <TouchableOpacity
                style={[
                  styles.socialBtn,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.cardBorder,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleSocialLogin("google")}
              >
                <FontAwesome5 name="google" size={15} color="#EA4335" />
                <Text style={[styles.socialBtnText, { color: theme.text }]}>
                  Google
                </Text>
              </TouchableOpacity>

              {/* GitHub */}
              <TouchableOpacity
                style={[
                  styles.socialBtn,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.cardBorder,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleSocialLogin("github")}
              >
                <FontAwesome5 name="github" size={15} color={theme.text} />
                <Text style={[styles.socialBtnText, { color: theme.text }]}>
                  GitHub
                </Text>
              </TouchableOpacity>

              {/* Apple */}
              <TouchableOpacity
                style={[
                  styles.socialBtn,
                  {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.cardBorder,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleSocialLogin("apple")}
              >
                <FontAwesome5 name="apple" size={16} color={theme.text} />
                <Text style={[styles.socialBtnText, { color: theme.text }]}>
                  Apple
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.cardBorder },
                ]}
              />
              <Text
                style={[styles.dividerText, { color: theme.textSecondary }]}
              >
                OR WITH CREDENTIALS
              </Text>
              <View
                style={[
                  styles.dividerLine,
                  { backgroundColor: theme.cardBorder },
                ]}
              />
            </View>

            {/* Form Inputs */}
            <View style={styles.form}>
              {authMode === "signup" && (
                <View style={styles.inputGroup}>
                  <Text
                    style={[styles.inputLabel, { color: theme.textSecondary }]}
                  >
                    DISPLAY NAME (OPTIONAL)
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor: theme.cardBorder,
                      },
                    ]}
                  >
                    <Feather
                      name="user"
                      size={15}
                      color={theme.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="e.g. Sourav Mukherjee"
                      placeholderTextColor={theme.textSecondary}
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
              )}

              {authMode === "signup" && (
                <>
                  <TouchableOpacity
                    style={styles.adminCheckRow}
                    onPress={() => {
                      setIsAdminRegistration((value) => !value);
                      setErrorMsg(null);
                    }}
                    activeOpacity={0.75}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: isAdminRegistration
                            ? theme.primary
                            : theme.cardBorder,
                          backgroundColor: isAdminRegistration
                            ? theme.primary
                            : "transparent",
                        },
                      ]}
                    >
                      {isAdminRegistration && (
                        <Feather name="check" size={13} color="#FFFFFF" />
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[styles.adminCheckTitle, { color: theme.text }]}
                      >
                        Create an administrator account
                      </Text>
                      <Text
                        style={[
                          styles.adminCheckHint,
                          { color: theme.textSecondary },
                        ]}
                      >
                        Requires the administrator enrollment code.
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {isAdminRegistration && (
                    <View style={styles.inputGroup}>
                      <Text
                        style={[
                          styles.inputLabel,
                          { color: theme.textSecondary },
                        ]}
                      >
                        ADMIN ENROLLMENT CODE
                      </Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          {
                            backgroundColor: theme.backgroundElement,
                            borderColor: theme.cardBorder,
                          },
                        ]}
                      >
                        <Feather
                          name="shield"
                          size={15}
                          color={theme.textSecondary}
                        />
                        <TextInput
                          style={[styles.input, { color: theme.text }]}
                          value={adminCode}
                          onChangeText={setAdminCode}
                          placeholder="Provided by your organization"
                          placeholderTextColor={theme.textSecondary}
                          secureTextEntry
                          editable={!isSubmitting}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>
                  )}
                </>
              )}

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  USERNAME
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: errorMsg?.toLowerCase().includes("username")
                        ? theme.danger
                        : theme.cardBorder,
                    },
                  ]}
                >
                  <Feather
                    name="at-sign"
                    size={15}
                    color={theme.textSecondary}
                  />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="e.g. sanket.user"
                    placeholderTextColor={theme.textSecondary}
                    value={username}
                    onChangeText={(text) => {
                      setUsername(text);
                      setErrorMsg(null);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!isSubmitting}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text
                  style={[styles.inputLabel, { color: theme.textSecondary }]}
                >
                  PASSWORD
                </Text>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: theme.backgroundElement,
                      borderColor: errorMsg?.toLowerCase().includes("password")
                        ? theme.danger
                        : theme.cardBorder,
                    },
                  ]}
                >
                  <Feather name="lock" size={15} color={theme.textSecondary} />
                  <TextInput
                    style={[styles.input, { color: theme.text }]}
                    placeholder="••••••••••••"
                    placeholderTextColor={theme.textSecondary}
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      setErrorMsg(null);
                    }}
                    secureTextEntry={!showPassword}
                    editable={!isSubmitting}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 4 }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather
                      name={showPassword ? "eye-off" : "eye"}
                      size={16}
                      color={theme.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
                {authMode === "signup" && (
                  <Text
                    style={[
                      styles.passwordHint,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Minimum 8 characters
                  </Text>
                )}
              </View>

              {authMode === "signup" && (
                <View style={styles.inputGroup}>
                  <Text
                    style={[styles.inputLabel, { color: theme.textSecondary }]}
                  >
                    CONFIRM PASSWORD
                  </Text>
                  <View
                    style={[
                      styles.inputWrapper,
                      {
                        backgroundColor: theme.backgroundElement,
                        borderColor:
                          confirmPassword && confirmPassword !== password
                            ? theme.danger
                            : theme.cardBorder,
                      },
                    ]}
                  >
                    <Feather
                      name="shield"
                      size={15}
                      color={theme.textSecondary}
                    />
                    <TextInput
                      style={[styles.input, { color: theme.text }]}
                      placeholder="••••••••••••"
                      placeholderTextColor={theme.textSecondary}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        setErrorMsg(null);
                      }}
                      secureTextEntry={!showPassword}
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
              )}

              {/* Primary Submit Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  {
                    backgroundColor: isSubmitting
                      ? `${theme.primary}88`
                      : theme.primary,
                  },
                ]}
                activeOpacity={0.88}
                onPress={handleCredentialAuth}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {authMode === "login"
                        ? "Sign In & Select Area"
                        : "Create Account & Continue"}
                    </Text>
                    <Feather name="arrow-right" size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              {/* Toggle Mode Link */}
              <View style={styles.toggleRow}>
                <Text
                  style={[styles.toggleText, { color: theme.textSecondary }]}
                >
                  {authMode === "login"
                    ? "Don't have an account yet?"
                    : "Already registered with us?"}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setAuthMode(authMode === "login" ? "signup" : "login");
                    setIsAdminRegistration(false);
                    setAdminCode("");
                    setErrorMsg(null);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.toggleBtnText, { color: theme.primary }]}
                  >
                    {authMode === "login" ? "Sign Up" : "Sign In"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: "100%",
  },
  ambientGlow: {
    position: "absolute",
    top: "15%",
    alignSelf: "center",
    width: 280,
    height: 280,
    borderRadius: 190,
    filter: Platform.OS === "web" ? "blur(60px)" : undefined,
  },
  ambientGlowTwo: {
    position: "absolute",
    top: "35%",
    alignSelf: "flex-start",
    width: 380,
    height: 380,
    borderRadius: 190,
    filter: Platform.OS === "web" ? "blur(60px)" : undefined,
  },
  scrollView: {
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  maxWidthWrapper: {
    width: "100%",
    maxWidth: 440,
    gap: 20,
    flex: 1,
  },
  topNavRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },

  backBtn: {
    flexDirection: "row",
    gap: 6,
    paddingVertical: 6,
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  brandMini: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  brandMiniText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },
  headerBlock: {
    alignItems: "center",
    textAlign: "center",
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
    maxWidth: 340,
  },
  connectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  connectionBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  socialButtonsRow: {
    flexDirection: "row",
    gap: 10,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
  },
  socialBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  form: {
    gap: 10,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  passwordHint: {
    fontSize: 11,
    marginTop: 2,
    paddingLeft: 2,
  },
  adminCheckRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 7,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  adminCheckTitle: {
    fontSize: 13,
    fontWeight: "700",
  },
  adminCheckHint: {
    fontSize: 11,
    marginTop: 1,
  },
  submitBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    minHeight: 50,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  toggleText: {
    fontSize: 13,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: "700",
  },
});
