import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useMemo } from "react";
import { Animated, Easing, View, Text, TouchableOpacity } from "react-native";

export function DashboardHero({
  theme,
  selectedArea,
  connection,
  threatLevel,
  mqttData,
  onChangeArea,
  onOpenAlerts,
  onSOS,
}: any) {
  const pulse = useRef(new Animated.Value(1)).current;
  const entrance = useRef(new Animated.Value(0)).current;

  const isDanger = threatLevel.status === "CRITICAL";
  const isWarning = threatLevel.status === "ADVISORY";

  const accent = isDanger
    ? theme.danger
    : isWarning
      ? theme.warning
      : theme.success;

  const status = isDanger
    ? "CRITICAL ALERT"
    : isWarning
      ? "ELEVATED RISK"
      : "ALL SYSTEMS NORMAL";

  const hazard = isDanger
    ? (mqttData.hazardType || "HAZARD").toUpperCase()
    : isWarning
      ? "ADVISORY"
      : "MONITORING ACTIVE";

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.35,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    Animated.spring(entrance, {
      toValue: 1,
      friction: 8,
      tension: 45,
      useNativeDriver: true,
    }).start();

    return () => animation.stop();
  }, [pulse, entrance]);

  return (
    <Animated.View
      style={{
        opacity: entrance,
        transform: [
          {
            translateY: entrance.interpolate({
              inputRange: [0, 1],
              outputRange: [18, 0],
            }),
          },
        ],
        marginBottom: 24,
      }}
    >
      {/* TOP NAVIGATION */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 22,
          gap: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: theme.text,
              fontSize: 27,
              fontWeight: "900",
              letterSpacing: -0.8,
            }}
          >
            Sankat-Net
          </Text>

          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 12,
              marginTop: 4,
            }}
          >
            Environmental Intelligence
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={onChangeArea}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 7,
            paddingHorizontal: 13,
            paddingVertical: 11,
            borderRadius: 14,
            backgroundColor: theme.backgroundElement,
            borderWidth: 1,
            borderColor: theme.cardBorder,
            maxWidth: 190,
          }}
        >
          <Feather name="map-pin" size={15} color={theme.primary} />

          <Text
            numberOfLines={1}
            style={{
              color: theme.text,
              fontWeight: "700",
              fontSize: 12,
              flexShrink: 1,
            }}
          >
            {selectedArea.name.split("(")[0].trim()}
          </Text>

          <Feather name="chevron-down" size={14} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* HERO STATUS CARD */}
      <View
        style={{
          backgroundColor: theme.backgroundElement,
          borderWidth: 1,
          borderColor: isDanger ? accent : theme.cardBorder,
          borderRadius: 26,
          padding: 22,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {/* Decorative background glow */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: 90,
            backgroundColor: accent,
            opacity: 0.07,
            right: -65,
            top: -70,
          }}
        />

        {/* STATUS ROW */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 9,
              backgroundColor: `${accent}18`,
              borderColor: `${accent}50`,
              borderWidth: 1,
              paddingHorizontal: 11,
              paddingVertical: 8,
              borderRadius: 30,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: accent,
              }}
            />

            <Text
              style={{
                color: accent,
                fontSize: 10,
                fontWeight: "900",
                letterSpacing: 1,
              }}
            >
              {status}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 7,
            }}
          >
            <Animated.View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: connection.isConnected
                  ? theme.success
                  : theme.warning,
                transform: [{ scale: pulse }],
              }}
            />

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 11,
                fontWeight: "700",
              }}
            >
              {connection.isConnected ? "LIVE CONNECTION" : "OFFLINE"}
            </Text>
          </View>
        </View>

        {/* MAIN HEADLINE */}
        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 11,
            fontWeight: "800",
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          REGIONAL RISK OVERVIEW
        </Text>

        <Text
          style={{
            color: theme.text,
            fontSize: 31,
            fontWeight: "900",
            letterSpacing: -1,
            lineHeight: 38,
            marginBottom: 12,
          }}
        >
          {isDanger
            ? "Immediate attention required."
            : isWarning
              ? "Conditions need attention."
              : "Your region is being monitored."}
        </Text>

        <Text
          style={{
            color: theme.textSecondary,
            fontSize: 14,
            lineHeight: 22,
            maxWidth: 540,
          }}
        >
          {isDanger
            ? `${hazard} detected. ${threatLevel.advice}`
            : threatLevel.advice}
        </Text>

        {/* TELEMETRY STRIP */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 24,
          }}
        >
          {[
            {
              label: "WATER LEVEL",
              value: `${mqttData.waterLevelPct.toFixed(1)}%`,
              icon: "activity",
            },
            {
              label: "TEMPERATURE",
              value: `${mqttData.temperatureC.toFixed(1)}°C`,
              icon: "thermometer",
            },
            {
              label: "SENSOR NODES",
              value: String(mqttData.packetCount),
              icon: "radio",
            },
          ].map((item) => (
            <View
              key={item.label}
              style={{
                flexGrow: 1,
                flexBasis: 95,
                padding: 13,
                borderRadius: 16,
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: theme.cardBorder,
              }}
            >
              <Feather
                name={item.icon as any}
                size={16}
                color={theme.primary}
              />

              <Text
                style={{
                  color: theme.text,
                  fontSize: 19,
                  fontWeight: "900",
                  marginTop: 12,
                }}
              >
                {item.value}
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  fontSize: 9,
                  fontWeight: "800",
                  marginTop: 5,
                  letterSpacing: 0.6,
                }}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        {/* INTERACTIVE ACTIONS */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 20,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onOpenAlerts}
            style={{
              flexGrow: 1,
              flexBasis: 130,
              minHeight: 48,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 9,
              backgroundColor: theme.primary,
              borderRadius: 14,
              paddingHorizontal: 15,
            }}
          >
            <Feather name="bell" size={16} color="#FFFFFF" />

            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "800",
                fontSize: 12,
              }}
            >
              View Alerts
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onSOS}
            style={{
              flexGrow: 1,
              flexBasis: 130,
              minHeight: 48,
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 9,
              backgroundColor: `${theme.danger}12`,
              borderWidth: 1,
              borderColor: theme.danger,
              borderRadius: 14,
              paddingHorizontal: 15,
            }}
          >
            <Feather name="alert-triangle" size={16} color={theme.danger} />

            <Text
              style={{
                color: theme.danger,
                fontWeight: "900",
                fontSize: 12,
              }}
            >
              Emergency SOS
            </Text>
          </TouchableOpacity>
        </View>

        {/* LAST PACKET */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 20,
            paddingTop: 15,
            borderTopWidth: 1,
            borderTopColor: theme.cardBorder,
          }}
        >
          <Text
            style={{
              color: theme.textSecondary,
              fontSize: 11,
            }}
          >
            Last telemetry packet
          </Text>

          <Text
            style={{
              color: theme.text,
              fontSize: 11,
              fontWeight: "800",
            }}
          >
            {mqttData.lastUpdate || "Waiting for data"}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
