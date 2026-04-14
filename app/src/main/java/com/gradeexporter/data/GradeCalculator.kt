package com.gradeexporter.data

import java.util.UUID

// ─── Data Types ───────────────────────────────────────────────────────────────

data class Course(
    val id: String = UUID.randomUUID().toString(),
    val name: String,
    val ca: Double,
    val exam: Double
)

data class CourseResult(
    val average: Double,
    val grade: String,
    val remarks: String,
    val passed: Boolean
)

data class StudentRecord(
    val id: String = UUID.randomUUID().toString(),
    val studentName: String,
    val studentId: String,
    val createdAt: String = System.currentTimeMillis().toString(),
    val courses: List<Course> = emptyList()
)

// ─── Grade Calculation Logic (Exercise 1) ────────────────────────────────────

object GradeCalculator {
    fun calculateAverage(ca: Double, exam: Double): Double {
        return Math.round(((ca + exam) / 2) * 10) / 10.0
    }

    fun determineGrade(average: Double): String {
        return when {
            average >= 90 -> "A+"
            average >= 80 -> "A"
            average >= 70 -> "B+"
            average >= 65 -> "B"
            average >= 55 -> "C+"
            average >= 50 -> "C"
            average >= 45 -> "D+"
            average >= 35 -> "D"
            else -> "F"
        }
    }

    fun getGradeRemarks(grade: String): String {
        return when (grade) {
            "A+" -> "Excellent"
            "A"  -> "Very Good"
            "B+" -> "Good"
            "B"  -> "Above Average"
            "C+" -> "Average"
            "C"  -> "Satisfactory"
            "D+" -> "Marginal Pass"
            "D"  -> "Pass"
            else -> "Fail"
        }
    }

    fun isPassing(grade: String): Boolean {
        return grade != "F"
    }

    // Exercise 2: Higher-order functions
    fun computeCourseAverages(courses: List<Course>): List<Double> {
        return courses.map { calculateAverage(it.ca, it.exam) }
    }

    fun findBestCourse(courses: List<Course>): Course? {
        if (courses.isEmpty()) return null
        return courses.maxByOrNull { calculateAverage(it.ca, it.exam) }
    }

    fun findWorstCourse(courses: List<Course>): Course? {
        if (courses.isEmpty()) return null
        return courses.minByOrNull { calculateAverage(it.ca, it.exam) }
    }

    fun computeOverallAverage(courses: List<Course>): Double {
        if (courses.isEmpty()) return 0.0
        val total = courses.sumOf { calculateAverage(it.ca, it.exam) }
        return Math.round((total / courses.size) * 10) / 10.0
    }

    fun filterPassingCourses(courses: List<Course>): List<Course> {
        return courses.filter { isPassing(determineGrade(calculateAverage(it.ca, it.exam))) }
    }

    fun filterFailingCourses(courses: List<Course>): List<Course> {
        return courses.filter { !isPassing(determineGrade(calculateAverage(it.ca, it.exam))) }
    }

    // Exercise 3: OOP - compute result
    fun computeResult(ca: Double, exam: Double): CourseResult {
        val average = calculateAverage(ca, exam)
        val grade = determineGrade(average)
        return CourseResult(
            average = average,
            grade = grade,
            remarks = getGradeRemarks(grade),
            passed = isPassing(grade)
        )
    }
}