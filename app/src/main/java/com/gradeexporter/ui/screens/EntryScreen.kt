package com.gradeexporter.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.RemoveCircle
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gradeexporter.data.Course
import com.gradeexporter.data.GradeCalculator
import com.gradeexporter.data.StudentRecord
import com.gradeexporter.ui.theme.Colors
import com.gradeexporter.viewmodel.GradeViewModel

data class CourseInput(
    val id: String = java.util.UUID.randomUUID().toString(),
    val name: String = "",
    val ca: String = "",
    val exam: String = ""
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EntryScreen(
    viewModel: GradeViewModel,
    editRecord: StudentRecord?,
    onNavigateBack: () -> Unit,
    onNavigateToResults: (StudentRecord) -> Unit
) {
    val isEditing = editRecord != null

    var studentName by remember { mutableStateOf(editRecord?.studentName ?: "") }
    var studentId by remember { mutableStateOf(editRecord?.studentId ?: "") }
    var courses by remember {
        mutableStateOf(
            if (editRecord != null) {
                editRecord.courses.map { CourseInput(it.id, it.name, it.ca.toString(), it.exam.toString()) }
            } else {
                listOf(CourseInput())
            }
        )
    }

    var showErrorDialog by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        if (isEditing) "Update Profile" else "Add Student",
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
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Colors.navy,
                    titleContentColor = Colors.white,
                    navigationIconContentColor = Colors.white
                )
            )
        }
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Student Information Section
            item {
                SectionCard(
                    title = "Student Information",
                    icon = null
                ) {
                    OutlinedTextField(
                        value = studentName,
                        onValueChange = { studentName = it },
                        label = { Text("Student Name") },
                        placeholder = { Text("e.g. John Doe") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Colors.primary,
                            unfocusedBorderColor = Colors.border
                        )
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    OutlinedTextField(
                        value = studentId,
                        onValueChange = { studentId = it },
                        label = { Text("Student ID") },
                        placeholder = { Text("e.g. STU-2024-001") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Colors.primary,
                            unfocusedBorderColor = Colors.border
                        )
                    )
                }
            }

            // Courses Section
            item {
                SectionCard(
                    title = "Courses",
                    icon = null
                ) {
                    // Column headers
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "Course Name",
                            fontSize = 11.sp,
                            color = Colors.midGray,
                            modifier = Modifier.weight(2f)
                        )
                        Text(
                            "CA (0-100)",
                            fontSize = 11.sp,
                            color = Colors.midGray,
                            modifier = Modifier.width(80.dp),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                        Text(
                            "Exam (0-100)",
                            fontSize = 11.sp,
                            color = Colors.midGray,
                            modifier = Modifier.width(80.dp),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                        Spacer(modifier = Modifier.width(40.dp))
                    }

                    courses.forEachIndexed { index, course ->
                        CourseInputRow(
                            index = index + 1,
                            course = course,
                            onNameChange = { newName ->
                                courses = courses.toMutableList().apply {
                                    this[index] = course.copy(name = newName)
                                }
                            },
                            onCaChange = { newCa ->
                                courses = courses.toMutableList().apply {
                                    this[index] = course.copy(ca = newCa)
                                }
                            },
                            onExamChange = { newExam ->
                                courses = courses.toMutableList().apply {
                                    this[index] = course.copy(exam = newExam)
                                }
                            },
                            onRemove = {
                                if (courses.size > 1) {
                                    courses = courses.toMutableList().apply { removeAt(index) }
                                } else {
                                    showErrorDialog = "At least one course is required."
                                }
                            }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // Add Course Button
                    OutlinedButton(
                        onClick = {
                            courses = courses + CourseInput()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Colors.secondary
                        )
                    ) {
                        Icon(Icons.Default.Add, contentDescription = null, tint = Colors.secondary)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Add Course")
                    }
                }
            }

            // Grading Scale Info
            item {
                GradingScaleCard()
            }

            // Calculate Button
            item {
                Button(
                    onClick = {
                        // Validation
                        if (studentName.isBlank()) {
                            showErrorDialog = "Please enter the student's name."
                            return@Button
                        }
                        if (studentId.isBlank()) {
                            showErrorDialog = "Please enter the student ID."
                            return@Button
                        }

                        for (course in courses) {
                            if (course.name.isBlank()) {
                                showErrorDialog = "Please enter a name for each course."
                                return@Button
                            }
                            val caVal = course.ca.toDoubleOrNull()
                            if (caVal == null || caVal < 0 || caVal > 100) {
                                showErrorDialog = "CA mark for \"${course.name}\" must be between 0 and 100."
                                return@Button
                            }
                            val examVal = course.exam.toDoubleOrNull()
                            if (examVal == null || examVal < 0 || examVal > 100) {
                                showErrorDialog = "Exam mark for \"${course.name}\" must be between 0 and 100."
                                return@Button
                            }
                        }

                        // Create record
                        val parsedCourses = courses.map { c ->
                            Course(
                                id = c.id,
                                name = c.name.trim(),
                                ca = c.ca.toDouble(),
                                exam = c.exam.toDouble()
                            )
                        }

                        val record = if (isEditing && editRecord != null) {
                            editRecord.copy(
                                studentName = studentName.trim(),
                                studentId = studentId.trim(),
                                courses = parsedCourses
                            )
                        } else {
                            StudentRecord(
                                studentName = studentName.trim(),
                                studentId = studentId.trim(),
                                courses = parsedCourses
                            )
                        }

                        if (isEditing) {
                            viewModel.updateRecord(record)
                        } else {
                            viewModel.addRecord(record)
                        }
                        onNavigateToResults(record)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Colors.secondary
                    ),
                    shape = RoundedCornerShape(14.dp)
                ) {
                    Text(
                        "Save & Calculate",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }

    // Error Dialog
    showErrorDialog?.let { message ->
        AlertDialog(
            onDismissRequest = { showErrorDialog = null },
            title = { Text("Validation Error") },
            text = { Text(message) },
            confirmButton = {
                TextButton(onClick = { showErrorDialog = null }) {
                    Text("OK")
                }
            }
        )
    }
}

@Composable
private fun SectionCard(
    title: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector?,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Colors.card),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                if (icon != null) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = Colors.primary,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(
                    text = title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Colors.navy
                )
            }
            content()
        }
    }
}

@Composable
private fun CourseInputRow(
    index: Int,
    course: CourseInput,
    onNameChange: (String) -> Unit,
    onCaChange: (String) -> Unit,
    onExamChange: (String) -> Unit,
    onRemove: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Index circle
        Box(
            modifier = Modifier
                .size(22.dp)
                .clip(RoundedCornerShape(11.dp))
                .background(Colors.primary.copy(alpha = 0.1f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = index.toString(),
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = Colors.primary
            )
        }

        Spacer(modifier = Modifier.width(8.dp))

        OutlinedTextField(
            value = course.name,
            onValueChange = onNameChange,
            placeholder = { Text("Course name") },
            modifier = Modifier.weight(2f),
            singleLine = true,
            textStyle = LocalTextStyle.current.copy(fontSize = 14.sp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Colors.primary,
                unfocusedBorderColor = Colors.border
            )
        )

        Spacer(modifier = Modifier.width(6.dp))

        OutlinedTextField(
            value = course.ca,
            onValueChange = { if (it.length <= 5 && (it.isEmpty() || it.matches(Regex("^\\d*\\.?\\d*$")))) onCaChange(it) },
            placeholder = { Text("0") },
            modifier = Modifier.width(80.dp),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            textStyle = LocalTextStyle.current.copy(fontSize = 14.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Colors.primary,
                unfocusedBorderColor = Colors.border
            )
        )

        Spacer(modifier = Modifier.width(6.dp))

        OutlinedTextField(
            value = course.exam,
            onValueChange = { if (it.length <= 5 && (it.isEmpty() || it.matches(Regex("^\\d*\\.?\\d*$")))) onExamChange(it) },
            placeholder = { Text("0") },
            modifier = Modifier.width(80.dp),
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            textStyle = LocalTextStyle.current.copy(fontSize = 14.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Colors.primary,
                unfocusedBorderColor = Colors.border
            )
        )

        IconButton(onClick = onRemove) {
            Icon(
                Icons.Default.RemoveCircle,
                contentDescription = "Remove",
                tint = Colors.primary,
                modifier = Modifier.size(22.dp)
            )
        }
    }
}

@Composable
private fun GradingScaleCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Colors.card),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(
                text = "Grading Scale",
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                color = Colors.midGray
            )
            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                listOf(
                    "A+" to Pair("#059669", "90-100"),
                    "A" to Pair(Colors.success.toString(), "80-89"),
                    "B+" to Pair("#2563EB", "70-79"),
                    "B" to Pair(Colors.blue.toString(), "65-69"),
                    "C+" to Pair("#7C3AED", "55-64"),
                    "C" to Pair(Colors.warning.toString(), "50-54"),
                    "D+" to Pair("#F59E0B", "45-49"),
                    "D" to Pair("#D97706", "35-44"),
                    "F" to Pair(Colors.primary.toString(), "0-34")
                ).forEach { (grade, _) ->
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = grade,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = when (grade) {
                                "A+" -> androidx.compose.ui.graphics.Color(0xFF059669)
                                "A" -> Colors.success
                                "B+" -> androidx.compose.ui.graphics.Color(0xFF2563EB)
                                "B" -> Colors.blue
                                "C+" -> androidx.compose.ui.graphics.Color(0xFF7C3AED)
                                "C" -> Colors.warning
                                "D+" -> androidx.compose.ui.graphics.Color(0xFFF59E0B)
                                "D" -> androidx.compose.ui.graphics.Color(0xFFD97706)
                                else -> Colors.primary
                            }
                        )
                    }
                }
            }
        }
    }
}