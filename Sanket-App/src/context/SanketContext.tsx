import {
  AppTheme,
  ColorPalette,
  Colors,
  ResolvedTheme,
} from "@/constants/theme";
import * as api from "@/services/api";
import * as authStorage from "@/services/auth-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL?.trim().replace(/\/+$/, "") ?? "";

export type ThreatStatus = "NORMAL" | "ADVISORY" | "CRITICAL";
export type NodeCategory = "river" | "embankment" | "drainage" | "urban";
export type UserFlowStep = "welcome" | "guide" | "auth" | "area" | "dashboard";
export type { AppTheme, ResolvedTheme };

export interface UserProfile {
  name: string;
  email: string;
  provider: "google" | "github" | "apple" | "email";
  role?: "ADMIN" | "USER";
}

export interface AreaInfo {
  id: string;
  name: string;
  subtext: string;
  state: string;
  nodeIds: string[];
  nodeCount: number;
  riskLevel: ThreatStatus;
  elevation: string;
}

export interface SensorNode {
  id: string;
  name: string;
  category: NodeCategory;
  location: string;
  online: boolean;
  waterLevel: number;
  waterLevelMax: number;
  waterLevelDanger: number;
  rainfallRate: number;
  soilMoisture: number;
  turbidity: number;
  battery: number;
  rssi: number;
  snr: number;
  hops: number;
  lastSeen: string;
  history: number[];
}

export interface DisasterAlert {
  id: string;
  severity: "CRITICAL" | "WARNING" | "ADVISORY";
  title: string;
  zone: string;
  issuedAt: string;
  message: string;
  action: string;
}

export interface HazardReport {
  id: string;
  type:
    | "Waterlogging"
    | "Embankment Seepage"
    | "Blocked Culvert"
    | "Submerged Road"
    | "Power Hazard";
  location: string;
  depth: string;
  urgency: "High" | "Medium" | "Low";
  status: "Verified by NDRF" | "Under Inspection" | "Reported";
  time: string;
  upvotes: number;
}

export interface EmergencyShelter {
  id: string;
  name: string;
  address: string;
  distanceKm: number;
  elevationM: number;
  capacity: number;
  occupied: number;
  supplies: {
    food: boolean;
    medical: boolean;
    power: boolean;
    boat: boolean;
  };
  contact: string;
}

export interface GoBagItem {
  id: string;
  label: string;
  category: string;
  checked: boolean;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface MqttEvent {
  time: string;
  type: string;
  water: number;
  temp: number;
  gas: number;
  accel: number;
  status: string;
}

export interface MqttTelemetry {
  waterLevelPct: number;
  temperatureC: number;
  gasVoltage: number;
  pressureHpa: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  maxAccel: number;
  batteryPct: number;
  batteryVolts: number;
  packetCount: number;
  hazardActive: boolean;
  hazardType: string;
  lastUpdate: string;
  deviceStatus: "ONLINE" | "OFFLINE";
  waterHistory: number[];
  tempHistory: number[];
  gasHistory: number[];
  events: MqttEvent[];
}

// ─── Backend connection state ──────────────────────────────────────────────
export interface ConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  wsConnected: boolean;
  serverUrl: string;
  lastSync: string | null;
  error: string | null;
  mode: "live" | "offline";
}

interface SanketContextType {
  userFlowStep: UserFlowStep;
  setUserFlowStep: (step: UserFlowStep) => void;
  currentUser: UserProfile | null;
  loginUser: (
    provider: UserProfile["provider"],
    email?: string,
    name?: string,
  ) => void;
  /** Real backend login (username + password) */
  loginWithCredentials: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Real backend registration */
  registerWithCredentials: (
    username: string,
    password: string,
    accountType?: "USER" | "ADMIN",
    adminCode?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  selectedArea: AreaInfo;
  selectArea: (areaId: string) => void;
  areasList: AreaInfo[];

  threatLevel: {
    score: number;
    status: ThreatStatus;
    headline: string;
    advice: string;
  };
  nodes: SensorNode[];
  areaNodes: SensorNode[];
  activeAlerts: DisasterAlert[];
  hazardReports: HazardReport[];
  shelters: EmergencyShelter[];
  goBagItems: GoBagItem[];
  emergencyContact: EmergencyContact;
  simulationScenario: ThreatStatus;
  gatewayStatus: {
    connected: boolean;
    lastSync: string;
    frequency: string;
    encryption: string;
    nodeCount: number;
  };

  mqttData: MqttTelemetry;
  setSimulationScenario: (scenario: ThreatStatus) => void;
  addHazardReport: (
    report: Omit<HazardReport, "id" | "time" | "upvotes" | "status">,
  ) => void;
  toggleGoBagItem: (id: string) => void;
  updateEmergencyContact: (contact: Partial<EmergencyContact>) => void;
  triggerSosAlert: () => void;
  sosTriggered: boolean;

  themePreference: AppTheme;
  setThemePreference: (theme: AppTheme) => void;
  resolvedTheme: ResolvedTheme;
  theme: ColorPalette;

  // ─── Backend connection ────────────────────────────────────────────────
  connection: ConnectionState;
  // setServerUrl: (url: string) => Promise<void>;
  testConnection: (url?: string) => Promise<{ ok: boolean; error?: string }>;
  authToken: string | null;
  updateAccount: (input: {
    username?: string;
    currentPassword: string;
    newPassword?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  deleteAccount: () => Promise<{ success: boolean; error?: string }>;
}

// ─── Hardcoded fallback data ───────────────────────────────────────────────

export const AREAS_DATA: AreaInfo[] = [
  {
    id: "area-hooghly",
    name: "Hooghly River Catchment (Sector 4)",
    subtext: "High-density riparian zone with barrage discharge monitor",
    state: "West Bengal",
    nodeIds: ["NODE-01", "NODE-02", "NODE-03", "NODE-04"],
    nodeCount: 4,
    riskLevel: "ADVISORY",
    elevation: "12.4m ASL",
  },
  {
    id: "area-barrackpore",
    name: "Barrackpore Embankment & Bund",
    subtext: "River embankment wall & seepage monitoring cluster",
    state: "West Bengal",
    nodeIds: ["NODE-01", "NODE-02"],
    nodeCount: 2,
    riskLevel: "NORMAL",
    elevation: "16.8m ASL",
  },
  {
    id: "area-saltlake",
    name: "Salt Lake Urban Drainage Outfall",
    subtext: "Stormwater canal lock gates & drainage pumping stations",
    state: "West Bengal",
    nodeIds: ["NODE-03"],
    nodeCount: 1,
    riskLevel: "ADVISORY",
    elevation: "8.2m ASL",
  },
  {
    id: "area-howrah",
    name: "Howrah Lowland Junction & Arterials",
    subtext: "Lowland underpasses susceptible to flash waterlogging",
    state: "West Bengal",
    nodeIds: ["NODE-04"],
    nodeCount: 1,
    riskLevel: "NORMAL",
    elevation: "7.5m ASL",
  },
];

const INITIAL_NODES: SensorNode[] = [
  {
    id: "NODE-01",
    name: "Hooghly River Station",
    category: "river",
    location: "Barrage Sluice Gate 4, Sector 1",
    online: false,
    waterLevel: 0,
    waterLevelMax: 6.5,
    waterLevelDanger: 5.2,
    rainfallRate: 0,
    soilMoisture: 0,
    turbidity: 0,
    battery: 0,
    rssi: 0,
    snr: 0,
    hops: 1,
    lastSeen: "Awaiting telemetry",
    history: [],
  },
  {
    id: "NODE-02",
    name: "Barrackpore Embankment",
    category: "embankment",
    location: "Bund Pier km 14.2, Riverside Road",
    online: false,
    waterLevel: 0,
    waterLevelMax: 5.8,
    waterLevelDanger: 4.8,
    rainfallRate: 0,
    soilMoisture: 0,
    turbidity: 0,
    battery: 0,
    rssi: 0,
    snr: 0,
    hops: 2,
    lastSeen: "Awaiting telemetry",
    history: [],
  },
  {
    id: "NODE-03",
    name: "Salt Lake Drainage Canal",
    category: "drainage",
    location: "Canal Outfall Pump Station #2",
    online: false,
    waterLevel: 0,
    waterLevelMax: 4.0,
    waterLevelDanger: 3.3,
    rainfallRate: 0,
    soilMoisture: 0,
    turbidity: 0,
    battery: 0,
    rssi: 0,
    snr: 0,
    hops: 1,
    lastSeen: "Awaiting telemetry",
    history: [],
  },
  {
    id: "NODE-04",
    name: "Howrah Lowland Outpost",
    category: "urban",
    location: "Flyover Underpass Junction, Ward 9",
    online: false,
    waterLevel: 0,
    waterLevelMax: 3.0,
    waterLevelDanger: 2.2,
    rainfallRate: 0,
    soilMoisture: 0,
    turbidity: 0,
    battery: 0,
    rssi: 0,
    snr: 0,
    hops: 3,
    lastSeen: "Awaiting telemetry",
    history: [],
  },
];

const INITIAL_ALERTS: DisasterAlert[] = [];

const INITIAL_HAZARD_REPORTS: HazardReport[] = [];

const INITIAL_SHELTERS: EmergencyShelter[] = [
  {
    id: "SHL-01",
    name: "Sector 2 High Ground Relief Center",
    address: "Govt. Model Higher Secondary School Campus",
    distanceKm: 1.2,
    elevationM: 18.5,
    capacity: 450,
    occupied: 0,
    supplies: { food: true, medical: true, power: true, boat: true },
    contact: "033-2479-1102",
  },
  {
    id: "SHL-02",
    name: "Community Cyclone & Flood Shelter",
    address: "Subdivision Sports Stadium Complex",
    distanceKm: 2.8,
    elevationM: 22.0,
    capacity: 800,
    occupied: 0,
    supplies: { food: true, medical: true, power: true, boat: false },
    contact: "033-2479-1108",
  },
  {
    id: "SHL-03",
    name: "District Red Cross Evacuation Camp",
    address: "Collectorate Ground Hall A",
    distanceKm: 4.1,
    elevationM: 24.5,
    capacity: 600,
    occupied: 0,
    supplies: { food: true, medical: true, power: true, boat: true },
    contact: "033-2479-1115",
  },
];

const INITIAL_GO_BAG: GoBagItem[] = [
  {
    id: "gb-1",
    label: "Drinking Water Tablets / 3L Bottled Water",
    category: "Hydration",
    checked: true,
  },
  {
    id: "gb-2",
    label: "Waterproof Document Pouch (IDs, Deeds, Insurance)",
    category: "Documents",
    checked: true,
  },
  {
    id: "gb-3",
    label: "High-Lumen Torch & Spare Rechargeable Batteries",
    category: "Survival",
    checked: true,
  },
  {
    id: "gb-4",
    label: "Compact First Aid Kit & Prescription Medications",
    category: "Medical",
    checked: false,
  },
  {
    id: "gb-5",
    label: "Charged 20,000mAh Powerbank & USB Cables",
    category: "Tech",
    checked: true,
  },
  {
    id: "gb-6",
    label: "Loud Emergency Distress Whistle",
    category: "Rescue",
    checked: false,
  },
  {
    id: "gb-7",
    label: "High-Energy Rations (Biscuits, Dry Fruits, ORS)",
    category: "Nutrition",
    checked: false,
  },
  {
    id: "gb-8",
    label: "Thermal Foil Space Blanket & Rain Ponchos",
    category: "Shelter",
    checked: false,
  },
];

const INITIAL_MQTT: MqttTelemetry = {
  waterLevelPct: 0,
  temperatureC: 0,
  gasVoltage: 0,
  pressureHpa: 1013,
  accelX: 0,
  accelY: 0,
  accelZ: 0,
  maxAccel: 0,
  batteryPct: 0,
  batteryVolts: 0,
  packetCount: 0,
  hazardActive: false,
  hazardType: "None",
  lastUpdate: "Awaiting live packet...",
  deviceStatus: "OFFLINE",
  waterHistory: [],
  tempHistory: [],
  gasHistory: [],
  events: [],
};

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Map a backend telemetry payload into our MqttTelemetry shape */
function mapTelemetryPayload(
  payload: Record<string, unknown>,
  prev: MqttTelemetry,
): MqttTelemetry {
  const water =
    typeof payload.water_level === "number"
      ? payload.water_level
      : typeof payload.waterLevel === "number"
        ? payload.waterLevel
        : prev.waterLevelPct;
  const temp =
    typeof payload.temperature === "number"
      ? payload.temperature
      : prev.temperatureC;
  const gas =
    typeof payload.gas_voltage === "number"
      ? payload.gas_voltage
      : typeof payload.mq2 === "number"
        ? payload.mq2
        : prev.gasVoltage;
  const battery =
    typeof payload.battery_mv === "number"
      ? Math.round((payload.battery_mv as number) / 42)
      : prev.batteryPct;

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const prediction = payload.prediction as Record<string, unknown> | undefined;
  const hazardActive =
    prediction?.riskLevel === "HIGH" || prediction?.riskLevel === "CRITICAL";

  return {
    ...prev,
    waterLevelPct: water,
    temperatureC: temp,
    gasVoltage: gas,
    batteryPct: battery,
    packetCount: prev.packetCount + 1,
    lastUpdate: timeStr,
    hazardActive,
    hazardType: hazardActive
      ? String(
          (prediction?.riskFactors as unknown[] | undefined)?.[0] ??
            "Hazard Detected",
        )
      : "None",
    deviceStatus: "ONLINE",
    waterHistory: [...prev.waterHistory.slice(-59), water],
    tempHistory: [...prev.tempHistory.slice(-59), temp],
    gasHistory: [...prev.gasHistory.slice(-59), gas],
  };
}

/** Map a backend alert payload into our DisasterAlert shape */
function mapAlertPayload(payload: Record<string, unknown>): DisasterAlert {
  return {
    id: String(payload.id ?? `ALERT-${Date.now()}`),
    severity: (payload.severity as DisasterAlert["severity"]) ?? "ADVISORY",
    title: String(payload.title ?? payload.type ?? "Alert"),
    zone: String(payload.zone ?? payload.area ?? "Unknown"),
    issuedAt: payload.receivedAt
      ? new Date(payload.receivedAt as string).toLocaleTimeString()
      : "Just now",
    message: String(payload.message ?? payload.description ?? ""),
    action: String(payload.action ?? "Stay alert and monitor updates."),
  };
}

/** Map a backend node status to our SensorNode shape */
function mapNodeStatus(
  node: api.NodeStatus,
  existing?: SensorNode,
): SensorNode {
  const waterLevel = node.waterLevel ?? existing?.waterLevel ?? 0;
  return {
    id: node.nodeId,
    name: existing?.name ?? node.nodeId,
    category: existing?.category ?? "urban",
    location: existing?.location ?? "Unknown",
    online: true,
    waterLevel,
    waterLevelMax: existing?.waterLevelMax ?? 6.5,
    waterLevelDanger: existing?.waterLevelDanger ?? 5.2,
    rainfallRate: node.rainfallMm ?? existing?.rainfallRate ?? 0,
    soilMoisture: node.soilMoisture ?? existing?.soilMoisture ?? 0,
    turbidity: existing?.turbidity ?? 0,
    battery: node.batteryMv
      ? Math.round(node.batteryMv / 42)
      : (existing?.battery ?? 100),
    rssi: existing?.rssi ?? -80,
    snr: existing?.snr ?? 8,
    hops: existing?.hops ?? 1,
    lastSeen: node.lastSeen
      ? new Date(node.lastSeen).toLocaleTimeString()
      : (existing?.lastSeen ?? "Unknown"),
    history: existing
      ? [...existing.history.slice(-6), waterLevel]
      : [waterLevel],
  };
}

// ─── Context ───────────────────────────────────────────────────────────────

const SanketContext = createContext<SanketContextType | undefined>(undefined);

export function SanketProvider({ children }: { children: React.ReactNode }) {
  // ── Theme ──────────────────────────────────────────────────────────────
  const systemScheme = useRNColorScheme();
  const [themePreference, setThemePreference] = useState<AppTheme>("system");

  const resolvedTheme: ResolvedTheme =
    themePreference === "system"
      ? systemScheme === "light"
        ? "light"
        : "dark"
      : themePreference;

  const currentTheme = Colors[resolvedTheme] || Colors.dark;

  // ── Onboarding & Auth ──────────────────────────────────────────────────
  const [userFlowStep, setUserFlowStep] = useState<UserFlowStep>("welcome");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaInfo>(AREAS_DATA[0]);
  const [authToken, setAuthTokenState] = useState<string | null>(null);

  // ── Backend connection state ───────────────────────────────────────────
  const [connection, setConnection] = useState<ConnectionState>({
    isConnected: false,
    isLoading: false,
    wsConnected: false,
    serverUrl: BACKEND_URL,
    lastSync: null,
    error: null,
    mode: "offline",
  });

  const wsRef = useRef<api.WsConnection | null>(null);

  // ── App data state ─────────────────────────────────────────────────────
  const [simulationScenario, setSimulationScenario] =
    useState<ThreatStatus>("ADVISORY");
  const [nodes, setNodes] = useState<SensorNode[]>(INITIAL_NODES);
  const [activeAlerts, setActiveAlerts] =
    useState<DisasterAlert[]>(INITIAL_ALERTS);
  const [hazardReports, setHazardReports] = useState<HazardReport[]>(
    INITIAL_HAZARD_REPORTS,
  );
  const [shelters] = useState<EmergencyShelter[]>(INITIAL_SHELTERS);
  const [goBagItems, setGoBagItems] = useState<GoBagItem[]>(INITIAL_GO_BAG);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>({
    name: "Priya Sharma (Family)",
    phone: "+91 98765 43210",
    relationship: "Next of Kin",
  });

  const [mqttData, setMqttData] = useState<MqttTelemetry>(INITIAL_MQTT);

  // Filter nodes according to selected area
  const areaNodes = nodes.filter((n) => selectedArea.nodeIds.includes(n.id));

  // ── Restore session on mount ───────────────────────────────────────────
  useEffect(() => {
    (async () => {
      // Use the backend URL configured in Expo's environment.
      // Do not override it with a previously saved URL.
      if (!BACKEND_URL) {
        console.error(
          "[SanketContext] EXPO_PUBLIC_BACKEND_URL is not configured",
        );
        setConnection((prev) => ({
          ...prev,
          serverUrl: "",
          error: "EXPO_PUBLIC_BACKEND_URL is not configured",
        }));
      } else {
        api.setBaseUrl(BACKEND_URL);
        setConnection((prev) => ({
          ...prev,
          serverUrl: BACKEND_URL,
          error: null,
        }));
      }

      // Wire auto-logout on 401
      api.setOnUnauthorized(async () => {
        await authStorage.clearSession();
        api.setAuthToken(null);
        setAuthTokenState(null);
        setCurrentUser(null);
        setUserFlowStep("auth");
      });

      // Restore session
      const session = await authStorage.getSession();
      if (session) {
        api.setAuthToken(session.token);
        setAuthTokenState(session.token);
        try {
          // Validate with backend
          const validated = await api.validateToken();
          setCurrentUser({
            name: validated.user.username,
            email: `${validated.user.username}@sanket.net`,
            provider: "email",
            role: validated.user.role,
          });
          setUserFlowStep("dashboard");
          fetchInitialData(session.token);
        } catch {
          // Stale or invalid session
          await authStorage.clearSession();
          api.setAuthToken(null);
          setAuthTokenState(null);
          setUserFlowStep("auth");
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch initial data from backend ────────────────────────────────────
  const fetchInitialData = useCallback(async (token: string) => {
    setConnection((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      // Check health first
      await api.checkHealth();

      // Fetch snapshot (telemetry + alerts + events)
      const snapshot = await api.getSnapshot();

      // Update telemetry from latest snapshot data
      if (snapshot.telemetry?.length > 0) {
        const latest = snapshot.telemetry[0] as Record<string, unknown>;
        setMqttData((prev) => mapTelemetryPayload(latest, prev));
      }

      // Update alerts from backend
      if (snapshot.alerts?.length > 0) {
        const backendAlerts = snapshot.alerts.map((a) =>
          mapAlertPayload(a as Record<string, unknown>),
        );
        setActiveAlerts(backendAlerts);
      }

      // Fetch nodes
      try {
        const backendNodes = await api.getNodes();
        if (backendNodes.length > 0) {
          setNodes((prev) =>
            backendNodes.map((bn) => {
              const existing = prev.find((n) => n.id === bn.nodeId);
              return mapNodeStatus(bn, existing);
            }),
          );
        }
      } catch {
        /* nodes endpoint may return empty — keep mock data */
      }

      setConnection((prev) => ({
        ...prev,
        isConnected: true,
        isLoading: false,
        mode: "live",
        lastSync: new Date().toISOString(),
        error: null,
      }));

      // Start WebSocket
      connectWs(token);
    } catch (err) {
      console.warn("[SanketContext] Backend unavailable:", err);
      setConnection((prev) => ({
        ...prev,
        isConnected: false,
        isLoading: false,
        mode: "offline",
        error: "Backend unreachable — please ensure backend is running",
      }));
    }
  }, []);

  // ── WebSocket connection ───────────────────────────────────────────────
  const connectWs = useCallback((token: string) => {
    // Close existing connection
    wsRef.current?.close();

    wsRef.current = api.connectWebSocket(
      token,
      (msg) => {
        switch (msg.type) {
          case "snapshot": {
            const data = msg.data as {
              telemetry?: unknown[];
              alerts?: unknown[];
            };
            if (data.telemetry?.length) {
              const latest = data.telemetry[0] as Record<string, unknown>;
              setMqttData((prev) => mapTelemetryPayload(latest, prev));
            }
            if (data.alerts?.length) {
              setActiveAlerts(
                data.alerts.map((a) =>
                  mapAlertPayload(a as Record<string, unknown>),
                ),
              );
            }
            break;
          }
          case "telemetry": {
            const payload = msg.data as Record<string, unknown>;
            setMqttData((prev) => mapTelemetryPayload(payload, prev));
            setConnection((prev) => ({
              ...prev,
              lastSync: new Date().toISOString(),
            }));
            break;
          }
          case "alerts": {
            const alert = mapAlertPayload(msg.data as Record<string, unknown>);
            setActiveAlerts((prev) => [alert, ...prev.slice(0, 49)]);
            break;
          }
          default:
            break;
        }
      },
      (connected) => {
        setConnection((prev) => ({ ...prev, wsConnected: connected }));
      },
    );
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      wsRef.current?.close();
    };
  }, []);

  // ── Threat calculation derived purely from live telemetry ───────────────
  const getThreatDetails = () => {
    if (mqttData.hazardActive || mqttData.waterLevelPct >= 85) {
      return {
        score: Math.max(
          85,
          Math.min(100, Math.round(mqttData.waterLevelPct || 88)),
        ),
        status: "CRITICAL" as ThreatStatus,
        headline: "CRITICAL INUNDATION & SURGE WARNING",
        advice:
          "River level exceeding Extreme Danger Mark! Immediate evacuation recommended for Lowland Sectors.",
      };
    }
    if (mqttData.waterLevelPct >= 65) {
      return {
        score: Math.round(mqttData.waterLevelPct),
        status: "ADVISORY" as ThreatStatus,
        headline: "RISING WATER LEVEL & PRECIPITATION ADVISORY",
        advice:
          "Moderate upstream discharge detected. Prepare emergency go-bag and check designated high-ground shelters.",
      };
    }
    return {
      score: Math.round(
        mqttData.waterLevelPct > 0 ? mqttData.waterLevelPct : 12,
      ),
      status: "NORMAL" as ThreatStatus,
      headline: "ALL RIVER SECTORS REPORTING NORMAL",
      advice:
        "All telemetry channels nominal. LoRa mesh relays active and sluice drainage nominal.",
    };
  };

  const threatLevel = getThreatDetails();

  // ── Auth actions ───────────────────────────────────────────────────────

  /** Real backend login */
  const loginWithCredentials = useCallback(
    async (
      username: string,
      password: string,
      accountType: "USER" | "ADMIN" = "USER",
      adminCode?: string,
    ): Promise<{ success: boolean; error?: string }> => {
      setConnection((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await api.login(username, password);
        await authStorage.saveSession(
          result.token,
          result.expiresAt,
          result.user,
        );
        setAuthTokenState(result.token);
        setCurrentUser({
          name: result.user.username,
          email: `${result.user.username}@sanket.net`,
          provider: "email",
          role: result.user.role,
        });
        setUserFlowStep("area");
        // Fetch live data after login
        fetchInitialData(result.token);
        return { success: true };
      } catch (err) {
        const apiErr = err as { error?: string; status?: number };
        const errorMsg =
          apiErr.error === "invalid_credentials"
            ? "Invalid username or password"
            : apiErr.error === "account_inactive"
              ? "Account is deactivated"
              : apiErr.status
                ? `Server error (${apiErr.status})`
                : "Unable to reach server — check your connection";
        setConnection((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
        return { success: false, error: errorMsg };
      }
    },
    [fetchInitialData],
  );

  /** Real backend registration */
  const registerWithCredentials = useCallback(
    async (
      username: string,
      password: string,
      accountType: "USER" | "ADMIN" = "USER",
      adminCode?: string,
    ): Promise<{ success: boolean; error?: string }> => {
      setConnection((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await api.register(
          username,
          password,
          accountType,
          adminCode,
        );
        await authStorage.saveSession(
          result.token,
          result.expiresAt,
          result.user,
        );
        setAuthTokenState(result.token);
        setCurrentUser({
          name: result.user.username,
          email: `${result.user.username}@sanket.net`,
          provider: "email",
          role: result.user.role,
        });
        setUserFlowStep("area");
        fetchInitialData(result.token);
        return { success: true };
      } catch (err) {
        const apiErr = err as { error?: string; status?: number };
        const errorMsg =
          apiErr.error === "registration_disabled"
            ? "Registration is currently disabled"
            : apiErr.error === "username_taken"
              ? "Username is already taken"
              : apiErr.error === "invalid_registration"
                ? "Username must be 3-64 characters (letters, numbers, _ . -) and password 8+ characters"
                : apiErr.error === "invalid_admin_enrollment_code"
                  ? "The administrator enrollment code is invalid"
                  : apiErr.error === "registration_unavailable"
                    ? "Registration service unavailable — try again later"
                    : apiErr.status
                      ? `Server error (${apiErr.status})`
                      : "Unable to reach server — check your connection";
        setConnection((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMsg,
        }));
        return { success: false, error: errorMsg };
      }
    },
    [fetchInitialData],
  );

  /** Citizen guest login */
  const loginUser = (
    provider: UserProfile["provider"],
    email?: string,
    name?: string,
  ) => {
    const profile: UserProfile = {
      name:
        name ||
        (provider === "google"
          ? "Citizen Observer (Google)"
          : provider === "github"
            ? "Citizen Observer (GitHub)"
            : provider === "apple"
              ? "Citizen Observer (Apple)"
              : "Citizen Observer"),
      email: email || `${provider}.user@sanket.net`,
      provider,
      role: "USER",
    };
    setCurrentUser(profile);
    setUserFlowStep("area");
    // Connect to live backend health
    api
      .checkHealth()
      .then(() => {
        setConnection((prev) => ({
          ...prev,
          isConnected: true,
          mode: "live",
          error: null,
        }));
      })
      .catch(() => {
        setConnection((prev) => ({
          ...prev,
          isConnected: false,
          mode: "offline",
          error: "Backend offline — waiting for network",
        }));
      });
  };

  const logout = useCallback(async () => {
    // Clear stored session
    await authStorage.clearSession();
    api.setAuthToken(null);
    setAuthTokenState(null);
    // Disconnect WS
    wsRef.current?.close();
    wsRef.current = null;
    // Reset state
    setCurrentUser(null);
    setUserFlowStep("welcome");
    setNodes(INITIAL_NODES);
    setActiveAlerts(INITIAL_ALERTS);
    setMqttData(INITIAL_MQTT);
    setConnection((prev) => ({
      ...prev,
      isConnected: false,
      wsConnected: false,
      isLoading: false,
      mode: "offline",
      lastSync: null,
      error: null,
    }));
  }, []);

  const updateAccount = useCallback(
    async (input: {
      username?: string;
      currentPassword: string;
      newPassword?: string;
    }) => {
      try {
        const result = await api.updateAccount(input);
        if (result.token && result.expiresAt) {
          await authStorage.saveSession(
            result.token,
            result.expiresAt,
            result.user,
          );
          setAuthTokenState(result.token);
        }
        setCurrentUser((previous) =>
          previous
            ? {
                ...previous,
                name: result.user.username,
                email: `${result.user.username}@sanket.net`,
                role: result.user.role,
              }
            : previous,
        );
        return { success: true };
      } catch (error) {
        return {
          success: false,
          error:
            (error as { error?: string }).error || "Unable to update account",
        };
      }
    },
    [],
  );

  const deleteAccount = useCallback(async () => {
    try {
      await api.deleteAccount();
      await logout();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          (error as { error?: string }).error || "Unable to delete account",
      };
    }
  }, [logout]);

  const selectArea = (areaId: string) => {
    const found = AREAS_DATA.find((a) => a.id === areaId);
    if (found) {
      setSelectedArea(found);
    }
    setUserFlowStep("dashboard");
  };


  const testConnection = useCallback(
    async (url?: string): Promise<{ ok: boolean; error?: string }> => {
      const healthUrl = (url?.trim() || BACKEND_URL).replace(/\/+$/, "");

      if (!healthUrl) {
        return {
          ok: false,
          error: "EXPO_PUBLIC_BACKEND_URL is not configured",
        };
      }

      try {
        await api.checkHealth(healthUrl);
        return { ok: true };
      } catch {
        return { ok: false, error: `Unable to reach server: ${healthUrl}` };
      }
    },
    [],
  );

  // ── Misc actions ──────────────────────────────────────────────────────

  const addHazardReport = (
    report: Omit<HazardReport, "id" | "time" | "upvotes" | "status">,
  ) => {
    const newReport: HazardReport = {
      ...report,
      id: `REP-${Date.now().toString().slice(-4)}`,
      time: "Just now",
      upvotes: 1,
      status: "Reported",
    };
    setHazardReports((prev) => [newReport, ...prev]);
  };

  const toggleGoBagItem = (id: string) => {
    setGoBagItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const updateEmergencyContact = (contact: Partial<EmergencyContact>) => {
    setEmergencyContact((prev) => ({ ...prev, ...contact }));
  };

  const triggerSosAlert = () => {
    setSosTriggered(true);
    setTimeout(() => setSosTriggered(false), 8000);
  };

  // ── Gateway status (derived from connection state) ────────────────────
  const gatewayStatus = {
    connected: connection.isConnected,
    lastSync:
      connection.mode === "live"
        ? connection.lastSync
          ? `Live — synced ${new Date(connection.lastSync).toLocaleTimeString()}`
          : "Live — connecting…"
        : "Offline Simulation (MQTT DEMO)",
    frequency: "868.100 MHz (SF7 BW125)",
    encryption: "AES-128-GCM HW Engine",
    nodeCount: areaNodes.length,
  };

  return (
    <SanketContext.Provider
      value={{
        userFlowStep,
        setUserFlowStep,
        currentUser,
        loginUser,
        loginWithCredentials,
        registerWithCredentials,
        logout,
        selectedArea,
        selectArea,
        areasList: AREAS_DATA,
        threatLevel,
        nodes,
        areaNodes,
        activeAlerts,
        hazardReports,
        shelters,
        goBagItems,
        emergencyContact,
        simulationScenario,
        gatewayStatus,
        mqttData,
        setSimulationScenario,
        addHazardReport,
        toggleGoBagItem,
        updateEmergencyContact,
        triggerSosAlert,
        sosTriggered,
        themePreference,
        setThemePreference,
        resolvedTheme,
        theme: currentTheme,
        connection,
        // setServerUrl,
        testConnection,
        authToken,
        updateAccount,
        deleteAccount,
      }}
    >
      {children}
    </SanketContext.Provider>
  );
}

export function useSanket() {
  const context = useContext(SanketContext);
  if (!context) {
    throw new Error("useSanket must be used within a SanketProvider");
  }
  return context;
}
