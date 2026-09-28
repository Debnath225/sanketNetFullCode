import React, { useState, useEffect, useRef } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';

const DURATION = 700;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(0.5)).current;

  const isNativeDriver = Platform.OS !== 'web';

  useEffect(() => {
    // Subtle breathing glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.9,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.5,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNativeDriver,
        }),
      ])
    ).start();

    // Scale up slightly on mount
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: isNativeDriver,
    }).start();

    // Hide native splash screen then fade out overlay
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().finally(() => {
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: DURATION,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: isNativeDriver,
        }).start(() => {
          setVisible(false);
        });
      });
    }, 450);

    return () => clearTimeout(timer);
  }, [opacityAnim, scaleAnim, pulseAnim, isNativeDriver]);

  if (!visible) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.splashOverlay,
        {
          opacity: opacityAnim,
        },
      ]}>
      {/* Ambient background glow */}
      <Animated.View
        style={[
          styles.ambientGlow,
          {
            opacity: pulseAnim,
          },
        ]}
      />

      <Animated.View
        style={[
          styles.brandContainer,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}>
        {/* Full-rounded circular app emblem */}
        <View style={styles.imageRing}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
        </View>

        {/* Brand Titles */}
        <View style={styles.titleContainer}>
          <Text style={styles.brandTitle}>SANKET-NET</Text>
          <Text style={styles.brandSub}>ENVIRONMENTAL INTELLIGENCE</Text>
        </View>

        {/* Loading Indicator Dots */}
        <View style={styles.loadingBar}>
          <View style={styles.loadingDot} />
          <Text style={styles.loadingText}>INITIALIZING SENSOR MESH</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <View style={styles.iconRing}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={styles.staticIconImage}
          resizeMode="cover"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#07111f',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  ambientGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 50,
  },
  brandContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  imageRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2.5,
    borderColor: '#38bdf8',
    backgroundColor: '#0b1625',
    overflow: 'hidden',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    gap: 4,
  },
  brandTitle: {
    color: '#edf6ff',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 3,
  },
  brandSub: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  loadingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginTop: 8,
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  loadingText: {
    color: '#8295aa',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
  },
  iconRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#38bdf8',
    overflow: 'hidden',
    backgroundColor: '#07111f',
  },
  staticIconImage: {
    width: '100%',
    height: '100%',
  },
});
