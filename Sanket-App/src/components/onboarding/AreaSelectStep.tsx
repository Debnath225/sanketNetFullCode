import { useSanket } from "@/context/SanketContext";
import { useTheme } from "@/hooks/use-theme";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  LayoutChangeEvent,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface MapNodeMarker {
  id: string;
  name: string;
  code: string;
  lat: number;
  lon: number;
  waterLevel: string;
  maxLevel: string;
  status: "CRITICAL" | "ADVISORY" | "NORMAL";
  statusLabel: string;
  areaId: string;
  location: string;
  battery: number;
  rssi: number;
}

// Actual geographic positions along the Hooghly basin
const MAP_NODES: MapNodeMarker[] = [
  {
    id: "NODE-01",
    name: "Hooghly River Station",
    code: "01",
    lat: 22.653,
    lon: 88.358,
    waterLevel: "4.82m",
    maxLevel: "6.5m",
    status: "CRITICAL",
    statusLabel: "Critical Flood Surge",
    areaId: "area-hooghly",
    location: "Barrage Sluice Gate 4, Sector 1",
    battery: 92,
    rssi: -74,
  },
  {
    id: "NODE-02",
    name: "Barrackpore Embankment",
    code: "02",
    lat: 22.758,
    lon: 88.368,
    waterLevel: "3.95m",
    maxLevel: "5.8m",
    status: "ADVISORY",
    statusLabel: "Embankment Warning",
    areaId: "area-barrackpore",
    location: "Bund Pier km 14.2, Riverside Rd",
    battery: 88,
    rssi: -82,
  },
  {
    id: "NODE-03",
    name: "Salt Lake Drainage Canal",
    code: "03",
    lat: 22.578,
    lon: 88.428,
    waterLevel: "2.75m",
    maxLevel: "4.0m",
    status: "NORMAL",
    statusLabel: "Normal Canal Flow",
    areaId: "area-saltlake",
    location: "Canal Outfall Pump Station #2",
    battery: 96,
    rssi: -68,
  },
  {
    id: "NODE-04",
    name: "Howrah Lowland Outpost",
    code: "04",
    lat: 22.592,
    lon: 88.324,
    waterLevel: "1.65m",
    maxLevel: "3.2m",
    status: "NORMAL",
    statusLabel: "Normal Drainage Level",
    areaId: "area-howrah",
    location: "Lowland Culvert #9, GT Road",
    battery: 91,
    rssi: -79,
  },
  {
    id: "NODE-05",
    name: "Hooghly River Station-2",
    code: "05",
    lat: 22.560,
    lon: 88.304,
    waterLevel: "3.82m",
    maxLevel: "6.5m",
    status: "CRITICAL",
    statusLabel: "Critical Flood Surge",
    areaId: "area-hooghly",
    location: "Barrage Sluice Gate 5, Sector 1",
    battery: 82,
    rssi: -84,
  },
];

// Web Mercator projection helpers
function lonToPixel(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * Math.pow(2, zoom) * 256;
}

function latToPixel(lat: number, zoom: number): number {
  const sin = Math.sin((lat * Math.PI) / 180);
  const clampedSin = Math.min(Math.max(sin, -0.9999), 0.9999);
  const y = 0.5 - Math.log((1 + clampedSin) / (1 - clampedSin)) / (4 * Math.PI);
  return y * Math.pow(2, zoom) * 256;
}

export function AreaSelectStep() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { selectArea } = useSanket();

  const [selectedNodeId, setSelectedNodeId] = useState<string>("NODE-01");
  const [searchQuery, setSearchQuery] = useState("");
  const [mapType, setMapType] = useState<"map" | "satellite">("map");
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [mapSize, setMapSize] = useState<{ width: number; height: number }>({
    width: 400,
    height: 400,
  });

  const isLight = theme.background === "#EEF2F6";
  const primaryBtnTextColor = "#FFFFFF";
  const isSatellite = mapType === "satellite";

  // Smooth Hardware-Accelerated Animation Values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const panAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const zoomLevelRef = useRef<number>(zoomLevel);
  zoomLevelRef.current = zoomLevel;

  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  panOffsetRef.current = panOffset;

  const initialPinchDistRef = useRef<number | null>(null);
  const pinchScaleRef = useRef<number>(1);
  const lastTapTimeRef = useRef<number>(0);

  // Center coordinates of our catchment network
  const CENTER_LAT = 22.65;
  const CENTER_LON = 88.37;

  function calcTouchDistance(
    t1: { pageX: number; pageY: number },
    t2: { pageX: number; pageY: number },
  ): number {
    const dx = t1.pageX - t2.pageX;
    const dy = t1.pageY - t2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Smooth Animated Zoom In Button
  const handleZoomIn = () => {
    if (zoomLevelRef.current >= 15) return;
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.15,
        duration: 110,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => {
      setZoomLevel((z) => Math.min(15, z + 1));
      scaleAnim.setValue(1);
    });
  };

  // Smooth Animated Zoom Out Button
  const handleZoomOut = () => {
    if (zoomLevelRef.current <= 11) return;
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 110,
        useNativeDriver: Platform.OS !== "web",
      }),
    ]).start(() => {
      setZoomLevel((z) => Math.max(11, z - 1));
      scaleAnim.setValue(1);
    });
  };

  // Smooth Double Tap Zoom
  const handleDoubleTap = () => {
    if (zoomLevelRef.current < 15) {
      Animated.timing(scaleAnim, {
        toValue: 1.25,
        duration: 120,
        useNativeDriver: Platform.OS !== "web",
      }).start(() => {
        setZoomLevel((z) => Math.min(15, z + 1));
        scaleAnim.setValue(1);
      });
    }
  };

  // High-performance PanResponder: updates native animated transforms directly without triggering React re-renders!
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => {
        return (evt.nativeEvent.touches?.length ?? 0) > 1;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        const touchCount = evt.nativeEvent.touches?.length ?? 0;
        if (touchCount >= 2) return true;
        return Math.abs(gestureState.dx) > 3 || Math.abs(gestureState.dy) > 3;
      },
      onPanResponderGrant: (evt) => {
        const touches = evt.nativeEvent.touches;
        if (touches && touches.length >= 2) {
          const dist = calcTouchDistance(touches[0], touches[1]);
          initialPinchDistRef.current = dist > 0 ? dist : null;
        } else {
          initialPinchDistRef.current = null;
          startPanRef.current = { ...panOffsetRef.current };
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        const touches = evt.nativeEvent.touches;
        // Two-finger pinch to zoom
        if (touches && touches.length >= 2) {
          const currentDist = calcTouchDistance(touches[0], touches[1]);
          if (!initialPinchDistRef.current) {
            initialPinchDistRef.current = currentDist > 0 ? currentDist : null;
          } else if (initialPinchDistRef.current > 0) {
            const rawScale = currentDist / initialPinchDistRef.current;
            const boundedScale = Math.max(0.55, Math.min(1.9, rawScale));
            scaleAnim.setValue(boundedScale);
            pinchScaleRef.current = boundedScale;
          }
        } else if (!initialPinchDistRef.current) {
          // Single-finger smooth panning via Animated.ValueXY (zero React re-renders during drag!)
          panAnim.setValue({
            x: gestureState.dx,
            y: gestureState.dy,
          });
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (initialPinchDistRef.current !== null) {
          const finalScale = pinchScaleRef.current;
          if (finalScale > 1.25 && zoomLevelRef.current < 15) {
            Animated.timing(scaleAnim, {
              toValue: 1.3,
              duration: 90,
              useNativeDriver: Platform.OS !== "web",
            }).start(() => {
              setZoomLevel((z) => Math.min(15, z + 1));
              scaleAnim.setValue(1);
              pinchScaleRef.current = 1;
            });
          } else if (finalScale < 0.8 && zoomLevelRef.current > 11) {
            Animated.timing(scaleAnim, {
              toValue: 0.75,
              duration: 90,
              useNativeDriver: Platform.OS !== "web",
            }).start(() => {
              setZoomLevel((z) => Math.max(11, z - 1));
              scaleAnim.setValue(1);
              pinchScaleRef.current = 1;
            });
          } else {
            Animated.spring(scaleAnim, {
              toValue: 1,
              friction: 8,
              useNativeDriver: Platform.OS !== "web",
            }).start(() => {
              pinchScaleRef.current = 1;
            });
          }
          initialPinchDistRef.current = null;
        } else {
          // Commit dragged pan offset and reset animated offset
          const nextPanX = startPanRef.current.x + gestureState.dx;
          const nextPanY = startPanRef.current.y + gestureState.dy;
          panOffsetRef.current = { x: nextPanX, y: nextPanY };
          setPanOffset({ x: nextPanX, y: nextPanY });
          panAnim.setValue({ x: 0, y: 0 });

          // Double-tap detection
          const now = Date.now();
          if (
            now - lastTapTimeRef.current < 300 &&
            Math.abs(gestureState.dx) < 6 &&
            Math.abs(gestureState.dy) < 6
          ) {
            handleDoubleTap();
            lastTapTimeRef.current = 0;
          } else {
            lastTapTimeRef.current = now;
          }
        }
      },
    }),
  ).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setMapSize({ width, height });
    }
  };

  const selectedNode =
    MAP_NODES.find((n) => n.id === selectedNodeId) || MAP_NODES[0];

  // Filter nodes based on search query
  const filteredNodes = MAP_NODES.filter(
    (n) =>
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.location.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleSelectNode = (node: MapNodeMarker) => {
    setSelectedNodeId(node.id);
    // Center map smoothly on the selected node
    const cx = lonToPixel(CENTER_LON, zoomLevel);
    const cy = latToPixel(CENTER_LAT, zoomLevel);
    const nx = lonToPixel(node.lon, zoomLevel);
    const ny = latToPixel(node.lat, zoomLevel);
    const targetPan = {
      x: cx - nx,
      y: cy - ny,
    };
    panOffsetRef.current = targetPan;
    setPanOffset(targetPan);
    panAnim.setValue({ x: 0, y: 0 });
  };

  const handleResetCenter = () => {
    panOffsetRef.current = { x: 0, y: 0 };
    setPanOffset({ x: 0, y: 0 });
    panAnim.setValue({ x: 0, y: 0 });
    setZoomLevel(12);
    scaleAnim.setValue(1);
  };

  const handleConfirm = () => {
    selectArea(selectedNode.areaId);
  };

  const getStatusColor = (status: MapNodeMarker["status"]) => {
    if (status === "CRITICAL") return "#EF4444";
    if (status === "ADVISORY") return "#F59E0B";
    return "#22C55E";
  };

  // Center pixel calculation
  const centerPxX = lonToPixel(CENTER_LON, zoomLevel) - panOffset.x;
  const centerPxY = latToPixel(CENTER_LAT, zoomLevel) - panOffset.y;

  // Memoized visible Google Maps tiles in current viewport
  const tiles = useMemo(() => {
    const minTileX = Math.floor((centerPxX - mapSize.width / 2 - 256) / 256);
    const maxTileX = Math.floor((centerPxX + mapSize.width / 2 + 256) / 256);
    const minTileY = Math.floor((centerPxY - mapSize.height / 2 - 256) / 256);
    const maxTileY = Math.floor((centerPxY + mapSize.height / 2 + 256) / 256);

    const list: { key: string; url: string; x: number; y: number }[] = [];
    for (let tx = minTileX; tx <= maxTileX; tx++) {
      for (let ty = minTileY; ty <= maxTileY; ty++) {
        const tileUrl = `https://mt1.google.com/vt/lyrs=${
          isSatellite ? "y" : "m"
        }&x=${tx}&y=${ty}&z=${zoomLevel}`;
        const tileLeft = mapSize.width / 2 + (tx * 256 - centerPxX);
        const tileTop = mapSize.height / 2 + (ty * 256 - centerPxY);
        list.push({
          key: `${zoomLevel}-${tx}-${ty}-${mapType}`,
          url: tileUrl,
          x: tileLeft,
          y: tileTop,
        });
      }
    }
    return list;
  }, [
    zoomLevel,
    panOffset.x,
    panOffset.y,
    isSatellite,
    mapType,
    mapSize.width,
    mapSize.height,
  ]);

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      {/* ================= REAL GOOGLE MAP CONTAINER (>55% HEIGHT, EDGE-TO-EDGE) ================= */}
      <View
        style={styles.mapContainer}
        onLayout={handleLayout}
        {...panResponder.panHandlers}
      >
        {/* Google Map Tiles View with Hardware-Accelerated Smooth Scaling & Translation */}
        <Animated.View
          style={[
            styles.mapCanvas,
            {
              backgroundColor: isSatellite
                ? "#0A1524"
                : isLight
                  ? "#E5E9EE"
                  : "#111D2E",
              transform: [
                { translateX: panAnim.x },
                { translateY: panAnim.y },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {tiles.map((tile) => (
            <Image
              key={tile.key}
              source={{ uri: tile.url }}
              style={[
                styles.tileImage,
                {
                  left: tile.x,
                  top: tile.y,
                },
              ]}
              resizeMode="cover"
            />
          ))}

          {/* ================= GOOGLE MAPS STYLE PINS FOR NODES ================= */}
          {MAP_NODES.map((node) => {
            const isSelected = node.id === selectedNodeId;
            const statusColor = getStatusColor(node.status);
            const isMatch =
              searchQuery.length === 0 ||
              filteredNodes.some((fn) => fn.id === node.id);

            // Calculate exact screen position of this node pin
            const pinX =
              mapSize.width / 2 + (lonToPixel(node.lon, zoomLevel) - centerPxX);
            const pinY =
              mapSize.height / 2 +
              (latToPixel(node.lat, zoomLevel) - centerPxY);

            return (
              <TouchableOpacity
                key={node.id}
                style={[
                  styles.nodeMarkerTouch,
                  {
                    left: pinX,
                    top: pinY,
                    opacity: isMatch ? 1 : 0.35,
                    transform: [{ scale: isSelected ? 1.15 : 1 }],
                    zIndex: isSelected ? 30 : 20,
                  },
                ]}
                activeOpacity={0.85}
                onPress={() => handleSelectNode(node)}
              >
                {/* Floating Callout Pill */}
                <View
                  style={[
                    styles.markerCallout,
                    {
                      backgroundColor: isSelected ? statusColor : theme.card,
                      borderColor: statusColor,
                      borderWidth: isSelected ? 0 : 1.5,
                      shadowColor: statusColor,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.markerCalloutDot,
                      {
                        backgroundColor: isSelected ? "#FFFFFF" : statusColor,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.markerCalloutText,
                      { color: isSelected ? "#FFFFFF" : theme.text },
                    ]}
                  >
                    {node.id} • {node.waterLevel}
                  </Text>
                </View>

                {/* Pin Teardrop Body */}
                <View
                  style={[
                    styles.pinHead,
                    {
                      backgroundColor: statusColor,
                      shadowColor: statusColor,
                    },
                    isSelected && styles.pinHeadSelected,
                  ]}
                >
                  <MaterialCommunityIcons
                    name={
                      node.status === "CRITICAL"
                        ? "alert-octagon"
                        : node.status === "ADVISORY"
                          ? "alert"
                          : "radio-tower"
                    }
                    size={16}
                    color="#FFFFFF"
                  />
                </View>
                <View
                  style={[styles.pinPoint, { borderTopColor: statusColor }]}
                />

                {/* Ground Shadow & Radar Pulse on Selected */}
                <View style={styles.pinShadow} />
                {isSelected && (
                  <View
                    style={[styles.radarPulse, { borderColor: statusColor }]}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* ================= FLOATING GOOGLE MAPS SEARCH BAR ================= */}
        <View
          style={[
            styles.floatingSearchBar,
            {
              top: Math.max(insets.top, 8) + 6,
              backgroundColor: isLight ? "#FFFFFF" : theme.card,
              borderColor: theme.cardBorder,
              shadowColor: "#000",
            },
          ]}
        >
          <View style={styles.searchIconBox}>
            <Feather name="search" size={18} color={theme.primary} />
          </View>

          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search Google Maps / LoRa Nodes..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              const found = MAP_NODES.find(
                (n) =>
                  n.name.toLowerCase().includes(text.toLowerCase()) ||
                  n.id.toLowerCase().includes(text.toLowerCase()),
              );
              if (found) {
                setSelectedNodeId(found.id);
              }
            }}
          />

          {searchQuery.length > 0 ? (
            <TouchableOpacity
              style={styles.searchActionBtn}
              onPress={() => setSearchQuery("")}
            >
              <Feather name="x" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.searchActionBtn}>
              <MaterialCommunityIcons
                name="google-maps"
                size={18}
                color={theme.primary}
              />
            </View>
          )}
        </View>

        {/* ================= MAP LAYER SWITCHER (Map vs Satellite) ================= */}
        <View
          style={[
            styles.layerSwitcher,
            {
              top: Math.max(insets.top, 8) + 60,
              backgroundColor: isLight ? "#FFFFFF" : theme.card,
              borderColor: theme.cardBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.layerBtn,
              mapType === "map" && styles.layerBtnActive,
              mapType === "map" && { backgroundColor: theme.primary },
            ]}
            onPress={() => setMapType("map")}
          >
            <Text
              style={[
                styles.layerBtnText,
                {
                  color:
                    mapType === "map"
                      ? primaryBtnTextColor
                      : theme.textSecondary,
                },
              ]}
            >
              Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.layerBtn,
              mapType === "satellite" && styles.layerBtnActive,
              mapType === "satellite" && { backgroundColor: theme.primary },
            ]}
            onPress={() => setMapType("satellite")}
          >
            <Text
              style={[
                styles.layerBtnText,
                {
                  color:
                    mapType === "satellite"
                      ? primaryBtnTextColor
                      : theme.textSecondary,
                },
              ]}
            >
              Satellite
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= BOTTOM-RIGHT: ZOOM & RE-CENTER CONTROLS ================= */}
        <View style={styles.mapActionsRight}>
          <TouchableOpacity
            style={[
              styles.mapCircleBtn,
              {
                backgroundColor: isLight ? "#FFFFFF" : theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
            onPress={handleResetCenter}
          >
            <MaterialCommunityIcons
              name="crosshairs-gps"
              size={18}
              color={theme.primary}
            />
          </TouchableOpacity>

          <View
            style={[
              styles.zoomPill,
              {
                backgroundColor: isLight ? "#FFFFFF" : theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.zoomBtn}
              activeOpacity={0.7}
              onPress={handleZoomIn}
            >
              <Feather name="plus" size={17} color={theme.text} />
            </TouchableOpacity>
            <View
              style={[
                styles.zoomDivider,
                { backgroundColor: theme.cardBorder },
              ]}
            />
            <TouchableOpacity
              style={styles.zoomBtn}
              activeOpacity={0.7}
              onPress={handleZoomOut}
            >
              <Feather name="minus" size={17} color={theme.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ================= BOTTOM-LEFT: AUTHENTIC GOOGLE WATERMARK ================= */}
        <View style={styles.googleWatermark}>
          <Text style={styles.googleWatermarkText}>
            <Text style={{ color: "#4285F4" }}>G</Text>
            <Text style={{ color: "#EA4335" }}>o</Text>
            <Text style={{ color: "#FBBC05" }}>o</Text>
            <Text style={{ color: "#4285F4" }}>g</Text>
            <Text style={{ color: "#34A853" }}>l</Text>
            <Text style={{ color: "#EA4335" }}>e</Text>
          </Text>
          <Text
            style={[
              styles.mapDataText,
              { color: isLight ? "#475569" : "#94A3B8" },
            ]}
          >
            {" "}
            Map data ©2026
          </Text>
        </View>
      </View>

      {/* ================= CLEAN BOTTOM DRAWER (ZERO OVERLAPPING TEXT) ================= */}
      <View
        style={[
          styles.drawerContainer,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.cardBorder,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Drag Handle */}
        <View
          style={[styles.dragHandle, { backgroundColor: theme.cardBorder }]}
        />

        {/* Header Row: Node Info (Left) + Status Pill (Right) */}
        <View style={styles.drawerHeader}>
          <View style={styles.headerLeftCol}>
            <View style={styles.nodeIdBadgeRow}>
              <View
                style={[
                  styles.nodeBadgePill,
                  {
                    backgroundColor: `${getStatusColor(selectedNode.status)}20`,
                    borderColor: getStatusColor(selectedNode.status),
                  },
                ]}
              >
                <View
                  style={[
                    styles.nodeBadgeDot,
                    { backgroundColor: getStatusColor(selectedNode.status) },
                  ]}
                />
                <Text
                  style={[
                    styles.nodeBadgePillText,
                    { color: getStatusColor(selectedNode.status) },
                  ]}
                >
                  {selectedNode.id}
                </Text>
              </View>

              <Text
                style={[styles.locationText, { color: theme.textSecondary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {selectedNode.location}
              </Text>
            </View>

            <Text
              style={[styles.nodeTitle, { color: theme.text }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedNode.name}
            </Text>
          </View>

          {/* Water Level / Hazard Status Pill */}
          <View
            style={[
              styles.hazardStatusPill,
              {
                backgroundColor: `${getStatusColor(selectedNode.status)}18`,
                borderColor: getStatusColor(selectedNode.status),
              },
            ]}
          >
            <Text
              style={[
                styles.hazardStatusValue,
                { color: getStatusColor(selectedNode.status) },
              ]}
            >
              {selectedNode.waterLevel}
            </Text>
            <Text
              style={[
                styles.hazardStatusLabel,
                { color: getStatusColor(selectedNode.status) },
              ]}
              numberOfLines={1}
            >
              {selectedNode.status === "CRITICAL"
                ? "CRITICAL RISK"
                : selectedNode.status === "ADVISORY"
                  ? "ADVISORY"
                  : "SAFE FLOW"}
            </Text>
          </View>
        </View>

        {/* 3 Clean Telemetry Cards (Responsive, non-overflowing) */}
        <View style={styles.metricsGrid}>
          {/* Card 1: Water Level */}
          <View
            style={[
              styles.metricMiniCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.miniCardHead}>
              <Feather name="activity" size={12} color="#38BDF8" />
              <Text
                style={[styles.miniCardLabel, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                WATER
              </Text>
            </View>
            <Text
              style={[styles.miniCardVal, { color: theme.text }]}
              numberOfLines={1}
            >
              {selectedNode.waterLevel}
            </Text>
            <Text
              style={[styles.miniCardSub, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              Max {selectedNode.maxLevel}
            </Text>
          </View>

          {/* Card 2: Battery */}
          <View
            style={[
              styles.metricMiniCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.miniCardHead}>
              <Feather name="battery-charging" size={12} color="#22C55E" />
              <Text
                style={[styles.miniCardLabel, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                BATTERY
              </Text>
            </View>
            <Text
              style={[styles.miniCardVal, { color: theme.text }]}
              numberOfLines={1}
            >
              {selectedNode.battery}%
            </Text>
            <Text
              style={[styles.miniCardSub, { color: "#22C55E" }]}
              numberOfLines={1}
            >
              Solar Charged
            </Text>
          </View>

          {/* Card 3: LoRa Signal */}
          <View
            style={[
              styles.metricMiniCard,
              {
                backgroundColor: theme.card,
                borderColor: theme.cardBorder,
              },
            ]}
          >
            <View style={styles.miniCardHead}>
              <MaterialCommunityIcons
                name="antenna"
                size={13}
                color="#A78BFA"
              />
              <Text
                style={[styles.miniCardLabel, { color: theme.textSecondary }]}
                numberOfLines={1}
              >
                LORA MESH
              </Text>
            </View>
            <Text
              style={[styles.miniCardVal, { color: theme.text }]}
              numberOfLines={1}
            >
              {selectedNode.rssi} dBm
            </Text>
            <Text
              style={[styles.miniCardSub, { color: theme.textSecondary }]}
              numberOfLines={1}
            >
              SF7 Bridge
            </Text>
          </View>
        </View>

        {/* Quick Node Switcher Horizontal Pills */}
        <View style={styles.nodePillsRow}>
          <Text style={[styles.nodePillsLabel, { color: theme.textSecondary }]}>
            NODES:
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.nodePillsScroll}
          >
            {MAP_NODES.map((node) => {
              const active = node.id === selectedNodeId;
              const col = getStatusColor(node.status);
              return (
                <TouchableOpacity
                  key={node.id}
                  style={[
                    styles.nodeQuickPill,
                    {
                      backgroundColor: active
                        ? theme.primary
                        : theme.backgroundElement,
                      borderColor: active ? theme.primary : theme.cardBorder,
                    },
                  ]}
                  onPress={() => handleSelectNode(node)}
                >
                  <View
                    style={[
                      styles.nodeQuickDot,
                      { backgroundColor: active ? primaryBtnTextColor : col },
                    ]}
                  />
                  <Text
                    style={[
                      styles.nodeQuickText,
                      {
                        color: active ? primaryBtnTextColor : theme.text,
                        fontWeight: active ? "700" : "500",
                      },
                    ]}
                  >
                    {node.id}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Confirm Action Button */}
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: theme.primary }]}
          activeOpacity={0.82}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityRole="button"
          onPress={handleConfirm}
        >
          <Text style={[styles.confirmBtnText, { color: primaryBtnTextColor }]}>
            Confirm Node & Launch Dashboard
          </Text>
          <Feather name="arrow-right" size={17} color={primaryBtnTextColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  /* Full Edge-to-Edge Google Maps Viewport */
  mapContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    overflow: "hidden",
  },
  mapCanvas: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: "hidden",
  },
  tileImage: {
    position: "absolute",
    width: 256,
    height: 256,
  },

  /* Floating Search Bar (Google Maps style) */
  floatingSearchBar: {
    position: "absolute",
    left: 12,
    right: 12,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    zIndex: 40,
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  searchIconBox: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    paddingVertical: 6,
  },
  searchActionBtn: {
    padding: 6,
  },

  /* Layer Switcher (Map / Satellite) */
  layerSwitcher: {
    position: "absolute",
    right: 12,
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    padding: 2,
    zIndex: 40,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
  },
  layerBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
  },
  layerBtnActive: {
    elevation: 2,
  },
  layerBtnText: {
    fontSize: 11,
    fontWeight: "700",
  },

  /* Right-side Map Controls Floating Over Map */
  mapActionsRight: {
    position: "absolute",
    right: 12,
    bottom: 248,
    alignItems: "center",
    gap: 8,
    zIndex: 40,
  },
  mapCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  zoomPill: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  zoomBtn: {
    width: 38,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomDivider: {
    height: 1,
    width: "100%",
  },

  /* Node Markers on Map */
  nodeMarkerTouch: {
    position: "absolute",
    alignItems: "center",
    marginLeft: -22,
    marginTop: -42,
  },
  markerCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 10,
    marginBottom: 4,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  markerCalloutDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  markerCalloutText: {
    fontSize: 9.5,
    fontWeight: "800",
  },
  pinHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    elevation: 6,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  pinHeadSelected: {
    transform: [{ scale: 1.08 }],
    borderColor: "#FFFFFF",
    borderWidth: 2.5,
  },
  pinPoint: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 7,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -2,
  },
  pinShadow: {
    width: 12,
    height: 4,
    borderRadius: 6,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    marginTop: 2,
  },
  radarPulse: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    top: 0,
    left: -2,
    opacity: 0.5,
  },

  /* Google Logo Watermark */
  googleWatermark: {
    position: "absolute",
    left: 12,
    bottom: 248,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 25,
  },
  googleWatermarkText: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  mapDataText: {
    fontSize: 9.5,
    fontWeight: "600",
  },

  /* Floating Google Maps Bottom Card */
  drawerContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    maxWidth: 580,
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 14,
    paddingBottom: 12,
    zIndex: 50,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
  },
  dragHandle: {
    width: 32,
    height: 3.5,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerLeftCol: {
    flex: 1,
    marginRight: 6,
  },
  nodeIdBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  nodeBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 8,
  },
  nodeBadgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  nodeBadgePillText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  locationText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: "500",
  },
  nodeTitle: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  hazardStatusPill: {
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 78,
  },
  hazardStatusValue: {
    fontSize: 13,
    fontWeight: "800",
  },
  hazardStatusLabel: {
    fontSize: 8.5,
    fontWeight: "800",
    letterSpacing: 0.4,
    marginTop: 1,
  },

  /* 3 Clean Mini Cards */
  metricsGrid: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 6,
  },
  metricMiniCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 7,
    paddingHorizontal: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  miniCardHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  miniCardLabel: {
    flex: 1,
    fontSize: 8.5,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  miniCardVal: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  miniCardSub: {
    fontSize: 9,
    fontWeight: "600",
    marginTop: 1,
  },

  /* Quick Node Selector Pills */
  nodePillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  nodePillsLabel: {
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  nodePillsScroll: {
    gap: 6,
    paddingRight: 8,
  },
  nodeQuickPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  nodeQuickDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  nodeQuickText: {
    fontSize: 10.5,
  },

  /* Confirm Button */
  confirmBtn: {
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
  },
  confirmBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
