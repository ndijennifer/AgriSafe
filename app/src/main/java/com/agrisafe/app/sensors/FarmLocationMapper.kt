package com.agrisafe.app.sensors

data class FarmLocation(
        val id: String,
        val farmName: String,
        val latitude: Double,
        val longitude: Double,
        val areaInHectares: Double? = null,
        val notes: String = ""
)

// In-memory storage for farm locations
val farmLocations = mutableListOf<FarmLocation>()

// Save a farm location
fun saveFarmLocation(
        id: String,
        farmName: String,
        latitude: Double,
        longitude: Double,
        areaInHectares: Double? = null,
        notes: String = ""
) {
    if (farmName.isBlank()) {
        println("Error: Farm name cannot be empty.")
        return
    }

    if (latitude !in -90.0..90.0 || longitude !in -180.0..180.0) {
        println("Error: Invalid GPS coordinates.")
        return
    }

    val location = FarmLocation(id, farmName, latitude, longitude, areaInHectares, notes)
    farmLocations.add(location)
    println("Farm saved: ${location.farmName} at (${location.latitude}, ${location.longitude})")
}

// Calculate distance between two GPS points in kilometers
fun calculateDistance(lat1: Double, lon1: Double, lat2: Double, lon2: Double): Double {
    val earthRadius = 6371.0
    val dLat = Math.toRadians(lat2 - lat1)
    val dLon = Math.toRadians(lon2 - lon1)
    val a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(Math.toRadians(lat1)) *
                            Math.cos(Math.toRadians(lat2)) *
                            Math.sin(dLon / 2) *
                            Math.sin(dLon / 2)
    val c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return earthRadius * c
}

// Find nearest farm to a given location
fun findNearestFarm(latitude: Double, longitude: Double): FarmLocation? {
    if (farmLocations.isEmpty()) {
        println("No farms saved yet.")
        return null
    }
    return farmLocations.minByOrNull {
        calculateDistance(latitude, longitude, it.latitude, it.longitude)
    }
}

// Print all saved farms
fun printAllFarms() {
    if (farmLocations.isEmpty()) {
        println("No farms saved yet.")
        return
    }
    println("\n--- Saved Farm Locations ---")
    farmLocations.forEach {
        println("ID: ${it.id} | Farm: ${it.farmName}")
        println("GPS: (${it.latitude}, ${it.longitude})")
        println("Area: ${it.areaInHectares ?: "Not specified"} hectares")
        println("Notes: ${it.notes.ifBlank { "None" }}")
        println("----------------------------")
    }
}

fun main() {
    // Save farm locations
    saveFarmLocation("F001", "North Maize Farm", 3.8480, 11.5021, 2.5, "Main farm")
    saveFarmLocation("F002", "South Tomato Farm", 3.8390, 11.4950, 1.2, "Near the river")
    saveFarmLocation("F003", "East Cassava Farm", 3.8550, 11.5100, 3.0)
    saveFarmLocation("F004", "", 3.8600, 11.5200) // Should fail

    printAllFarms()

    // Find nearest farm to current location
    val myLat = 3.8470
    val myLon = 11.5010
    val nearest = findNearestFarm(myLat, myLon)
    nearest?.let {
        val dist = calculateDistance(myLat, myLon, it.latitude, it.longitude)
        println("\nNearest farm: ${it.farmName}")
        println("Distance: ${"%.2f".format(dist)} km")
    }
}
