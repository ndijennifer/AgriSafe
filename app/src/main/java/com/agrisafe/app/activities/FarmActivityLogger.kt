package com.agrisafe.app.activities

import com.agrisafe.app.data.model.FarmActivity

// In-memory storage for activities (will connect to Room DB later)
val activityLog = mutableListOf<FarmActivity>()

// Add a new activity
fun logActivity(
    id: String,
    type: String,
    cropName: String,
    date: String,
    latitude: Double? = null,
    longitude: Double? = null,
    voiceNotePath: String? = null,
    notes: String = ""
) {
    // Validate type
    val validTypes = listOf("PLANTING", "WATERING", "HARVESTING")
    if (type !in validTypes) {
        println("Invalid activity type: $type. Must be one of $validTypes")
        return
    }

    // Validate crop name
    if (cropName.isBlank()) {
        println("Error: Crop name cannot be empty.")
        return
    }

    val activity = FarmActivity(
        id = id,
        type = type,
        cropName = cropName,
        date = date,
        latitude = latitude,
        longitude = longitude,
        voiceNotePath = voiceNotePath,
        notes = notes
    )

    activityLog.add(activity)
    println("Activity logged: ${activity.type} — ${activity.cropName} on ${activity.date}")
}

// Get all activities
fun getAllActivities(): List<FarmActivity> {
    return activityLog.toList()
}

// Get activities by type
fun getActivitiesByType(type: String): List<FarmActivity> {
    return activityLog.filter { it.type == type }
}

// Print all activities
fun printAllActivities() {
    if (activityLog.isEmpty()) {
        println("No activities logged yet.")
        return
    }
    println("\n--- Farm Activity Log ---")
    activityLog.forEach { activity ->
        println("ID: ${activity.id}")
        println("Type: ${activity.type}")
        println("Crop: ${activity.cropName}")
        println("Date: ${activity.date}")
        println("Location: ${activity.latitude ?: "N/A"}, ${activity.longitude ?: "N/A"}")
        println("Notes: ${activity.notes.ifBlank { "None" }}")
        println("-------------------------")
    }
}

fun main() {
    // Test logging activities
    logActivity("A001", "PLANTING", "Maize", "2026-04-01", 3.8480, 11.5021, notes = "North field")
    logActivity("A002", "WATERING", "Tomatoes", "2026-04-02", 3.8490, 11.5031)
    logActivity("A003", "HARVESTING", "Cassava", "2026-04-03")
    logActivity("A004", "PLANTING", "", "2026-04-04") // Should fail - empty crop
    logActivity("A005", "DANCING", "Beans", "2026-04-05") // Should fail - invalid type

    printAllActivities()

    println("\nPlanting activities only:")
    getActivitiesByType("PLANTING").forEach {
        println("${it.cropName} on ${it.date}")
    }
}