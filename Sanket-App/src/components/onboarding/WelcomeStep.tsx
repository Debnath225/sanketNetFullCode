import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSanket } from '@/context/SanketContext';
import { useTheme } from '@/hooks/use-theme';

export function WelcomeStep() {
  const { setUserFlowStep } = useSanket();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const haloAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const isNativeDriver = Platform.OS !== 'web';

    // Smooth entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: isNativeDriver,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: isNativeDriver,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: isNativeDriver,
      }),
    ]).start();

    // Ambient rhythmic breathing pulse on the rounded app icon
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNativeDriver,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNativeDriver,
        }),
      ])
    );

    // Glowing cyan halo loop
    const haloLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(haloAnim, {
          toValue: 0.8,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNativeDriver,
        }),
        Animated.timing(haloAnim, {
          toValue: 0.35,
          duration: 2200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: isNativeDriver,
        }),
      ])
    );

    pulseLoop.start();
    haloLoop.start();

    return () => {
      pulseLoop.stop();
      haloLoop.stop();
    };
  }, [fadeAnim, slideAnim, scaleAnim, pulseAnim, haloAnim]);

  return (
    <View
      style={[
        styles.screen,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 24),
          paddingBottom: Math.max(insets.bottom, 24),
          paddingLeft: Math.max(insets.left, 24),
          paddingRight: Math.max(insets.right, 24),
        },
      ]}>
      {/* Subtle Background Radial Ambient Glow */}
      <View style={[styles.ambientGlow, { backgroundColor: `${theme.primary}15` }]} />

      {/* Top / Center Section */}
      <View style={styles.centerContent}>
        {/* Animated Greeting */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <Text style={[styles.badgeText, { color: theme.primary }]}>ENVIRONMENTAL INTELLIGENCE</Text>
          <Text style={[styles.mainTitle, { color: theme.text }]}>
            Welcome to <Text style={{ color: theme.primary, fontWeight: '900' }}>Sanket-Net</Text>
          </Text>
        </Animated.View>

        {/* Animated App Image - Rounded Full */}
        <Animated.View
          style={[
            styles.imageWrapper,
            {
              opacity: fadeAnim,
              transform: [
                {
                  scale: Animated.multiply(scaleAnim, pulseAnim),
                },
              ],
            },
          ]}>
          {/* Glowing Radial Halo */}
          <Animated.View
            style={[
              styles.imageHalo,
              {
                opacity: haloAnim,
                backgroundColor: `${theme.primary}25`,
                shadowColor: theme.primary,
              },
            ]}
          />

          {/* Full Rounded Circular Image Frame */}
          <View style={[styles.imageCircle, { borderColor: theme.primary, backgroundColor: theme.card }]}>
            <Image
              source={require('@/assets/images/icon.png')}
              style={styles.appImage}
              resizeMode="cover"
            />
          </View>
        </Animated.View>
      </View>

      {/* Bottom Section with Get Started Button */}
      <Animated.View
        style={[
          styles.bottomSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        <TouchableOpacity
          style={[styles.getStartedButton, { backgroundColor: '#0284c7' }]}
          activeOpacity={0.85}
          onPress={() => setUserFlowStep('guide')}>
          <Text style={styles.getStartedButtonText}>Get Started</Text>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signInRow}
          activeOpacity={0.7}
          onPress={() => setUserFlowStep('auth')}>
          <Text style={[styles.signInText, { color: theme.textSecondary }]}>
            Already registered? <Text style={{ color: theme.primary, fontWeight: '700' }}>Sign In</Text>
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#07111f',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: '100%',
  },
  ambientGlow: {
    position: 'absolute',
    top: '25%',
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    filter: Platform.OS === 'web' ? 'blur(60px)' : undefined,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    maxWidth: 440,
    gap: 36,
  },
  titleContainer: {
    alignItems: 'center',
  },
  badgeText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  mainTitle: {
    color: '#edf6ff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  brandCyan: {
    color: '#38bdf8',
    fontWeight: '900',
  },
  imageWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  imageHalo: {
    position: 'absolute',
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: 'rgba(34, 211, 238, 0.22)',
    shadowColor: '#22d3ee',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
  },
  imageCircle: {
    width: 230,
    height: 230,
    borderRadius: 115, // full circle / rounded full
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#38bdf8',
    backgroundColor: '#0b1625',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  appImage: {
    width: '100%',
    height: '100%',
  },
  bottomSection: {
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
    gap: 12,
  },
  getStartedButton: {
    width: '100%',
    backgroundColor: '#38bdf8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  signInRow: {
    paddingVertical: 6,
  },
  signInText: {
    color: '#8295aa',
    fontSize: 13,
  },
  signInBold: {
    color: '#38bdf8',
    fontWeight: '700',
  },
});
