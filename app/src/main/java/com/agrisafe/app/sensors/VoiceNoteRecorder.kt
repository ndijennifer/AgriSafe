package com.agrisafe.app.sensors

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

// Voice note data model
data class VoiceNote(
        val id: String,
        val filePath: String,
        val duration: Long, // in seconds
        val activityId: String?, // nullable - may not be linked to an activity
        val createdAt: String,
        val transcription: String? // nullable - transcription may not be available
)

// In-memory storage for voice notes
val voiceNotes = mutableListOf<VoiceNote>()

var isRecording = false
var recordingStartTime = 0L

// Start recording
fun startRecording() {
    if (isRecording) {
        println("⚠️  Already recording. Stop current recording first.")
        return
    }
    isRecording = true
    recordingStartTime = System.currentTimeMillis()
    println("🎙️  Recording started...")
}

// Stop recording and save
fun stopRecording(
        id: String,
        saveDirectory: String = "voice_notes",
        activityId: String? = null,
        transcription: String? = null
): VoiceNote? {
    if (!isRecording) {
        println("⚠️  No active recording to stop.")
        return null
    }

    isRecording = false
    val duration = (System.currentTimeMillis() - recordingStartTime) / 1000
    val timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))
    val filePath = "$saveDirectory/voice_note_$timestamp.mp3"
    val createdAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))

    // Validate duration
    if (duration < 1) {
        println("⚠️  Recording too short. Minimum 1 second required.")
        return null
    }

    val note =
            VoiceNote(
                    id = id,
                    filePath = filePath,
                    duration = duration,
                    activityId = activityId,
                    createdAt = createdAt,
                    transcription = transcription
            )

    voiceNotes.add(note)
    println("✅ Voice note saved: ${note.filePath}")
    println("   Duration: ${note.duration}s | Activity: ${note.activityId ?: "Not linked"}")
    return note
}

// Get all voice notes for a specific activity
fun getVoiceNotesForActivity(activityId: String): List<VoiceNote> {
    return voiceNotes.filter { it.activityId == activityId }
}

// Print all voice notes
fun printAllVoiceNotes() {
    if (voiceNotes.isEmpty()) {
        println("No voice notes recorded yet.")
        return
    }
    println("\n--- Voice Notes ---")
    voiceNotes.forEach {
        println("ID: ${it.id}")
        println("File: ${it.filePath}")
        println("Duration: ${it.duration} seconds")
        println("Linked Activity: ${it.activityId ?: "None"}")
        println("Transcription: ${it.transcription ?: "Not available"}")
        println("Created: ${it.createdAt}")
        println("-------------------")
    }
}

fun main() {
    println("--- Voice Note Recorder Simulation ---\n")

    // Record first note
    startRecording()
    Thread.sleep(3000) // Simulate 3 seconds recording
    stopRecording(
            "V001",
            activityId = "A001",
            transcription = "Planted maize in the north field today, soil looks good."
    )

    // Try to start another while recording is active
    startRecording()
    startRecording() // Should warn

    Thread.sleep(2000)
    stopRecording(
            "V002",
            activityId = "A002",
            transcription = "Watered tomatoes, noticed some yellowing on leaves."
    )

    // Stop when not recording
    stopRecording("V003")

    // Record without linking to activity
    startRecording()
    Thread.sleep(1500)
    stopRecording("V004", transcription = "General farm observation for today.")

    printAllVoiceNotes()

    println("\nVoice notes for Activity A001:")
    getVoiceNotesForActivity("A001").forEach { println("- ${it.transcription}") }
}
