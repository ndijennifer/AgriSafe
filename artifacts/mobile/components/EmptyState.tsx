import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

type EmptyStateProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
};

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={40} color={Colors.midGray} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 10,
    paddingBottom: 80,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.lightGray,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 18,
    color: Colors.navy,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.midGray,
    textAlign: "center",
    lineHeight: 20,
  },
});
