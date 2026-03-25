import React from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { Logo } from "@/components/Logo";
import { EmptyState } from "@/components/EmptyState";
import { useGrades, computeOverallAverage, determineGrade } from "@/context/GradeContext";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { records, deleteRecord, setActiveRecord, isLoading } = useGrades();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleNew = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveRecord(null);
    router.push("/entry");
  };

  const handleView = (id: string) => {
    const r = records.find((x) => x.id === id);
    if (r) { setActiveRecord(r); router.push("/results"); }
  };

  const handleEdit = (id: string) => {
    const r = records.find((x) => x.id === id);
    if (r) { setActiveRecord(r); router.push("/entry"); }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Record", `Remove ${name}'s record? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          deleteRecord(id);
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: Colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Logo size="medium" />
        <TouchableOpacity style={styles.newBtn} onPress={handleNew} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={Colors.white} />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Summary bar */}
      {records.length > 0 && (
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>{records.length}</Text>
            <Text style={styles.summaryLabel}>Students</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryVal}>
              {records.reduce((a, r) => a + r.courses.length, 0)}
            </Text>
            <Text style={styles.summaryLabel}>Courses</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: Colors.success }]}>
              {records.filter((r) => {
                const avg = computeOverallAverage(r.courses);
                return determineGrade(avg) !== "F";
              }).length}
            </Text>
            <Text style={styles.summaryLabel}>Passing</Text>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 80, flexGrow: records.length === 0 ? 1 : undefined },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {records.length === 0 ? (
          <EmptyState
            icon="school-outline"
            title="No Student Records"
            subtitle="Tap 'New' to add a student, enter their courses and calculate grades."
          />
        ) : (
          <>
            <Text style={styles.sectionLabel}>Recent Records</Text>
            {records.map((record) => {
              const overall = computeOverallAverage(record.courses);
              const grade = determineGrade(overall);
              const passed = grade !== "F";
              return (
                <TouchableOpacity
                  key={record.id}
                  style={styles.card}
                  onPress={() => handleView(record.id)}
                  activeOpacity={0.75}
                >
                  <View style={styles.cardLeft}>
                    <View style={[styles.gradeCircle, { backgroundColor: passed ? Colors.success + "18" : Colors.primary + "18" }]}>
                      <Text style={[styles.gradeCircleText, { color: passed ? Colors.success : Colors.primary }]}>
                        {grade}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.cardName}>{record.studentName}</Text>
                    <Text style={styles.cardId}>ID: {record.studentId}</Text>
                    <View style={styles.cardMeta}>
                      <Ionicons name="book-outline" size={12} color={Colors.midGray} />
                      <Text style={styles.cardMetaText}>{record.courses.length} course{record.courses.length !== 1 ? "s" : ""}</Text>
                      <Text style={styles.cardDot}>·</Text>
                      <Text style={styles.cardMetaText}>Avg {overall}%</Text>
                      <Text style={styles.cardDot}>·</Text>
                      <Text style={styles.cardMetaText}>{formatDate(record.createdAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => handleEdit(record.id)} style={styles.iconBtn}>
                      <Ionicons name="create-outline" size={18} color={Colors.blue} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(record.id, record.studentName)} style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={18} color={Colors.midGray} />
                    </TouchableOpacity>
                    <Ionicons name="chevron-forward" size={16} color={Colors.border} />
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* FAB for empty state */}
      {records.length === 0 && (
        <View style={[styles.fabWrap, { bottom: (Platform.OS === "web" ? 34 : insets.bottom) + 16 }]}>
          <TouchableOpacity style={styles.fab} onPress={handleNew} activeOpacity={0.85}>
            <Ionicons name="person-add-outline" size={22} color={Colors.white} />
            <Text style={styles.fabText}>Add Student</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  newBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10,
  },
  newBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.white },
  summaryBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    backgroundColor: Colors.white, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  summaryItem: { alignItems: "center", flex: 1 },
  summaryVal: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.navy },
  summaryLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.midGray, marginTop: 2 },
  summaryDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.midGray,
    letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 10,
  },
  card: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.card, borderRadius: 14,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  cardLeft: { marginRight: 12 },
  gradeCircle: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: "center", justifyContent: "center",
  },
  gradeCircleText: { fontFamily: "Inter_700Bold", fontSize: 18 },
  cardBody: { flex: 1, gap: 3 },
  cardName: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.navy },
  cardId: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.midGray },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  cardMetaText: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.midGray },
  cardDot: { color: Colors.border, fontSize: 11 },
  cardActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: { padding: 4 },
  fabWrap: { position: "absolute", left: 20, right: 20 },
  fab: {
    backgroundColor: Colors.primary, borderRadius: 16,
    paddingVertical: 16, flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
  },
  fabText: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.white },
});
