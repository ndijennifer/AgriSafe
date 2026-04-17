package com.agrisafe.app.sensors

import com.agrisafe.app.data.model.CropScan

// In-memory storage for crop scans
val cropScans = mutableListOf<CropScan>()

// Simulated disease keywords for basic detection
val diseaseIndicators =
        listOf("yellow", "brown", "spot", "wilt", "rot", "mold", "blight", "rust", "lesion", "dead")

val healthyIndicators = listOf("green", "fresh", "healthy", "lush", "vibrant", "strong", "normal")

// Simulate analyzing a crop photo
fun analyzeCropPhoto(
        id: String,
        cropName: String,
        photoPath: String,
        photoDescription: String // Simulates what AI would detect in the image
): CropScan {
    if (cropName.isBlank()) {
        println("Error: Crop name cannot be empty.")
        return CropScan(id, "Unknown", photoPath, "UNKNOWN", null, System.currentTimeMillis())
    }

    val lowerDesc = photoDescription.lowercase()

    val scanResult =
            when {
                diseaseIndicators.any { lowerDesc.contains(it) } -> "DISEASED"
                healthyIndicators.any { lowerDesc.contains(it) } -> "HEALTHY"
                else -> "UNKNOWN"
            }

    val advice =
            when (scanResult) {
                "HEALTHY" -> "Crop looks good! Maintain regular watering and monitor weekly."
                "DISEASED" ->
                        "Disease signs detected. Apply appropriate treatment and consult an agronomist."
                else -> "Unable to determine crop health. Please retake photo in better lighting."
            }

    val scan =
            CropScan(
                    id = id,
                    cropName = cropName,
                    photoPath = photoPath,
                    scanResult = scanResult,
                    advice = advice,
                    timestamp = System.currentTimeMillis()
            )

    cropScans.add(scan)
    return scan
}

// Print scan result
fun printScanResult(scan: CropScan) {
    println("\n--- Crop Scan Result ---")
    println("Crop: ${scan.cropName}")
    println("Photo: ${scan.photoPath}")
    val statusIcon =
            when (scan.scanResult) {
                "HEALTHY" -> "✅"
                "DISEASED" -> "🔴"
                else -> "⚠️"
            }
    println("Status: $statusIcon ${scan.scanResult}")
    println("Advice: ${scan.advice ?: "No advice available"}")
    println("------------------------")
}

// Get all diseased crops
fun getDiseasedCrops(): List<CropScan> {
    return cropScans.filter { it.scanResult == "DISEASED" }
}

// Print scan history
fun printScanHistory() {
    if (cropScans.isEmpty()) {
        println("No scans recorded yet.")
        return
    }
    println("\n--- Scan History ---")
    cropScans.forEach { println("${it.cropName} — ${it.scanResult} | ${it.photoPath}") }
}

fun main() {
    println("--- Crop Health Monitor Simulation ---\n")

    // Simulate scanning different crops
    val scan1 =
            analyzeCropPhoto(
                    "S001",
                    "Maize",
                    "/photos/maize_001.jpg",
                    "Leaves are green and vibrant, strong stalks"
            )
    printScanResult(scan1)

    val scan2 =
            analyzeCropPhoto(
                    "S002",
                    "Tomatoes",
                    "/photos/tomato_001.jpg",
                    "Yellow spots and brown lesions visible on leaves"
            )
    printScanResult(scan2)

    val scan3 =
            analyzeCropPhoto(
                    "S003",
                    "Cassava",
                    "/photos/cassava_001.jpg",
                    "Some wilting detected on outer leaves"
            )
    printScanResult(scan3)

    val scan4 =
            analyzeCropPhoto(
                    "S004",
                    "Beans",
                    "/photos/beans_001.jpg",
                    "Taken at night, image unclear"
            )
    printScanResult(scan4)

    printScanHistory()

    println("\n🔴 Crops needing attention:")
    getDiseasedCrops().forEach { println("- ${it.cropName}: ${it.advice}") }
}
