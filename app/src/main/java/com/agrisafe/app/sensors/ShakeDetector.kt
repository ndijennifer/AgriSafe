package com.agrisafe.app.sensors

import com.agrisafe.app.activities.logActivity
import java.time.LocalDate

// Shake detection threshold and settings
const val SHAKE_THRESHOLD = 15.0
const val SHAKE_COOLDOWN_MS = 2000L

var lastShakeTime = 0L
var shakeCount = 0

// Simulates reading accelerometer data
data class AccelerometerData(
        val x: Float,
        val y: Float,
        val z: Float,
        val timestamp: Long = System.currentTimeMillis()
)

// Calculate acceleration force
fun calculateForce(data: AccelerometerData): Double {
    val gravity = 9.8
    val forceX = data.x - gravity
    val forceY = data.y - gravity
    val forceZ = data.z - gravity
    return Math.sqrt((forceX * forceX + forceY * forceY + forceZ * forceZ).toDouble())
}

// Process accelerometer reading and detect shake
fun onAccelerometerReading(data: AccelerometerData, onShakeDetected: () -> Unit) {
    val force = calculateForce(data)
    val currentTime = System.currentTimeMillis()

    if (force > SHAKE_THRESHOLD) {
        if (currentTime - lastShakeTime > SHAKE_COOLDOWN_MS) {
            lastShakeTime = currentTime
            shakeCount++
            println("📳 Shake detected! Force: ${"%.2f".format(force)} | Count: $shakeCount")
            onShakeDetected()
        } else {
            println("Shake ignored — cooldown active.")
        }
    }
}

// Quick log triggered by shake
fun quickLogOnShake(cropName: String, type: String) {
    val date = LocalDate.now().toString()
    val id = "SHAKE_${System.currentTimeMillis()}"
    println("⚡ Quick logging activity from shake...")
    logActivity(
            id = id,
            type = type,
            cropName = cropName,
            date = date,
            notes = "Logged via shake gesture"
    )
}

fun main() {
    println("--- Shake Detection Simulation ---\n")

    // Simulate normal movement - should NOT trigger
    onAccelerometerReading(AccelerometerData(1.0f, 9.8f, 0.5f)) {
        quickLogOnShake("Maize", "WATERING")
    }

    // Simulate strong shake - SHOULD trigger
    onAccelerometerReading(AccelerometerData(20.0f, 25.0f, 18.0f)) {
        quickLogOnShake("Maize", "WATERING")
    }

    // Simulate another shake immediately - should be ignored (cooldown)
    onAccelerometerReading(AccelerometerData(22.0f, 26.0f, 20.0f)) {
        quickLogOnShake("Tomatoes", "PLANTING")
    }

    // Simulate shake after cooldown
    Thread.sleep(2100)
    onAccelerometerReading(AccelerometerData(19.0f, 24.0f, 17.0f)) {
        quickLogOnShake("Cassava", "HARVESTING")
    }

    println("\nTotal shakes detected: $shakeCount")
}
