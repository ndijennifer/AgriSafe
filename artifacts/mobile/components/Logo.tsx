import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";

const logoImage = require("@/assets/images/logo.png");

type LogoProps = {
  size?: "small" | "medium" | "large";
  showText?: boolean;
  light?: boolean;
};

export function Logo({ size = "medium", showText = true, light = false }: LogoProps) {
  const imageSize = size === "small" ? 36 : size === "large" ? 64 : 48;
  const textSize = size === "small" ? 14 : size === "large" ? 24 : 18;
  const subSize = size === "small" ? 9 : size === "large" ? 13 : 11;

  const textColor = light ? Colors.white : Colors.navy;

  return (
    <View style={styles.wrapper}>
      <Image
        source={logoImage}
        style={{ width: imageSize, height: imageSize, borderRadius: imageSize * 0.12 }}
        resizeMode="contain"
      />
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.title, { fontSize: textSize, color: textColor }]}>
            GRADE{" "}
            <Text style={{ color: Colors.primary }}>Calculator</Text>
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
  textContainer: {
    gap: 1,
  },
  title: {
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
});
