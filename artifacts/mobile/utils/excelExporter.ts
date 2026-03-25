import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { utils, write } from "xlsx";
import {
  StudentRecord,
  calculateAverage,
  determineGrade,
  getGradeRemarks,
  computeOverallAverage,
} from "@/context/GradeContext";

export async function exportStudentRecord(record: StudentRecord): Promise<void> {
  const headers = ["Course Name", "CA Mark", "Exam Mark", "Average", "Grade", "Remarks", "Status"];

  const rows = record.courses.map((course) => {
    const avg = calculateAverage(course.ca, course.exam);
    const grade = determineGrade(avg);
    return [
      course.name,
      course.ca,
      course.exam,
      avg,
      grade,
      getGradeRemarks(grade),
      grade !== "F" ? "PASS" : "FAIL",
    ];
  });

  const overallAvg = computeOverallAverage(record.courses);
  const overallGrade = determineGrade(overallAvg);

  const summaryRows = [
    [],
    ["─── SUMMARY ───"],
    ["Student Name", record.studentName],
    ["Student ID", record.studentId],
    ["Date", new Date(record.createdAt).toLocaleDateString()],
    ["Overall Average", overallAvg],
    ["Overall Grade", overallGrade],
    ["Remarks", getGradeRemarks(overallGrade)],
    ["Courses Passed", record.courses.filter((c) => determineGrade(calculateAverage(c.ca, c.exam)) !== "F").length],
    ["Courses Failed", record.courses.filter((c) => determineGrade(calculateAverage(c.ca, c.exam)) === "F").length],
  ];

  const allRows = [
    [`Student Grade Report — ${record.studentName} (${record.studentId})`],
    [],
    headers,
    ...rows,
    ...summaryRows,
  ];

  const ws = utils.aoa_to_sheet(allRows);
  ws["!cols"] = [{ wch: 22 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 16 }, { wch: 8 }];

  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Grade Report");

  const wbout = write(wb, { type: "base64", bookType: "xlsx" });
  const safeName = record.studentName.replace(/[^a-zA-Z0-9]/g, "_");
  const fileName = `${safeName}_${record.studentId}_grades.xlsx`;
  const fileUri = `${FileSystem.documentDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, wbout, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: `Export ${record.studentName}'s Grade Report`,
    });
  } else {
    throw new Error("Sharing is not available on this device.");
  }
}
