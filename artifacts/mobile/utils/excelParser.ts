import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { read, utils } from "xlsx";
import {
  GradeSheet,
  StudentGrade,
  calculateLetterGrade,
} from "@/context/GradeContext";

export async function pickAndParseExcel(): Promise<GradeSheet | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "*/*",
    ],
    copyToCacheDirectory: true,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  const fileUri = asset.uri;
  const fileName = asset.name ?? "Imported Sheet";

  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const workbook = read(base64, { type: "base64" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rawData: string[][] = utils.sheet_to_json(worksheet, {
    header: 1,
    defval: "",
  }) as string[][];

  if (rawData.length < 2) {
    throw new Error(
      "The Excel file must have at least a header row and one data row."
    );
  }

  const headers = rawData[0].map((h) => String(h ?? "").trim());

  const nameColIndex = headers.findIndex(
    (h) =>
      h.toLowerCase().includes("name") ||
      h.toLowerCase().includes("student") ||
      h.toLowerCase().includes("id")
  );

  if (nameColIndex === -1) {
    throw new Error(
      'Could not find a "Name" or "Student" column. Please ensure the first column contains student names.'
    );
  }

  const scoreColumns = headers.filter((_, i) => i !== nameColIndex);
  const passingScore = 60;

  const students: StudentGrade[] = [];

  for (let i = 1; i < rawData.length; i++) {
    const row = rawData[i];
    const name = String(row[nameColIndex] ?? "").trim();
    if (!name) continue;

    const scores: Record<string, number> = {};
    let sum = 0;
    let count = 0;

    scoreColumns.forEach((col, j) => {
      const colIndex = headers.indexOf(col);
      const raw = row[colIndex];
      const val = typeof raw === "number" ? raw : parseFloat(String(raw ?? "0"));
      const score = isNaN(val) ? 0 : val;
      scores[col] = score;
      sum += score;
      count++;
    });

    const total = sum;
    const average = count > 0 ? sum / count : 0;
    const percentage = average;
    const letterGrade = calculateLetterGrade(percentage);

    students.push({
      id: `${Date.now()}_${i}`,
      name,
      scores,
      total: Math.round(total * 10) / 10,
      average: Math.round(average * 10) / 10,
      letterGrade,
      passed: percentage >= passingScore,
    });
  }

  const averages = students.map((s) => s.average);
  const classAverage =
    averages.length > 0
      ? averages.reduce((a, b) => a + b, 0) / averages.length
      : 0;
  const highest = averages.length > 0 ? Math.max(...averages) : 0;
  const lowest = averages.length > 0 ? Math.min(...averages) : 0;
  const passRate =
    students.length > 0
      ? (students.filter((s) => s.passed).length / students.length) * 100
      : 0;

  const maxScore = scoreColumns.length > 0 ? 100 : 100;

  const sheet: GradeSheet = {
    id: `${Date.now()}`,
    title: fileName.replace(/\.(xlsx|xls|csv)$/i, ""),
    createdAt: new Date().toISOString(),
    columns: scoreColumns,
    students,
    maxScore,
    passingScore,
    stats: {
      classAverage: Math.round(classAverage * 10) / 10,
      highest: Math.round(highest * 10) / 10,
      lowest: Math.round(lowest * 10) / 10,
      passRate: Math.round(passRate * 10) / 10,
    },
  };

  return sheet;
}
