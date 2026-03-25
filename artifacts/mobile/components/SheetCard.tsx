import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { GradeSheet } from "@/context/GradeContext";

type SheetCardProps = {
  sheet: GradeSheet;
  onPress: () => void;
  onDelete: () => void;
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getPassRateColor(rate: number): string {
  if (rate >= 80) return Colors.success;
  if (rate >= 60) return Colors.warning;
  return Colors.primary;
}

export function SheetCard({ sheet, onPress, onDelete }: SheetCardProps) {
  const passColor = getPassRateColor(sheet.stats.passRate);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.top}>
        <View style={styles.iconWrap}>
          <Ionicons name="document-text" size={22} color={Colors.primary} />
        </View>
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {sheet.title}
          </Text>
          <Text style={styles.date}>{formatDate(sheet.createdAt)}</Text>
        </View>
        <TouchableOpacity
          onPress={onDelete}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.deleteBtn}
        >
          <Ionicons name="trash-outline" size={16} color={Colors.midGray} />
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="people-outline" size={14} color={Colors.blue} />
          <Text style={styles.statValue}>{sheet.students.length}</Text>
          <Text style={styles.statLabel}>Students</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="bar-chart-outline" size={14} color={Colors.blue} />
          <Text style={styles.statValue}>{sheet.stats.classAverage}%</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle-outline" size={14} color={passColor} />
          <Text style={[styles.statValue, { color: passColor }]}>
            {sheet.stats.passRate}%
          </Text>
          <Text style={styles.statLabel}>Pass Rate</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.columns}>
          {sheet.columns.length} assessment{sheet.columns.length !== 1 ? "s" : ""}
        </Text>
        <View style={styles.arrowWrap}>
          <Text style={styles.viewText}>View</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 12,
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.navy,
    letterSpacing: -0.2,
  },
  date: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.midGray,
  },
  deleteBtn: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGray,
    marginVertical: 12,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  statValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    color: Colors.navy,
  },
  statLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.midGray,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
  },
  columns: {
    fontFamily: "Inter_400Regular",
    fontSize: 12,
    color: Colors.midGray,
  },
  arrowWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.primary,
  },
});
