package com.gradeexporter.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Cancel
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Create
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import android.widget.Toast
import com.gradeexporter.data.GradeCalculator
import com.gradeexporter.data.StudentRecord
import com.gradeexporter.ui.theme.Colors
import com.gradeexporter.utils.exportToCSV
import com.gradeexporter.viewmodel.GradeViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultsScreen(
    viewModel: GradeViewModel,
    record: StudentRecord,
    onNavigateBack: () -> Unit,
    onNavigateToEdit: (StudentRecord) -> Unit
) {
    val overallAvg = GradeCalculator.computeOverallAverage(record.courses)
    val overallGrade = GradeCalculator.determineGrade(overallAvg)
    val overallRemarks = GradeCalculator.getGradeRemarks(overallGrade)
    val passed = overallGrade != "F"
    val best = GradeCalculator.findBestCourse(record.courses)
    val worst = GradeCalculator.findWorstCourse(record.courses)
    val passingCourses = GradeCalculator.filterPassingCourses(record.courses)
    val failingCourses = GradeCalculator.filterFailingCourses(record.courses)

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "Performance",
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = Colors.white
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Colors.white)
                    }
                },
                actions = {
                    val context = LocalContext.current
                    TextButton(onClick = {
                        try {
                            val path = exportToCSV(context, listOf(record))
                            Toast.makeText(context, "Exported CSV to: $path", Toast.LENGTH_LONG).show()
                        } catch (t: Throwable) {
                            Toast.makeText(context, "Export failed: ${t.message}", Toast.LENGTH_LONG).show()
                        }
                    }) {
                        Icon(
                            Icons.Default.CloudUpload,
                            contentDescription = "Export",
                            tint = Colors.white,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Export", color = Colors.white, fontSize = 13.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Colors.navy,
                    titleContentColor = Colors.white,
                    navigationIconContentColor = Colors.white,
                    actionIconContentColor = Colors.white
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Student Profile Card
            item {
                ProfileCard(
                    record = record,
                    overallGrade = overallGrade,
                    passed = passed,
                    overallRemarks = overallRemarks
                )
            }

            // Summary Stats
            item {
                StatsRow(
                    overallAvg = overallAvg,
                    passingCount = passingCourses.size,
                    failingCount = failingCourses.size,
                    totalCourses = record.courses.size
                )
            }

            // Grade Table
            item {
                GradeTableCard(
                    record = record,
                    overallAvg = overallAvg,
                    overallGrade = overallGrade,
                    best = best,
                    worst = worst
                )
            }

            // Remarks per Course
            item {
                RemarksCard(record = record)
            }

            // Edit Button
            item {
                OutlinedButton(
                    onClick = { onNavigateToEdit(record) },
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.outlinedButtonColors(
                        contentColor = Colors.blue
                    )
                ) {
                    Icon(Icons.Default.Create, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Edit Courses")
                }
            }
        }
    }
}

@Composable
private fun ProfileCard(
    record: StudentRecord,
    overallGrade: String,
    passed: Boolean,
    overallRemarks: String
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Colors.card),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Overall Grade Badge
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(20.dp))
                    .background(if (passed) Colors.success.copy(alpha = 0.1f) else Colors.primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = overallGrade,
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (passed) Colors.success else Colors.primary
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column {
                Text(
                    text = record.studentName,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    color = Colors.navy
                )
                Text(
                    text = "ID: ${record.studentId}",
                    fontSize = 13.sp,
                    color = Colors.midGray
                )
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (passed) Colors.success.copy(alpha = 0.1f) else Colors.primary.copy(alpha = 0.1f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                if (passed) Icons.Default.CheckCircle else Icons.Default.Cancel,
                                contentDescription = null,
                                tint = if (passed) Colors.success else Colors.primary,
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = if (passed) "Overall Pass" else "Overall Fail",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (passed) Colors.success else Colors.primary
                            )
                        }
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = overallRemarks,
                        fontSize = 12.sp,
                        color = Colors.midGray
                    )
                }
            }
        }
    }
}

@Composable
private fun StatsRow(
    overallAvg: Double,
    passingCount: Int,
    failingCount: Int,
    totalCourses: Int
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Colors.card),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            StatItem(value = "${overallAvg}%", label = "Avg Score")
            StatItem(value = passingCount.toString(), label = "Passed", valueColor = Colors.success)
            StatItem(value = failingCount.toString(), label = "Failed", valueColor = Colors.primary)
            StatItem(value = totalCourses.toString(), label = "Courses")
        }
    }
}

@Composable
private fun StatItem(value: String, label: String, valueColor: Color = Colors.navy) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = valueColor
        )
        Text(
            text = label,
            fontSize = 11.sp,
            color = Colors.midGray
        )
    }
}

@Composable
private fun GradeTableCard(
    record: StudentRecord,
    overallAvg: Double,
    overallGrade: String,
    best: com.gradeexporter.data.Course?,
    worst: com.gradeexporter.data.Course?
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Colors.card),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Colors.navyMid)
                    .padding(horizontal = 12.dp, vertical = 10.dp)
            ) {
                Text("Course", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.White, modifier = Modifier.weight(2f))
                Text("CA", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.White, modifier = Modifier.width(40.dp), textAlign = TextAlign.Center)
                Text("Exam", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.White, modifier = Modifier.width(40.dp), textAlign = TextAlign.Center)
                Text("Avg", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.White, modifier = Modifier.width(50.dp), textAlign = TextAlign.Center)
                Text("Grade", fontSize = 11.sp, fontWeight = FontWeight.SemiBold, color = Color.White, modifier = Modifier.width(40.dp), textAlign = TextAlign.Center)
            }

            // Rows
            record.courses.forEachIndexed { index, course ->
                val avg = GradeCalculator.calculateAverage(course.ca, course.exam)
                val grade = GradeCalculator.determineGrade(avg)
                val isBest = best?.id == course.id
                val isWorst = worst?.id == course.id && record.courses.size > 1
                val gradeColor = getGradeColor(grade)

                val backgroundColor = when {
                    isBest -> Colors.success.copy(alpha = 0.08f)
                    index % 2 == 0 -> Colors.white
                    else -> Colors.offWhite
                }

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(backgroundColor)
                        .padding(horizontal = 12.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(2f)) {
                        Text(
                            text = course.name,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = Colors.navy
                        )
                        if (isBest) {
                            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 2.dp)) {
                                Icon(
                                    Icons.Default.Star,
                                    contentDescription = null,
                                    tint = Color(0xFFF59E0B),
                                    modifier = Modifier.size(9.dp)
                                )
                                Text(" Best", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFB45309))
                            }
                        }
                        if (isWorst) {
                            Text("Lowest", fontSize = 9.sp, fontWeight = FontWeight.SemiBold, color = Colors.primary, modifier = Modifier.padding(top = 2.dp))
                        }
                    }
                    Text(course.ca.toInt().toString(), fontSize = 13.sp, color = Colors.navy, modifier = Modifier.width(40.dp), textAlign = TextAlign.Center)
                    Text(course.exam.toInt().toString(), fontSize = 13.sp, color = Colors.navy, modifier = Modifier.width(40.dp), textAlign = TextAlign.Center)
                    Text("${avg}%", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = gradeColor, modifier = Modifier.width(50.dp), textAlign = TextAlign.Center)

                    Box(
                        modifier = Modifier
                            .width(40.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(gradeColor.copy(alpha = 0.1f))
                            .padding(horizontal = 4.dp, vertical = 2.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(grade, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = gradeColor)
                    }
                }
            }

            // Footer
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Colors.navy.copy(alpha = 0.08f))
                    .padding(horizontal = 12.dp, vertical = 10.dp)
            ) {
                Text("Overall Average", fontSize = 13.sp, fontWeight = FontWeight.SemiBold, color = Colors.navy, modifier = Modifier.weight(2f))
                Text("", modifier = Modifier.width(40.dp))
                Text("", modifier = Modifier.width(40.dp))
                Text("${overallAvg}%", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = getGradeColor(overallGrade), modifier = Modifier.width(50.dp), textAlign = TextAlign.Center)

                Box(
                    modifier = Modifier
                        .width(40.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(getGradeColor(overallGrade).copy(alpha = 0.1f))
                        .padding(horizontal = 4.dp, vertical = 2.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(overallGrade, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = getGradeColor(overallGrade))
                }
            }
        }
    }
}

@Composable
private fun RemarksCard(record: StudentRecord) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Colors.card),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = "Remarks per Course",
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = Colors.navy
            )
            Spacer(modifier = Modifier.height(10.dp))

            record.courses.forEach { course ->
                val avg = GradeCalculator.calculateAverage(course.ca, course.exam)
                val grade = GradeCalculator.determineGrade(avg)
                val remarks = GradeCalculator.getGradeRemarks(grade)
                val gradeColor = getGradeColor(grade)

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = course.name,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Colors.navy,
                        modifier = Modifier.weight(1f)
                    )
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = gradeColor.copy(alpha = 0.14f)
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = grade,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = gradeColor
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = remarks,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = gradeColor
                            )
                        }
                    }
                }
            }
        }
    }
}

private fun getGradeColor(grade: String): Color {
    return when (grade) {
        "A+" -> Color(0xFF059669)
        "A"  -> Colors.success
        "B+" -> Color(0xFF2563EB)
        "B"  -> Colors.blue
        "C+" -> Color(0xFF7C3AED)
        "C"  -> Colors.warning
        "D+" -> Color(0xFFF59E0B)
        "D"  -> Color(0xFFD97706)
        else -> Colors.primary
    }
}