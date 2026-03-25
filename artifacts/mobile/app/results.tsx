import React, { useState } from "react";
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
import {
  useGrades,
  calculateAverage,
  determineGrade,
  getGradeRemarks,
  computeOverallAverage,
  findBestCourse,
  findWorstCourse,
  filterPassingCourses,
  filterFailingCourses,
} from "@/context/GradeContext";
import { exportStudentRecord } from "@/utils/excelExporter";

function gradeColor(grade: string): string {
  switch (grade) {
    case "A+": return "#059669";
    case "A":  return Colors.success;
    case "B+": return "#2563EB";
    case "B":  return Colors.blue;
    case "C+": return "#7C3AED";
    case "C":  return Colors.warning;
    case "D+": return "#F59E0B";
    case "D":  return "#D97706";
    default:   return Colors.primary;
  }
}

export default function ResultsScreen() {
  const insets = useSafeAreaInsets();
  const { activeRecord } = useGrades();
  const [exporting, setExporting] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (!activeRecord) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <View style={styles.center}>
          <Text style={styles.noRecord}>No record selected.</Text>
        </View>
      </View>
    );
  }

  const record = activeRecord;
  const overallAvg = computeOverallAverage(record.courses);
  const overallGrade = determineGrade(overallAvg);
  const overallRemarks = getGradeRemarks(overallGrade);
  const passed = overallGrade !== "F";
  const best = findBestCourse(record.courses);
  const worst = findWorstCourse(record.courses);
  const passingCourses = filterPassingCourses(record.courses);
  const failingCourses = filterFailingCourses(record.courses);

  const handleExport = () => {
    Alert.alert(
      "Export Grade Report",
      `Export ${record.studentName}'s grade report as Excel?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            try {
              setExporting(true);
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              await exportStudentRecord(record);
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err: any) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Export Failed", err?.message ?? "Could not export the file.");
            } finally {
              setExporting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.navy} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Results</Text>
        <TouchableOpacity
          style={[styles.exportBtn, exporting && { opacity: 0.6 }]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="share-outline" size={15} color={Colors.white} />
              <Text style={styles.exportBtnText}>Export</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Student profile card */}
        <View style={styles.profileCard}>
          <View style={[styles.overallBadge, { backgroundColor: passed ? Colors.success + "18" : Colors.primary + "18" }]}>
            <Text style={[styles.overallGrade, { color: passed ? Colors.success : Colors.primary }]}>
              {overallGrade}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{record.studentName}</Text>
            <Text style={styles.profileId}>ID: {record.studentId}</Text>
            <View style={styles.profileMeta}>
              <View style={[styles.statusPill, { backgroundColor: passed ? Colors.success + "18" : Colors.primary + "18" }]}>
                <Ionicons
                  name={passed ? "checkmark-circle" : "close-circle"}
                  size={13}
                  color={passed ? Colors.success : Colors.primary}
                />
                <Text style={[styles.statusText, { color: passed ? Colors.success : Colors.primary }]}>
                  {passed ? "Overall Pass" : "Overall Fail"}
                </Text>
              </View>
              <Text style={styles.profileRemarks}>{overallRemarks}</Text>
            </View>
          </View>
        </View>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{overallAvg}%</Text>
            <Text style={styles.statLbl}>Avg Score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.success }]}>{passingCourses.length}</Text>
            <Text style={styles.statLbl}>Passed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.primary }]}>{failingCourses.length}</Text>
            <Text style={styles.statLbl}>Failed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{record.courses.length}</Text>
            <Text style={styles.statLbl}>Courses</Text>
          </View>
        </View>

        {/* Grade Table */}
        <View style={styles.tableCard}>
          <View style={styles.tableCardHeader}>
            <Ionicons name="grid-outline" size={16} color={Colors.navy} />
            <Text style={styles.tableCardTitle}>Grade Table</Text>
          </View>

          {/* Table header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.th, { flex: 2 }]}>Course</Text>
            <Text style={[styles.th, styles.thCenter, { width: 46 }]}>CA</Text>
            <Text style={[styles.th, styles.thCenter, { width: 46 }]}>Exam</Text>
            <Text style={[styles.th, styles.thCenter, { width: 52 }]}>Avg</Text>
            <Text style={[styles.th, styles.thCenter, { width: 36 }]}>Grade</Text>
          </View>

          {/* Table rows */}
          {record.courses.map((course, index) => {
            const avg = calculateAverage(course.ca, course.exam);
            const grade = determineGrade(avg);
            const isBest = best?.id === course.id;
            const isWorst = worst?.id === course.id && record.courses.length > 1;
            const gc = gradeColor(grade);

            return (
              <View
                key={course.id}
                style={[
                  styles.tableRow,
                  index % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                  isBest && styles.tableRowBest,
                ]}
              >
                <View style={[styles.td, { flex: 2 }]}>
                  <Text style={styles.tdCourse} numberOfLines={1}>{course.name}</Text>
                  {isBest && (
                    <View style={styles.bestTag}>
                      <Ionicons name="trophy" size={9} color="#F59E0B" />
                      <Text style={styles.bestTagText}>Best</Text>
                    </View>
                  )}
                  {isWorst && (
                    <View style={[styles.bestTag, { backgroundColor: Colors.primary + "18" }]}>
                      <Text style={[styles.bestTagText, { color: Colors.primary }]}>Lowest</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.td, styles.tdCenter, { width: 46 }]}>{course.ca}</Text>
                <Text style={[styles.td, styles.tdCenter, { width: 46 }]}>{course.exam}</Text>
                <Text style={[styles.td, styles.tdCenter, { width: 52 }, { fontFamily: "Inter_600SemiBold", color: gc }]}>
                  {avg}%
                </Text>
                <View style={[styles.td, { width: 36, alignItems: "center" }]}>
                  <View style={[styles.gradePill, { backgroundColor: gc + "18" }]}>
                    <Text style={[styles.gradePillText, { color: gc }]}>{grade}</Text>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Table footer - overall */}
          <View style={styles.tableFooter}>
            <Text style={[styles.tfLabel, { flex: 2 }]}>Overall Average</Text>
            <Text style={[styles.tfVal, { width: 46 }]} />
            <Text style={[styles.tfVal, { width: 46 }]} />
            <Text style={[styles.tfVal, { width: 52, color: gradeColor(overallGrade) }]}>
              {overallAvg}%
            </Text>
            <View style={[styles.td, { width: 36, alignItems: "center" }]}>
              <View style={[styles.gradePill, { backgroundColor: gradeColor(overallGrade) + "18" }]}>
                <Text style={[styles.gradePillText, { color: gradeColor(overallGrade) }]}>
                  {overallGrade}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Remarks */}
        <View style={styles.remarksCard}>
          <View style={styles.remarksHeader}>
            <Ionicons name="document-text-outline" size={16} color={Colors.navy} />
            <Text style={styles.remarksTitle}>Remarks per Course</Text>
          </View>
          {record.courses.map((course) => {
            const avg = calculateAverage(course.ca, course.exam);
            const grade = determineGrade(avg);
            const remarks = getGradeRemarks(grade);
            return (
              <View key={course.id} style={styles.remarkRow}>
                <Text style={styles.remarkCourse} numberOfLines={1}>{course.name}</Text>
                <View style={[styles.remarkBadge, { backgroundColor: gradeColor(grade) + "14" }]}>
                  <Text style={[styles.remarkGrade, { color: gradeColor(grade) }]}>{grade}</Text>
                  <Text style={[styles.remarkLabel, { color: gradeColor(grade) }]}>{remarks}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Edit button */}
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={18} color={Colors.blue} />
          <Text style={styles.editBtnText}>Edit Courses</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  noRecord: { fontFamily: "Inter_500Medium", fontSize: 16, color: Colors.midGray },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.navy },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.navy },
  exportBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: Colors.blue, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    minWidth: 80, justifyContent: "center",
  },
  exportBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.white },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  profileCard: {
    backgroundColor: Colors.card, borderRadius: 16, padding: 16,
    flexDirection: "row", alignItems: "center", gap: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  overallBadge: {
    width: 64, height: 64, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  overallGrade: { fontFamily: "Inter_700Bold", fontSize: 30 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontFamily: "Inter_700Bold", fontSize: 17, color: Colors.navy, letterSpacing: -0.3 },
  profileId: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.midGray },
  profileMeta: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  statusPill: {
    flexDirection: "row", alignItems: "center", gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  statusText: { fontFamily: "Inter_600SemiBold", fontSize: 12 },
  profileRemarks: { fontFamily: "Inter_400Regular", fontSize: 12, color: Colors.midGray },

  statsRow: {
    backgroundColor: Colors.card, borderRadius: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-around",
    paddingVertical: 14, borderWidth: 1, borderColor: Colors.border,
  },
  statBox: { flex: 1, alignItems: "center", gap: 4 },
  statVal: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.navy },
  statLbl: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.midGray },
  statDivider: { width: 1, height: 32, backgroundColor: Colors.border },

  tableCard: {
    backgroundColor: Colors.card, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, overflow: "hidden",
  },
  tableCardHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  tableCardTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.navy },
  tableHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: Colors.navyMid,
  },
  th: { fontFamily: "Inter_600SemiBold", fontSize: 11, color: Colors.white, letterSpacing: 0.3 },
  thCenter: { textAlign: "center" },
  tableRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 },
  tableRowEven: { backgroundColor: Colors.white },
  tableRowOdd: { backgroundColor: Colors.offWhite },
  tableRowBest: { backgroundColor: Colors.success + "08" },
  td: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.navy },
  tdCenter: { textAlign: "center" },
  tdCourse: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.navy },
  bestTag: {
    flexDirection: "row", alignItems: "center", gap: 2,
    backgroundColor: "#FEF9C3", paddingHorizontal: 5, paddingVertical: 1,
    borderRadius: 4, alignSelf: "flex-start", marginTop: 2,
  },
  bestTagText: { fontFamily: "Inter_600SemiBold", fontSize: 9, color: "#B45309" },
  gradePill: {
    paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, alignItems: "center", minWidth: 32,
  },
  gradePillText: { fontFamily: "Inter_700Bold", fontSize: 11, textAlign: "center" },
  tableFooter: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 10,
    backgroundColor: Colors.navy + "08",
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  tfLabel: { fontFamily: "Inter_600SemiBold", fontSize: 13, color: Colors.navy },
  tfVal: { fontFamily: "Inter_700Bold", fontSize: 13, color: Colors.navy, textAlign: "center" },

  remarksCard: {
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  remarksHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  remarksTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.navy },
  remarkRow: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", gap: 8,
    paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.lightGray,
  },
  remarkCourse: {
    fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.navy, flex: 1,
  },
  remarkBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8,
  },
  remarkGrade: { fontFamily: "Inter_700Bold", fontSize: 14 },
  remarkLabel: { fontFamily: "Inter_500Medium", fontSize: 12 },

  editBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 12,
    borderWidth: 1.5, borderColor: Colors.blue,
    backgroundColor: Colors.blue + "0A",
  },
  editBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.blue },
});
