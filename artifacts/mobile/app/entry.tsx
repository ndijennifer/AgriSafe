import React, { useState, useEffect } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Colors from "@/constants/colors";
import { useGrades, Course } from "@/context/GradeContext";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 7);
}

type CourseInput = {
  id: string;
  name: string;
  ca: string;
  exam: string;
};

export default function EntryScreen() {
  const insets = useSafeAreaInsets();
  const { activeRecord, addRecord, updateRecord, setActiveRecord } = useGrades();
  const isEditing = !!activeRecord;

  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [courses, setCourses] = useState<CourseInput[]>([
    { id: generateId(), name: "", ca: "", exam: "" },
  ]);

  useEffect(() => {
    if (activeRecord) {
      setStudentName(activeRecord.studentName);
      setStudentId(activeRecord.studentId);
      setCourses(
        activeRecord.courses.map((c) => ({
          id: c.id,
          name: c.name,
          ca: String(c.ca),
          exam: String(c.exam),
        }))
      );
    }
  }, [activeRecord]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const addCourse = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCourses((prev) => [
      ...prev,
      { id: generateId(), name: "", ca: "", exam: "" },
    ]);
  };

  const removeCourse = (id: string) => {
    if (courses.length === 1) {
      Alert.alert("Cannot Remove", "At least one course is required.");
      return;
    }
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof CourseInput, value: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleCalculate = async () => {
    if (!studentName.trim()) {
      Alert.alert("Missing Info", "Please enter the student's name.");
      return;
    }
    if (!studentId.trim()) {
      Alert.alert("Missing Info", "Please enter the student ID.");
      return;
    }

    for (const c of courses) {
      if (!c.name.trim()) {
        Alert.alert("Missing Info", "Please enter a name for each course.");
        return;
      }
      const ca = parseFloat(c.ca);
      const exam = parseFloat(c.exam);
      if (isNaN(ca) || ca < 0 || ca > 100) {
        Alert.alert("Invalid Mark", `CA mark for "${c.name}" must be between 0 and 100.`);
        return;
      }
      if (isNaN(exam) || exam < 0 || exam > 100) {
        Alert.alert("Invalid Mark", `Exam mark for "${c.name}" must be between 0 and 100.`);
        return;
      }
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const parsedCourses: Course[] = courses.map((c) => ({
      id: c.id,
      name: c.name.trim(),
      ca: parseFloat(c.ca),
      exam: parseFloat(c.exam),
    }));

    if (isEditing && activeRecord) {
      const updated = {
        ...activeRecord,
        studentName: studentName.trim(),
        studentId: studentId.trim(),
        courses: parsedCourses,
      };
      updateRecord(updated);
      setActiveRecord(updated);
    } else {
      const newRecord = {
        id: generateId(),
        studentName: studentName.trim(),
        studentId: studentId.trim(),
        createdAt: new Date().toISOString(),
        courses: parsedCourses,
      };
      addRecord(newRecord);
      setActiveRecord(newRecord);
    }

    router.push("/results");
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: topPadding }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.navy} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditing ? "Edit Record" : "New Student"}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Student Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={16} color={Colors.primary} />
            <Text style={styles.sectionTitle}>Student Information</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Student Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. John Doe"
              placeholderTextColor={Colors.midGray}
              value={studentName}
              onChangeText={setStudentName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Student ID</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. STU-2024-001"
              placeholderTextColor={Colors.midGray}
              value={studentId}
              onChangeText={setStudentId}
              autoCapitalize="characters"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book-outline" size={16} color={Colors.blue} />
            <Text style={styles.sectionTitle}>Courses</Text>
            <View style={styles.courseCount}>
              <Text style={styles.courseCountText}>{courses.length}</Text>
            </View>
          </View>

          {/* Column labels */}
          <View style={styles.columnLabels}>
            <Text style={[styles.colLabel, { flex: 2 }]}>Course Name</Text>
            <Text style={[styles.colLabel, { width: 68 }]}>CA (0–100)</Text>
            <Text style={[styles.colLabel, { width: 68 }]}>Exam (0–100)</Text>
            <View style={{ width: 32 }} />
          </View>

          {courses.map((course, index) => (
            <View key={course.id} style={styles.courseRow}>
              <View style={styles.courseIndex}>
                <Text style={styles.courseIndexText}>{index + 1}</Text>
              </View>
              <TextInput
                style={[styles.input, styles.courseNameInput]}
                placeholder="Course name"
                placeholderTextColor={Colors.midGray}
                value={course.name}
                onChangeText={(v) => updateCourse(course.id, "name", v)}
                autoCapitalize="words"
              />
              <TextInput
                style={[styles.input, styles.markInput]}
                placeholder="0"
                placeholderTextColor={Colors.midGray}
                value={course.ca}
                onChangeText={(v) => updateCourse(course.id, "ca", v)}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={[styles.input, styles.markInput]}
                placeholder="0"
                placeholderTextColor={Colors.midGray}
                value={course.exam}
                onChangeText={(v) => updateCourse(course.id, "exam", v)}
                keyboardType="decimal-pad"
              />
              <TouchableOpacity
                onPress={() => removeCourse(course.id)}
                style={styles.removeBtn}
              >
                <Ionicons name="remove-circle" size={22} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={styles.addCourseBtn} onPress={addCourse} activeOpacity={0.8}>
            <Ionicons name="add-circle-outline" size={20} color={Colors.blue} />
            <Text style={styles.addCourseBtnText}>Add Course</Text>
          </TouchableOpacity>
        </View>

        {/* Grading scale info */}
        <View style={styles.scaleCard}>
          <View style={styles.scaleHeader}>
            <Ionicons name="information-circle-outline" size={15} color={Colors.midGray} />
            <Text style={styles.scaleTitle}>Grading Scale</Text>
          </View>
          <View style={styles.scaleRow}>
            {[
              { grade: "A+", range: "90–100", color: "#059669" },
              { grade: "A",  range: "80–89",  color: Colors.success },
              { grade: "B+", range: "70–79",  color: "#2563EB" },
              { grade: "B",  range: "65–69",  color: Colors.blue },
              { grade: "C+", range: "55–64",  color: "#7C3AED" },
              { grade: "C",  range: "50–54",  color: Colors.warning },
              { grade: "D+", range: "45–49",  color: "#F59E0B" },
              { grade: "D",  range: "35–44",  color: "#D97706" },
              { grade: "F",  range: "0–34",   color: Colors.primary },
            ].map((g) => (
              <View key={g.grade} style={styles.scaleItem}>
                <Text style={[styles.scaleGrade, { color: g.color }]}>{g.grade}</Text>
                <Text style={styles.scaleRange}>{g.range}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Calculate Button */}
      <View
        style={[
          styles.footer,
          { paddingBottom: (Platform.OS === "web" ? 34 : insets.bottom) + 12 },
        ]}
      >
        <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate} activeOpacity={0.85}>
          <Ionicons name="calculator-outline" size={20} color={Colors.white} />
          <Text style={styles.calcBtnText}>Calculate Grades</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { flexDirection: "row", alignItems: "center", gap: 2, width: 60 },
  backText: { fontFamily: "Inter_500Medium", fontSize: 15, color: Colors.navy },
  headerTitle: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.navy },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 16 },
  section: {
    backgroundColor: Colors.card, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: Colors.border,
    gap: 12,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontFamily: "Inter_600SemiBold", fontSize: 15, color: Colors.navy, flex: 1 },
  courseCount: {
    backgroundColor: Colors.blue + "18", paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 8,
  },
  courseCountText: { fontFamily: "Inter_700Bold", fontSize: 12, color: Colors.blue },
  field: { gap: 6 },
  label: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.navyLight },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.navy,
    backgroundColor: Colors.offWhite,
  },
  columnLabels: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingLeft: 30, paddingRight: 32,
  },
  colLabel: {
    fontFamily: "Inter_500Medium", fontSize: 11, color: Colors.midGray,
    textAlign: "center",
  },
  courseRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  courseIndex: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary + "18", alignItems: "center", justifyContent: "center",
  },
  courseIndexText: { fontFamily: "Inter_700Bold", fontSize: 11, color: Colors.primary },
  courseNameInput: { flex: 2, marginBottom: 0 },
  markInput: { width: 68, textAlign: "center", marginBottom: 0 },
  removeBtn: { width: 32, alignItems: "center" },
  addCourseBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 12, borderRadius: 10,
    borderWidth: 1.5, borderColor: Colors.blue, borderStyle: "dashed",
  },
  addCourseBtnText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.blue },
  scaleCard: {
    backgroundColor: Colors.card, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  scaleHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  scaleTitle: { fontFamily: "Inter_500Medium", fontSize: 13, color: Colors.midGray },
  scaleRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  scaleItem: { alignItems: "center", minWidth: 52, flex: 1 },
  scaleGrade: { fontFamily: "Inter_700Bold", fontSize: 15 },
  scaleRange: { fontFamily: "Inter_400Regular", fontSize: 9, color: Colors.midGray, marginTop: 1 },
  footer: {
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.border,
  },
  calcBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  calcBtnText: { fontFamily: "Inter_700Bold", fontSize: 16, color: Colors.white },
});
