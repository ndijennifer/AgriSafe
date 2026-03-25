import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGrades } from "@/context/GradeContext";
import { StatCard } from "@/components/StatCard";
import { GradeBar } from "@/components/GradeBar";
import { exportGradeSheet, exportGradeSheetAsCsv } from "@/utils/excelExporter";

type TabType = "overview" | "students" | "breakdown";

export default function SheetScreen() {
  const insets = useSafeAreaInsets();
  const { activeSheet } = useGrades();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [exporting, setExporting] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  if (!activeSheet) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <TouchableOpacity
          style={[styles.backBtn, { top: topPadding + 8 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={Colors.navy} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.center}>
          <Text style={styles.noSheet}>No sheet selected</Text>
        </View>
      </View>
    );
  }

  const sheet = activeSheet;

  const handleExport = (format: "xlsx" | "csv") => {
    Alert.alert(
      "Export Report",
      `Export "${sheet.title}" as ${format.toUpperCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Export",
          onPress: async () => {
            try {
              setExporting(true);
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (format === "xlsx") {
                await exportGradeSheet(sheet);
              } else {
                await exportGradeSheetAsCsv(sheet);
              }
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (err: any) {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert("Export Failed", err?.message ?? "Could not export file.");
            } finally {
              setExporting(false);
            }
          },
        },
      ]
    );
  };

  const sortedStudents = [...sheet.students].sort(
    (a, b) => b.average - a.average
  );

  const gradeDistribution = ["A", "B", "C", "D", "F"].map((grade) => ({
    grade,
    count: sheet.students.filter((s) => s.letterGrade === grade).length,
  }));

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.navy} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {sheet.title}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.exportBtn, exporting && { opacity: 0.6 }]}
          onPress={() => {
            if (!exporting) {
              Alert.alert("Export Format", "Choose export format:", [
                { text: "Cancel", style: "cancel" },
                { text: "Excel (.xlsx)", onPress: () => handleExport("xlsx") },
                { text: "CSV (.csv)", onPress: () => handleExport("csv") },
              ]);
            }
          }}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <Ionicons name="share-outline" size={16} color={Colors.white} />
              <Text style={styles.exportBtnText}>Export</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        {(["overview", "students", "breakdown"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab);
              Haptics.selectionAsync();
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              (Platform.OS === "web" ? 34 : insets.bottom) + 32,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "overview" && (
          <View style={styles.section}>
            <View style={styles.statsGrid}>
              <StatCard
                label="Students"
                value={sheet.students.length}
                icon="people-outline"
                color={Colors.blue}
              />
              <StatCard
                label="Class Avg"
                value={`${sheet.stats.classAverage}%`}
                icon="bar-chart-outline"
                color={Colors.primary}
              />
            </View>
            <View style={styles.statsGrid}>
              <StatCard
                label="Highest"
                value={`${sheet.stats.highest}%`}
                icon="trending-up-outline"
                color={Colors.success}
              />
              <StatCard
                label="Lowest"
                value={`${sheet.stats.lowest}%`}
                icon="trending-down-outline"
                color={Colors.warning}
              />
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
                <Text style={styles.cardTitle}>Pass Rate</Text>
              </View>
              <View style={styles.passRateContainer}>
                <View style={styles.passRateBar}>
                  <View
                    style={[
                      styles.passRateFill,
                      {
                        width: `${sheet.stats.passRate}%`,
                        backgroundColor:
                          sheet.stats.passRate >= 70
                            ? Colors.success
                            : sheet.stats.passRate >= 50
                            ? Colors.warning
                            : Colors.primary,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.passRateText}>
                  {sheet.stats.passRate}%
                </Text>
              </View>
              <View style={styles.passStats}>
                <View style={styles.passStatItem}>
                  <View style={[styles.dot, { backgroundColor: Colors.success }]} />
                  <Text style={styles.passStatLabel}>Passed</Text>
                  <Text style={styles.passStatValue}>
                    {sheet.students.filter((s) => s.passed).length}
                  </Text>
                </View>
                <View style={styles.passStatItem}>
                  <View style={[styles.dot, { backgroundColor: Colors.primary }]} />
                  <Text style={styles.passStatLabel}>Failed</Text>
                  <Text style={styles.passStatValue}>
                    {sheet.students.filter((s) => !s.passed).length}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="grid-outline" size={18} color={Colors.blue} />
                <Text style={styles.cardTitle}>Grade Distribution</Text>
              </View>
              <View style={styles.gradeDist}>
                {gradeDistribution.map(({ grade, count }) => {
                  const max = Math.max(...gradeDistribution.map((g) => g.count), 1);
                  const gradeColors: Record<string, string> = {
                    A: Colors.success,
                    B: Colors.blue,
                    C: Colors.warning,
                    D: "#F59E0B",
                    F: Colors.primary,
                  };
                  return (
                    <View key={grade} style={styles.gradeDistItem}>
                      <Text style={[styles.gradeDistLabel, { color: gradeColors[grade] }]}>
                        {grade}
                      </Text>
                      <View style={styles.gradeDistBar}>
                        <View
                          style={[
                            styles.gradeDistFill,
                            {
                              height: Math.max((count / max) * 80, count > 0 ? 4 : 0),
                              backgroundColor: gradeColors[grade],
                            },
                          ]}
                        />
                      </View>
                      <Text style={styles.gradeDistCount}>{count}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {activeTab === "students" && (
          <View style={styles.section}>
            <View style={styles.rankHeader}>
              <Text style={styles.rankTitle}>
                {sheet.students.length} Students — Ranked by Score
              </Text>
            </View>
            {sortedStudents.map((student, index) => (
              <View key={student.id} style={styles.studentCard}>
                <View style={styles.studentRank}>
                  <Text
                    style={[
                      styles.rankNumber,
                      index === 0 && { color: "#F59E0B" },
                      index === 1 && { color: Colors.midGray },
                      index === 2 && { color: "#CD7F32" },
                    ]}
                  >
                    #{index + 1}
                  </Text>
                </View>
                <View style={styles.studentInfo}>
                  <View style={styles.studentTop}>
                    <Text style={styles.studentName}>{student.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: student.passed
                            ? Colors.success + "18"
                            : Colors.primary + "18",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: student.passed ? Colors.success : Colors.primary },
                        ]}
                      >
                        {student.passed ? "PASS" : "FAIL"}
                      </Text>
                    </View>
                  </View>
                  <GradeBar
                    name=""
                    average={student.average}
                    letterGrade={student.letterGrade}
                    passed={student.passed}
                    index={index}
                  />
                  {sheet.columns.length > 1 && (
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      style={styles.scoresRow}
                    >
                      {sheet.columns.map((col) => (
                        <View key={col} style={styles.scoreChip}>
                          <Text style={styles.scoreChipLabel} numberOfLines={1}>
                            {col}
                          </Text>
                          <Text style={styles.scoreChipValue}>
                            {student.scores[col] ?? 0}
                          </Text>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === "breakdown" && (
          <View style={styles.section}>
            {sheet.columns.map((col) => {
              const colScores = sheet.students.map(
                (s) => s.scores[col] ?? 0
              );
              const avg =
                colScores.length > 0
                  ? colScores.reduce((a, b) => a + b, 0) / colScores.length
                  : 0;
              const high = colScores.length > 0 ? Math.max(...colScores) : 0;
              const low = colScores.length > 0 ? Math.min(...colScores) : 0;

              return (
                <View key={col} style={styles.breakdownCard}>
                  <View style={styles.breakdownHeader}>
                    <Ionicons name="clipboard-outline" size={16} color={Colors.blue} />
                    <Text style={styles.breakdownTitle}>{col}</Text>
                  </View>
                  <View style={styles.breakdownStats}>
                    <View style={styles.breakdownStat}>
                      <Text style={styles.breakdownStatVal}>
                        {Math.round(avg * 10) / 10}
                      </Text>
                      <Text style={styles.breakdownStatLabel}>Avg</Text>
                    </View>
                    <View style={styles.breakdownStat}>
                      <Text style={[styles.breakdownStatVal, { color: Colors.success }]}>
                        {high}
                      </Text>
                      <Text style={styles.breakdownStatLabel}>High</Text>
                    </View>
                    <View style={styles.breakdownStat}>
                      <Text style={[styles.breakdownStatVal, { color: Colors.primary }]}>
                        {low}
                      </Text>
                      <Text style={styles.breakdownStatLabel}>Low</Text>
                    </View>
                  </View>
                  <View style={styles.breakdownBarTrack}>
                    <View
                      style={[
                        styles.breakdownBarFill,
                        {
                          width: `${Math.min(avg, 100)}%`,
                          backgroundColor:
                            avg >= 70
                              ? Colors.success
                              : avg >= 50
                              ? Colors.warning
                              : Colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  noSheet: {
    fontFamily: "Inter_500Medium",
    fontSize: 16,
    color: Colors.midGray,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingRight: 8,
  },
  backText: {
    fontFamily: "Inter_500Medium",
    fontSize: 15,
    color: Colors.navy,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.navy,
    letterSpacing: -0.3,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: Colors.blue,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  exportBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.white,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: Colors.primary + "12",
  },
  tabText: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.midGray,
  },
  tabTextActive: {
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    gap: 12,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.navy,
  },
  passRateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  passRateBar: {
    flex: 1,
    height: 12,
    backgroundColor: Colors.lightGray,
    borderRadius: 6,
    overflow: "hidden",
  },
  passRateFill: {
    height: "100%",
    borderRadius: 6,
  },
  passRateText: {
    fontFamily: "Inter_700Bold",
    fontSize: 16,
    color: Colors.navy,
    width: 48,
    textAlign: "right",
  },
  passStats: {
    flexDirection: "row",
    gap: 20,
  },
  passStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  passStatLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 13,
    color: Colors.midGray,
  },
  passStatValue: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 13,
    color: Colors.navy,
  },
  gradeDist: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    height: 110,
    paddingHorizontal: 8,
  },
  gradeDistItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  gradeDistLabel: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  gradeDistBar: {
    width: 32,
    height: 80,
    justifyContent: "flex-end",
    backgroundColor: Colors.lightGray,
    borderRadius: 6,
    overflow: "hidden",
  },
  gradeDistFill: {
    width: "100%",
    borderRadius: 6,
  },
  gradeDistCount: {
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    color: Colors.midGray,
  },
  rankHeader: {
    marginBottom: 4,
  },
  rankTitle: {
    fontFamily: "Inter_500Medium",
    fontSize: 13,
    color: Colors.midGray,
  },
  studentCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  studentRank: {
    width: 32,
    alignItems: "center",
    paddingTop: 2,
  },
  rankNumber: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.midGray,
  },
  studentInfo: {
    flex: 1,
    gap: 4,
  },
  studentTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  studentName: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.navy,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontFamily: "Inter_700Bold",
    fontSize: 10,
    letterSpacing: 0.5,
  },
  scoresRow: {
    marginTop: 4,
  },
  scoreChip: {
    backgroundColor: Colors.blue + "12",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    alignItems: "center",
    minWidth: 60,
  },
  scoreChipLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 10,
    color: Colors.midGray,
  },
  scoreChipValue: {
    fontFamily: "Inter_700Bold",
    fontSize: 13,
    color: Colors.blue,
  },
  breakdownCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
  },
  breakdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  breakdownTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 15,
    color: Colors.navy,
    flex: 1,
  },
  breakdownStats: {
    flexDirection: "row",
    gap: 16,
  },
  breakdownStat: {
    alignItems: "center",
    gap: 2,
  },
  breakdownStatVal: {
    fontFamily: "Inter_700Bold",
    fontSize: 18,
    color: Colors.navy,
  },
  breakdownStatLabel: {
    fontFamily: "Inter_400Regular",
    fontSize: 11,
    color: Colors.midGray,
  },
  breakdownBarTrack: {
    height: 8,
    backgroundColor: Colors.lightGray,
    borderRadius: 4,
    overflow: "hidden",
  },
  breakdownBarFill: {
    height: "100%",
    borderRadius: 4,
  },
});
