package com.gradeexporter.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.CloudUpload
import androidx.compose.material.icons.filled.Create
import androidx.compose.material.icons.filled.Delete
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
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.FileProvider
import android.content.Intent
import android.widget.Toast
import com.gradeexporter.data.StudentRecord
import com.gradeexporter.ui.theme.Colors
import com.gradeexporter.R
import com.gradeexporter.viewmodel.GradeViewModel
import com.gradeexporter.utils.hasStoragePermission
import com.gradeexporter.utils.exportToCSV
import com.gradeexporter.utils.importFromCSV
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: GradeViewModel,
    onNavigateToEntry: (StudentRecord?) -> Unit,
    onNavigateToResults: (StudentRecord) -> Unit
) {
    val recordsList: List<StudentRecord> = viewModel.records.value ?: emptyList()
    val loading: Boolean = viewModel.isLoading.value ?: true

    var showDeleteDialog by remember { mutableStateOf<StudentRecord?>(null) }

    val context = LocalContext.current

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let {
            try {
                val inputStream = context.contentResolver.openInputStream(it)
                val tempFile = java.io.File(context.cacheDir, "import_temp.csv")
                inputStream?.use { input ->
                    tempFile.outputStream().use { output ->
                        input.copyTo(output)
                    }
                }
                val importedRecords = importFromCSV(tempFile)
                importedRecords.forEach { record ->
                    viewModel.addRecord(record)
                }
                Toast.makeText(context, "Imported ${importedRecords.size} records", Toast.LENGTH_SHORT).show()
                tempFile.delete()
            } catch (e: Exception) {
                Toast.makeText(context, "Import failed: ${e.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "ScholarTrack",
                        fontWeight = FontWeight.Bold,
                        fontSize = 20.sp,
                        color = Colors.white
                    )
                },
                actions = {
                    IconButton(onClick = {
                        if (hasStoragePermission(context)) {
                            try {
                                val filePath = exportToCSV(context, recordsList)
                                val file = java.io.File(filePath)
                                val uri = FileProvider.getUriForFile(
                                    context,
                                    "com.gradeexporter.fileprovider",
                                    file
                                )
                                val intent = Intent(Intent.ACTION_SEND).apply {
                                    type = "text/csv"
                                    putExtra(Intent.EXTRA_STREAM, uri)
                                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                                }
                                context.startActivity(Intent.createChooser(intent, "Share CSV"))
                                Toast.makeText(context, "Exported to $filePath", Toast.LENGTH_SHORT).show()
                            } catch (e: Exception) {
                                Toast.makeText(context, "Export failed: ${e.message}", Toast.LENGTH_SHORT).show()
                            }
                        } else {
                            Toast.makeText(context, "Storage permission required", Toast.LENGTH_SHORT).show()
                        }
                    }) {
                        Icon(
                            Icons.Filled.CloudDownload,
                            contentDescription = "Export",
                            tint = Colors.offWhite
                        )
                    }
                    IconButton(onClick = {
                        if (hasStoragePermission(context)) {
                            filePickerLauncher.launch("text/*")
                        } else {
                            Toast.makeText(context, "Storage permission required", Toast.LENGTH_SHORT).show()
                        }
                    }) {
                        Icon(
                            Icons.Filled.CloudUpload,
                            contentDescription = "Import",
                            tint = Colors.offWhite
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Colors.navy,
                    titleContentColor = Colors.white
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = { onNavigateToEntry(null) },
                containerColor = Colors.secondary,
                contentColor = Colors.white
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Student")
            }
        }
    ) { paddingValues ->
        if (loading) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = Colors.primary)
            }
        } else if (recordsList.isEmpty()) {
            EmptyState(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            )
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                SummaryBar(records = recordsList, viewModel = viewModel)

                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(
                        items = recordsList,
                        key = { record: StudentRecord -> record.id }
                    ) { record: StudentRecord ->
                        RecordCard(
                            record = record,
                            viewModel = viewModel,
                            onClick = { onNavigateToResults(record) },
                            onEdit = { onNavigateToEntry(record) },
                            onDelete = { showDeleteDialog = record }
                        )
                    }
                }
            }
        }
    }

    showDeleteDialog?.let { record ->
        AlertDialog(
            onDismissRequest = { showDeleteDialog = null },
            title = { Text("Delete Record") },
            text = { Text("Remove ${record.studentName}'s record? This cannot be undone.") },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.deleteRecord(record.id)
                        showDeleteDialog = null
                    }
                ) {
                    Text("Delete", color = Colors.primary)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = null }) {
                    Text("Cancel")
                }
            }
        )
    }
}

@Composable
private fun SummaryBar(records: List<StudentRecord>, viewModel: GradeViewModel) {
    val passingCount = records.count { record ->
        val avg = viewModel.computeOverallAverage(record.courses)
        viewModel.determineGrade(avg) != "F"
    }
    val totalCourses = records.sumOf { it.courses.size }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Colors.white,
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            SummaryItem(value = records.size.toString(), label = "Students")
            SummaryItem(value = totalCourses.toString(), label = "Courses")
            SummaryItem(value = passingCount.toString(), label = "Passing", valueColor = Colors.success)
        }
    }
}

@Composable
private fun SummaryItem(value: String, label: String, valueColor: Color = Colors.navy) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            fontSize = 20.sp,
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
private fun EmptyState(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "No records yet",
            fontSize = 20.sp,
            fontWeight = FontWeight.SemiBold,
            color = Colors.navy
        )
        Spacer(modifier = Modifier.height(12.dp))
        Text(
            text = "Press the '+' button to add a student and start tracking their progress.",
            fontSize = 14.sp,
            color = Colors.midGray,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun RecordCard(
    record: StudentRecord,
    viewModel: GradeViewModel,
    onClick: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit
) {
    val overall = viewModel.computeOverallAverage(record.courses)
    val grade = viewModel.determineGrade(overall)
    val passed = grade != "F"

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = Colors.card),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(CircleShape)
                    .background(if (passed) Colors.success.copy(alpha = 0.1f) else Colors.primary.copy(alpha = 0.1f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = grade,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (passed) Colors.success else Colors.primary
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = record.studentName,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Colors.navy
                )
                Text(
                    text = "ID: ${record.studentId}",
                    fontSize = 12.sp,
                    color = Colors.midGray
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(top = 4.dp)
                ) {
                    Text(
                        text = "${record.courses.size} course${if (record.courses.size != 1) "s" else ""}",
                        fontSize = 11.sp,
                        color = Colors.midGray
                    )
                    Text(" · ", color = Colors.border, fontSize = 11.sp)
                    Text("Avg ${overall}%", fontSize = 11.sp, color = Colors.midGray)
                    Text(" · ", color = Colors.border, fontSize = 11.sp)
                    Text(formatDate(record.createdAt), fontSize = 11.sp, color = Colors.midGray)
                }
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onEdit) {
                    Icon(
                        Icons.Default.Create,
                        contentDescription = "Edit",
                        tint = Colors.blue,
                        modifier = Modifier.size(20.dp)
                    )
                }
                IconButton(onClick = onDelete) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = Colors.midGray,
                        modifier = Modifier.size(20.dp)
                    )
                }
                Icon(
                    Icons.Filled.ArrowForward,
                    contentDescription = null,
                    tint = Colors.border,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

private fun formatDate(timestamp: String): String {
    return try {
        val sdf = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
        sdf.format(Date(timestamp.toLong()))
    } catch (e: Exception) {
        ""
    }
}