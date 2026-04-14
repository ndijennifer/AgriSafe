package com.gradeexporter.utils

import android.content.Context
import android.os.Build
import android.os.Environment
import android.util.Log
import androidx.core.content.ContextCompat
import android.content.pm.PackageManager
import androidx.core.app.ActivityCompat
import com.gradeexporter.data.Course
import com.gradeexporter.data.GradeCalculator
import com.gradeexporter.data.StudentRecord
import java.io.File
import java.util.UUID

private const val TAG = "ExportUtils"
private const val GRADES_FILENAME = "grades.csv"

fun hasStoragePermission(context: Context): Boolean {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        Environment.isExternalStorageManager()
    } else {
        ContextCompat.checkSelfPermission(
            context,
            android.Manifest.permission.WRITE_EXTERNAL_STORAGE
        ) == PackageManager.PERMISSION_GRANTED
    }
}

fun getStorageDirectory(context: Context): File {
    return when {
        // Android 13+ and scoped storage
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU -> {
            File(context.getExternalFilesDir(null), "exports").also { it.mkdirs() }
        }
        // Android 11-12 with scoped storage
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.R -> {
            File(context.getExternalFilesDir(null), "exports").also { it.mkdirs() }
        }
        // Android 10 (Q)
        Build.VERSION.SDK_INT == Build.VERSION_CODES.Q -> {
            File(context.getExternalFilesDir(null), "exports").also { it.mkdirs() }
        }
        // Android 6-9
        else -> {
            if (Environment.getExternalStorageState() == Environment.MEDIA_MOUNTED) {
                File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOCUMENTS), "GradeExporter").also { it.mkdirs() }
            } else {
                context.getExternalFilesDir(null) ?: context.filesDir
            }
        }
    }
}

fun exportToCSV(context: Context, records: List<StudentRecord>): String {
    try {
        val exportDir = getStorageDirectory(context)
        exportDir.mkdirs()
        
        val file = File(exportDir, GRADES_FILENAME)

        fun String.escapeCsv(): String {
            return this.replace("\"", "\"\"")
        }

        val builder = StringBuilder()
        builder.append("Name,StudentID,Course,CA,Exam,Average,Grade\n")

        records.forEach { student ->
            student.courses.forEach { course ->
                val ca = course.ca
                val exam = course.exam
                val avg = GradeCalculator.calculateAverage(ca, exam)
                val grade = GradeCalculator.determineGrade(avg)
                val nameValue = student.studentName.escapeCsv()
                val idValue = student.studentId.escapeCsv()
                val courseValue = course.name.escapeCsv()
                builder.append("\"").append(nameValue).append("\",\"")
                    .append(idValue).append("\",\"")
                    .append(courseValue).append("\",").append(ca).append(',')
                    .append(exam).append(',').append(String.format("%.1f", avg)).append(',')
                    .append(grade).append("\n")
            }
        }

        file.writeText(builder.toString(), Charsets.UTF_8)
        Log.d(TAG, "CSV exported successfully to: ${file.absolutePath}")
        Log.d(TAG, "File size: ${file.length()} bytes")
        Log.d(TAG, "File exists: ${file.exists()}")
        return file.absolutePath
    } catch (e: Exception) {
        Log.e(TAG, "Failed to export CSV: ${e.message}", e)
        throw RuntimeException("Failed to export CSV: ${e.message}", e)
    }
}

fun importFromCSV(file: File): List<StudentRecord> {
    try {
        if (!file.exists()) {
            throw RuntimeException("File not found: ${file.absolutePath}")
        }

        Log.d(TAG, "Importing CSV from: ${file.absolutePath}")
        val studentsMap = mutableMapOf<String, Pair<Pair<String, String>, MutableList<Course>>>()
        val lines = file.readLines(Charsets.UTF_8)

        if (lines.isEmpty()) {
            throw RuntimeException("CSV file is empty")
        }

        // Skip header line
        lines.drop(1).forEach { line ->
            if (line.isNotBlank()) {
                try {
                    val parts = parseCSVLine(line)
                    
                    if (parts.size >= 6) {
                        val studentName = parts[0].unescapeCSV()
                        val studentId = parts[1].unescapeCSV()
                        val courseName = parts[2].unescapeCSV()
                        val ca = parts[3].toDoubleOrNull() ?: 0.0
                        val exam = parts[4].toDoubleOrNull() ?: 0.0
                        
                        val course = Course(name = courseName, ca = ca, exam = exam)
                        val key = "$studentName|$studentId"
                        
                        if (!studentsMap.containsKey(key)) {
                            studentsMap[key] = Pair(Pair(studentName, studentId), mutableListOf())
                        }
                        studentsMap[key]?.second?.add(course)
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Skipping malformed line: $line", e)
                }
            }
        }

        val records = studentsMap.map { (_, pair) ->
            val (nameAndId, courses) = pair
            val (studentName, studentId) = nameAndId
            StudentRecord(
                studentName = studentName,
                studentId = studentId,
                courses = courses
            )
        }
        
        Log.d(TAG, "Successfully imported ${records.size} student records with ${records.sumOf { it.courses.size }} courses")
        return records
    } catch (e: Exception) {
        Log.e(TAG, "Failed to import CSV: ${e.message}", e)
        throw RuntimeException("Failed to import CSV: ${e.message}", e)
    }
}

private fun parseCSVLine(line: String): List<String> {
    val result = mutableListOf<String>()
    var current = StringBuilder()
    var inQuotes = false
    var i = 0
    
    while (i < line.length) {
        val char = line[i]
        when {
            char == '"' && (i + 1 < line.length && line[i + 1] == '"') -> {
                // Handle escaped quote
                current.append('"')
                i++
            }
            char == '"' -> {
                inQuotes = !inQuotes
            }
            char == ',' && !inQuotes -> {
                result.add(current.toString().trim())
                current = StringBuilder()
            }
            else -> {
                current.append(char)
            }
        }
        i++
    }
    result.add(current.toString().trim())
    return result
}

private fun String.unescapeCSV(): String {
    return this.replace("\"\"", "\"").trim('"')
}
