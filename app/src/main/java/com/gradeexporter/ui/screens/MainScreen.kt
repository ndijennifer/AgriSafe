package com.gradeexporter.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.viewmodel.compose.viewModel
import com.gradeexporter.data.StudentRecord
import com.gradeexporter.viewmodel.GradeViewModel

sealed class Screen {
    object Home : Screen()
    data class Entry(val editRecord: StudentRecord? = null) : Screen()
    data class Results(val record: StudentRecord) : Screen()
}

@Composable
fun MainScreen(
    viewModel: GradeViewModel = viewModel()
) {
    var currentScreen by remember { mutableStateOf<Screen>(Screen.Home) }
    
    when (val screen = currentScreen) {
        is Screen.Home -> {
            HomeScreen(
                viewModel = viewModel,
                onNavigateToEntry = { record ->
                    currentScreen = Screen.Entry(record)
                },
                onNavigateToResults = { record ->
                    viewModel.setActiveRecord(record)
                    currentScreen = Screen.Results(record)
                }
            )
        }
        is Screen.Entry -> {
            EntryScreen(
                viewModel = viewModel,
                editRecord = screen.editRecord,
                onNavigateBack = { currentScreen = Screen.Home },
                onNavigateToResults = { record ->
                    viewModel.setActiveRecord(record)
                    currentScreen = Screen.Results(record)
                }
            )
        }
        is Screen.Results -> {
            ResultsScreen(
                viewModel = viewModel,
                record = screen.record,
                onNavigateBack = { currentScreen = Screen.Home },
                onNavigateToEdit = { record ->
                    currentScreen = Screen.Entry(record)
                }
            )
        }
    }
}