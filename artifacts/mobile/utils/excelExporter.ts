import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { utils, write } from "xlsx";
import { GradeSheet } from "@/context/GradeContext";

export async function exportGradeSheet(sheet: GradeSheet): Promise<void> {
  const headers = [
    "Student Name",
    ...sheet.columns,
    "Total",
    "Average",
    "Grade",
    "Status",
  ];

  const rows = sheet.students.map((student) => {
    const scoreValues = sheet.columns.map((col) => student.scores[col] ?? 0);
    return [
      student.name,
      ...scoreValues,
      student.total,
      student.average,
      student.letterGrade,
      student.passed ? "PASS" : "FAIL",
    ];
  });

  const summaryRows = [
    [],
    ["--- Class Statistics ---"],
    ["Class Average", sheet.stats.classAverage],
    ["Highest Score", sheet.stats.highest],
    ["Lowest Score", sheet.stats.lowest],
    ["Pass Rate", `${sheet.stats.passRate}%`],
    ["Total Students", sheet.students.length],
    ["Passed", sheet.students.filter((s) => s.passed).length],
    ["Failed", sheet.students.filter((s) => !s.passed).length],
  ];

  const allRows = [headers, ...rows, ...summaryRows];

  const ws = utils.aoa_to_sheet(allRows);

  ws["!cols"] = [
    { wch: 25 },
    ...sheet.columns.map(() => ({ wch: 12 })),
    { wch: 10 },
    { wch: 10 },
    { wch: 8 },
    { wch: 8 },
  ];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Grade Report");

  const wbout = write(wb, { type: "base64", bookType: "xlsx" });

  const fileName = `${sheet.title}_report.xlsx`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: `Share ${sheet.title} Report`,
    });
  } else {
    throw new Error("Sharing is not available on this device.");
  }
}

export async function exportGradeSheetAsCsv(sheet: GradeSheet): Promise<void> {
  const headers = [
    "Student Name",
    ...sheet.columns,
    "Total",
    "Average",
    "Grade",
    "Status",
  ];

  const rows = sheet.students.map((student) => {
    const scoreValues = sheet.columns.map((col) => student.scores[col] ?? 0);
    return [
      student.name,
      ...scoreValues,
      student.total,
      student.average,
      student.letterGrade,
      student.passed ? "PASS" : "FAIL",
    ];
  });

  const csvLines = [headers, ...rows].map((row) =>
    row
      .map((cell) =>
        typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell
      )
      .join(",")
  );

  csvLines.push("");
  csvLines.push("Class Statistics");
  csvLines.push(`Class Average,${sheet.stats.classAverage}`);
  csvLines.push(`Highest Score,${sheet.stats.highest}`);
  csvLines.push(`Lowest Score,${sheet.stats.lowest}`);
  csvLines.push(`Pass Rate,${sheet.stats.passRate}%`);

  const csvContent = csvLines.join("\n");
  const fileName = `${sheet.title}_report.csv`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "text/csv",
      dialogTitle: `Share ${sheet.title} Report`,
    });
  } else {
    throw new Error("Sharing is not available on this device.");
  }
}
