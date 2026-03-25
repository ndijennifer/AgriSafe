import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
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
import { SheetCard } from "@/components/SheetCard";
import { EmptyState } from "@/components/EmptyState";
import { StatCard } from "@/components/StatCard";
import { useGrades } from "@/context/GradeContext";
import { pickAndParseExcel } from "@/utils/excelParser";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { sheets, addSheet, deleteSheet, setActiveSheet, isLoading } = useGrades();
  const [importing, setImporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleImport = async () => {
    try {
      setImporting(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const sheet = await pickAndParseExcel();
      if (sheet) {
        addSheet(sheet);
        setActiveSheet(sheet);
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push("/sheet");
      }
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Import Failed", err?.message ?? "Could not read the file. Please ensure it is a valid Excel file with a Name column.");
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      "Delete Sheet",
      `Remove "${title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            deleteSheet(id);
          },
        },
      ]
    );
  };

  const handleViewSheet = (id: string) => {
    const sheet = sheets.find((s) => s.id === id);
    if (sheet) {
      setActiveSheet(sheet);
      router.push("/sheet");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const totalStudents = sheets.reduce((acc, s) => acc + s.students.length, 0);
  const avgPassRate =
    sheets.length > 0
      ? sheets.reduce((acc, s) => acc + s.stats.passRate, 0) / sheets.length
      : 0;
  const avgScore =
    sheets.length > 0
      ? sheets.reduce((acc, s) => acc + s.stats.classAverage, 0) / sheets.length
      : 0;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      <View style={styles.header}>
        <Logo size="medium" />
        <TouchableOpacity
          style={[styles.importBtn, importing && styles.importBtnDisabled]}
          onPress={handleImport}
          disabled={importing}
          activeOpacity={0.8}
        >
          {importing ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons name="add" size={20} color={Colors.white} />
          )}
          <Text style={styles.importBtnText}>
            {importing ? "Importing..." : "Import"}
          </Text>
        </TouchableOpacity>
      </View>

      {sheets.length > 0 && (
        <View style={styles.statsRow}>
          <StatCard
            label="Total Sheets"
            value={sheets.length}
            icon="document-text-outline"
            color={Colors.primary}
          />
          <StatCard
            label="Students"
            value={totalStudents}
            icon="people-outline"
            color={Colors.blue}
          />
          <StatCard
            label="Avg Pass"
            value={`${Math.round(avgPassRate)}%`}
            icon="checkmark-done-outline"
            color={Colors.success}
          />
        </View>
      )}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Platform.OS === "web" ? 100 : insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {sheets.length === 0 ? (
          <EmptyState
            icon="document-text-outline"
            title="No Grade Sheets Yet"
            subtitle="Import an Excel file to calculate and analyze student grades instantly."
          />
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Sheets</Text>
              <Text style={styles.sectionCount}>{sheets.length}</Text>
            </View>
            {sheets.map((sheet) => (
              <SheetCard
                key={sheet.id}
                sheet={sheet}
                onPress={() => handleViewSheet(sheet.id)}
                onDelete={() => handleDelete(sheet.id, sheet.title)}
              />
            ))}
          </>
        )}
      </ScrollView>

      {sheets.length === 0 && (
        <View style={[styles.fabContainer, { bottom: (Platform.OS === "web" ? 34 : insets.bottom) + 16 }]}>
          <TouchableOpacity
            style={styles.fab}
            onPress={handleImport}
            disabled={importing}
            activeOpacity={0.85}
          >
            {importing ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Ionicons name="cloud-upload-outline" size={24} color={Colors.white} />
            )}
            <Text style={styles.fabText}>Import Excel File</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  importBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  importBtnDisabled: {
    opacity: 0.6,
  },
  importBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.white,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    flexGrow: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.navy,
  },
  sectionCount: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 14,
    color: Colors.white,
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: "hidden",
  },
  fabContainer: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  fab: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 16,
    color: Colors.white,
  },
});
