package com.agrisafe.app.utils

import com.agrisafe.app.data.model.MarketplaceMessage

// Known scam keywords
val scamKeywords =
        listOf(
                "send money",
                "deposit",
                "transfer now",
                "government subsidy",
                "you have won",
                "claim your prize",
                "urgent",
                "verify your account",
                "click this link",
                "limited time",
                "free money",
                "invest now",
                "double your money",
                "send",
                "fcfa deposit",
                "western union"
        )

// Check if a message is a scam
fun analyzeMessage(id: String, senderName: String, content: String): MarketplaceMessage {
    val lowerContent = content.lowercase()
    val detectedKeyword = scamKeywords.firstOrNull { lowerContent.contains(it) }
    val isScam = detectedKeyword != null

    return MarketplaceMessage(
            id = id,
            senderName = senderName,
            content = content,
            isScam = isScam,
            scamReason = if (isScam) "Suspicious keyword detected: '$detectedKeyword'" else null
    )
}

// Print message analysis result
fun printAnalysis(message: MarketplaceMessage) {
    println("\nMessage from: ${message.senderName}")
    println("Content: ${message.content}")
    if (message.isScam) {
        println("⚠️  SCAM DETECTED: ${message.scamReason}")
    } else {
        println("✅ Message looks safe.")
    }
    println("----------------------------")
}

fun main() {
    val messages =
            listOf(
                    analyzeMessage(
                            "M001",
                            "Unknown Buyer",
                            "Send 5000 FCFA deposit to receive your government subsidy."
                    ),
                    analyzeMessage(
                            "M002",
                            "John Farmer",
                            "Hello, I am interested in buying your maize harvest. Is it available?"
                    ),
                    analyzeMessage(
                            "M003",
                            "Prize Center",
                            "You have won 500,000 FCFA! Click this link to claim your prize now."
                    ),
                    analyzeMessage(
                            "M004",
                            "Mary Market",
                            "Can we meet at the market tomorrow to discuss the price?"
                    )
            )

    messages.forEach { printAnalysis(it) }
}
