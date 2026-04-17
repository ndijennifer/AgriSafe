package com.agrisafe.app.utils

// Weather data model
data class WeatherData(
        val location: String,
        val temperatureCelsius: Double,
        val humidity: Int, // percentage
        val condition: String, // "SUNNY", "CLOUDY", "RAINY", "STORMY"
        val windSpeedKmh: Double,
        val date: String
)

// Farming tip model
data class FarmingTip(
        val category: String,
        val tip: String,
        val urgency: String // "LOW", "MEDIUM", "HIGH"
)

// Generate farming tips based on weather
fun generateFarmingTips(weather: WeatherData): List<FarmingTip> {
    val tips = mutableListOf<FarmingTip>()

    // Temperature tips
    when {
        weather.temperatureCelsius > 35 ->
                tips.add(
                        FarmingTip(
                                "Temperature",
                                "Extreme heat detected. Water crops early morning or late evening to reduce evaporation.",
                                "HIGH"
                        )
                )
        weather.temperatureCelsius < 15 ->
                tips.add(
                        FarmingTip(
                                "Temperature",
                                "Cool temperatures. Good time for planting leafy vegetables.",
                                "LOW"
                        )
                )
        else ->
                tips.add(
                        FarmingTip(
                                "Temperature",
                                "Temperature is ideal for most crops. Good day for farm work.",
                                "LOW"
                        )
                )
    }

    // Humidity tips
    when {
        weather.humidity > 80 ->
                tips.add(
                        FarmingTip(
                                "Humidity",
                                "High humidity detected. Watch out for fungal diseases on crops.",
                                "HIGH"
                        )
                )
        weather.humidity < 30 ->
                tips.add(
                        FarmingTip(
                                "Humidity",
                                "Low humidity. Increase watering frequency to prevent crop stress.",
                                "MEDIUM"
                        )
                )
        else ->
                tips.add(
                        FarmingTip(
                                "Humidity",
                                "Humidity levels are normal. No extra action needed.",
                                "LOW"
                        )
                )
    }

    // Condition tips
    when (weather.condition) {
        "RAINY" ->
                tips.add(
                        FarmingTip(
                                "Rain",
                                "Rain expected. Skip watering today and check for waterlogging.",
                                "MEDIUM"
                        )
                )
        "STORMY" ->
                tips.add(
                        FarmingTip(
                                "Storm",
                                "Storm warning! Secure young plants and avoid outdoor farm work.",
                                "HIGH"
                        )
                )
        "SUNNY" ->
                tips.add(
                        FarmingTip(
                                "Sunshine",
                                "Sunny day ahead. Great for harvesting and drying crops.",
                                "LOW"
                        )
                )
        "CLOUDY" ->
                tips.add(
                        FarmingTip(
                                "Cloud Cover",
                                "Cloudy conditions. Good day for transplanting seedlings.",
                                "LOW"
                        )
                )
    }

    // Wind tips
    if (weather.windSpeedKmh > 40) {
        tips.add(
                FarmingTip(
                        "Wind",
                        "Strong winds detected. Support tall crops like maize with stakes.",
                        "HIGH"
                )
        )
    }

    return tips
}

// Print weather summary and tips
fun printWeatherReport(weather: WeatherData) {
    println("\n--- Weather Report for ${weather.location} ---")
    println("Date: ${weather.date}")
    println("Temperature: ${weather.temperatureCelsius}°C")
    println("Humidity: ${weather.humidity}%")
    println("Condition: ${weather.condition}")
    println("Wind Speed: ${weather.windSpeedKmh} km/h")

    println("\n🌱 Farming Tips:")
    val tips = generateFarmingTips(weather)
    tips.forEach { tip ->
        val icon =
                when (tip.urgency) {
                    "HIGH" -> "🔴"
                    "MEDIUM" -> "🟡"
                    else -> "🟢"
                }
        println("$icon [${tip.category}] ${tip.tip}")
    }
    println("--------------------------------------")
}

// Get only high urgency tips
fun getHighUrgencyTips(weather: WeatherData): List<FarmingTip> {
    return generateFarmingTips(weather).filter { it.urgency == "HIGH" }
}

fun main() {
    println("--- Weather Advisor Simulation ---\n")

    // Simulate different weather conditions
    val hotDay =
            WeatherData(
                    location = "Yaoundé, Cameroon",
                    temperatureCelsius = 38.0,
                    humidity = 85,
                    condition = "SUNNY",
                    windSpeedKmh = 45.0,
                    date = "2026-04-17"
            )
    printWeatherReport(hotDay)

    val rainyDay =
            WeatherData(
                    location = "Bafoussam, Cameroon",
                    temperatureCelsius = 22.0,
                    humidity = 92,
                    condition = "RAINY",
                    windSpeedKmh = 15.0,
                    date = "2026-04-17"
            )
    printWeatherReport(rainyDay)

    println("\n🔴 High urgency alerts for Yaoundé:")
    getHighUrgencyTips(hotDay).forEach { println("- [${it.category}] ${it.tip}") }
}
