import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

type StatCardProps = {
  label: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color?: string;
  small?: boolean;
};

export function StatCard({ label, value, icon, color = Colors.blue, small = false }: StatCardProps) {
  return (
    <View style={[styles.card, small && styles.cardSmall]}>
      <View style={[styles.iconWrap, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={small ? 16 : 20} color={color} />
      </View>
      <Text style={[styles.value, small && styles.valueSmall]}>{value}</Text>
      <Text style={[styles.label, small && styles.labelSmall]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardSmall: {
    padding: 10,
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: "Inter_700Bold",
    fontSize: 20,
    color: Colors.navy,
    letterSpacing: -0.5,
  },
  valueSmall: {
    fontSize: 16,
  },
  label: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.midGray,
    textAlign: "center",
  },
  labelSmall: {
    fontSize: 10,
  },
});
