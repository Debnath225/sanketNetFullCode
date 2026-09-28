import React, { useRef, useEffect } from 'react';
import { TouchableOpacity, Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';

interface ModernSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}

export function ModernSwitch({ value, onValueChange, disabled }: ModernSwitchProps) {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      damping: 16,
      stiffness: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const trackBg = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(120, 130, 145, 0.25)', theme.primary],
  });

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(150, 150, 150, 0.35)', theme.primary],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onValueChange(!value)}
      style={styles.touchArea}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}>
      <Animated.View
        style={[
          styles.track,
          {
            backgroundColor: trackBg,
            borderColor: borderColor,
          },
          value && styles.activeGlow,
        ]}>
        <Animated.View
          style={[
            styles.knob,
            {
              transform: [{ translateX }],
            },
          ]}>
          <View
            style={[
              styles.innerDot,
              { backgroundColor: value ? theme.primary : '#94a3b8' },
            ]}
          />
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: 'center',
    position: 'relative',
  },
  activeGlow: {
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
  innerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
