package com.agrisafe.app

import com.agrisafe.app.activities.logActivity
import com.agrisafe.app.activities.printAllActivities
import com.agrisafe.app.sensors.AccelerometerData
import com.agrisafe.app.sensors.analyzeCropPhoto
import com.agrisafe.app.sensors.onAccelerometerReading
import com.agrisafe.app.sensors.printScanResult
import com.agrisafe.app.sensors.quickLogOnShake
import com.agrisafe.app.sensors.saveFarmLocation
import com.agrisafe.app.sensors.startRecording
import com.agrisafe.app.sensors.stopRecording
import com.agrisafe.app.utils.WeatherData
import com.agrisafe.app.utils.analyzeMessage
import com.agrisafe.app.utils.printAnalysis
import com.agrisafe.app.utils.printWeatherReport

fun main() {
    println("========================================")
    println("   Welcome to AgriSafe 🌾")
    println("   Smart Farming Assistant for Cameroon")
    println("========================================\n")

    // ── 1. LOG FARM ACTIVITIES ──
    println("📋 FARM ACTIVITY LOGGER")
    println("------------------------")
    logActivity("A001", "PLANTING", "Maize", "2026-04-17", 3.8480, 11.5021, notes = "North field")
    logActivity("A002", "WATERING", "Tomatoes", "2026-04-17", 3.8490, 11.5031)
    logActivity("A003", "HARVESTING", "Cassava", "2026-04-17")
    printAllActivities()

    // ── 2. CROP HEALTH MONITOR ──
    println("\n📷 CROP HEALTH MONITOR")
    println("------------------------")
    val scan1 = analyzeCropPhoto("S001", "Maize", "/photos/maize.jpg", "Green and vibrant leaves")
    printScanResult(scan1)

    val scan2 =
            analyzeCropPhoto(
                    "S002",
                    "Tomatoes",
                    "/photos/tomato.jpg",
                    "Yellow spots and brown lesions on leaves"
            )
    printScanResult(scan2)

    // ── 3. GPS FARM MAPPING ──
    println("\n🗺️  GPS FARM MAPPING")
    println("------------------------")
    saveFarmLocation("F001", "North Maize Farm", 3.8480, 11.5021, 2.5, "Main farm")
    saveFarmLocation("F002", "South Tomato Farm", 3.8390, 11.4950, 1.2, "Near the river")

    // ── 4. SHAKE TO LOG ──
    println("\n📳 SHAKE TO LOG")
    println("------------------------")
    onAccelerometerReading(AccelerometerData(20.0f, 25.0f, 18.0f)) {
        quickLogOnShake("Beans", "PLANTING")
    }

    // ── 5. VOICE NOTES ──
    println("\n🎙️  VOICE NOTES")
    println("------------------------")
    startRecording()
    Thread.sleep(2000)
    stopRecording(
            "V001",
            activityId = "A001",
            transcription = "Planted maize in the north field, soil looks good."
    )

    // ── 6. SCAM DETECTION ──
    println("\n🛡️  SCAM DETECTION")
    println("------------------------")
    val msg1 =
            analyzeMessage(
                    "M001",
                    "Unknown Buyer",
                    "Send 5000 FCFA deposit to receive your government subsidy."
            )
    printAnalysis(msg1)

    val msg2 =
            analyzeMessage("M002", "John Farmer", "Hello, I would like to buy your maize harvest.")
    printAnalysis(msg2)

    // ── 7. WEATHER ADVISOR ──
    println("\n🌤️  WEATHER ADVISOR")
    println("------------------------")
    val weather =
            WeatherData(
                    location = "Yaoundé, Cameroon",
                    temperatureCelsius = 27.0,
                    humidity = 65,
                    condition = "SUNNY",
                    windSpeedKmh = 12.0,
                    date = "2026-04-17"
            )
    printWeatherReport(weather)

    println("\n========================================")
    println("   AgriSafe session complete ✅")
    println("========================================")
}
