import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

type LogoProps = {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  light?: boolean;
};

export function Logo({ size = "medium", showText = true, light = false }: LogoProps) {
  const iconSize = size === "small" ? 20 : size === "large" ? 40 : 28;
  const containerSize = size === "small" ? 36 : size === "large" ? 64 : 48;
  const textSize = size === "small" ? 14 : size === "large" ? 24 : 18;
  const subSize = size === "small" ? 9 : size === "large" ? 13 : 11;

  const textColor = light ? Colors.white : Colors.navy;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.iconContainer,
          {
            width: containerSize,
            height: containerSize,
            borderRadius: containerSize * 0.22,
          },
        ]}
      >
        <Ionicons name="school" size={iconSize} color={Colors.white} />
      </View>
      {showText && (
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              { fontSize: textSize, color: textColor },
            ]}
          >
            Grade
            <Text style={{ color: Colors.primary }}> Calc</Text>
          </Text>
          <Text style={[styles.subtitle, { fontSize: subSize, color: light ? "rgba(255,255,255,0.7)" : Colors.midGray }]}>
            Academic Performance Tracker
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconContainer: {
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    gap: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
});
