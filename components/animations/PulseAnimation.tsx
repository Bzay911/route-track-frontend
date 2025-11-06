import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet } from "react-native";

interface PulseProps {
  size?: number;
  color?: string;
}

const PulseAnimation: React.FC<PulseProps> = ({
  size = 90,
  color = "rgba(123, 63, 228, 0.4)", // Purple with transparency
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          opacity,
          transform: [{ scale }],
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  circle: {
    position: "absolute",
    borderRadius: 100,
  },
});

export default PulseAnimation;
