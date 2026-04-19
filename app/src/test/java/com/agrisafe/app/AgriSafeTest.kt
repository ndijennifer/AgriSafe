package com.agrisafe.app

import com.agrisafe.app.activities.activityLog
import com.agrisafe.app.activities.getActivitiesByType
import com.agrisafe.app.activities.logActivity
import com.agrisafe.app.sensors.AccelerometerData
import com.agrisafe.app.sensors.analyzeCropPhoto
import com.agrisafe.app.sensors.calculateDistance
import com.agrisafe.app.sensors.calculateForce
import com.agrisafe.app.sensors.cropScans
import com.agrisafe.app.sensors.farmLocations
import com.agrisafe.app.sensors.getVoiceNotesForActivity
import com.agrisafe.app.sensors.isRecording
import com.agrisafe.app.sensors.saveFarmLocation
import com.agrisafe.app.sensors.startRecording
import com.agrisafe.app.sensors.stopRecording
import com.agrisafe.app.sensors.voiceNotes
import com.agrisafe.app.utils.WeatherData
import com.agrisafe.app.utils.analyzeMessage
import com.agrisafe.app.utils.generateFarmingTips
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class AgriSafeTest {

    // Reset all data before each test
    @Before
    fun setup() {
        activityLog.clear()
        cropScans.clear()
        farmLocations.clear()
        voiceNotes.clear()
    }

    // ── FARM ACTIVITY TESTS ──

    @Test
    fun `test valid activity is logged successfully`() {
        logActivity("A001", "PLANTING", "Maize", "2026-04-17")
        assertEquals(1, activityLog.size)
        assertEquals("Maize", activityLog[0].cropName)
    }

    @Test
    fun `test empty crop name is rejected`() {
        logActivity("A002", "PLANTING", "", "2026-04-17")
        assertEquals(0, activityLog.size)
    }

    @Test
    fun `test invalid activity type is rejected`() {
        logActivity("A003", "DANCING", "Maize", "2026-04-17")
        assertEquals(0, activityLog.size)
    }

    @Test
    fun `test filter activities by type`() {
        logActivity("A004", "PLANTING", "Maize", "2026-04-17")
        logActivity("A005", "WATERING", "Tomatoes", "2026-04-17")
        logActivity("A006", "PLANTING", "Beans", "2026-04-17")
        val plantingActivities = getActivitiesByType("PLANTING")
        assertEquals(2, plantingActivities.size)
    }

    @Test
    fun `test activity with null GPS is saved correctly`() {
        logActivity(
                "A007",
                "HARVESTING",
                "Cassava",
                "2026-04-17",
                latitude = null,
                longitude = null
        )
        assertEquals(1, activityLog.size)
        assertNull(activityLog[0].latitude)
        assertNull(activityLog[0].longitude)
    }

    // ── CROP HEALTH TESTS ──

    @Test
    fun `test healthy crop is detected correctly`() {
        val scan =
                analyzeCropPhoto("S001", "Maize", "/photos/maize.jpg", "Green and vibrant leaves")
        assertEquals("HEALTHY", scan.scanResult)
    }

    @Test
    fun `test diseased crop is detected correctly`() {
        val scan =
                analyzeCropPhoto(
                        "S002",
                        "Tomatoes",
                        "/photos/tomato.jpg",
                        "Yellow spots and brown lesions on leaves"
                )
        assertEquals("DISEASED", scan.scanResult)
    }

    @Test
    fun `test unknown crop health returns UNKNOWN`() {
        val scan =
                analyzeCropPhoto(
                        "S003",
                        "Beans",
                        "/photos/beans.jpg",
                        "Image taken at night, unclear"
                )
        assertEquals("UNKNOWN", scan.scanResult)
    }

    // ── SCAM DETECTION TESTS ──

    @Test
    fun `test scam message is detected`() {
        val message =
                analyzeMessage(
                        "M001",
                        "Unknown",
                        "Send 5000 FCFA deposit to claim your government subsidy."
                )
        assertTrue(message.isScam)
        assertNotNull(message.scamReason)
    }

    @Test
    fun `test legitimate message is not flagged`() {
        val message =
                analyzeMessage("M002", "John", "Hello, I would like to buy your maize harvest.")
        assertFalse(message.isScam)
        assertNull(message.scamReason)
    }

    // ── GPS TESTS ──

    @Test
    fun `test valid farm location is saved`() {
        saveFarmLocation("F001", "North Farm", 3.8480, 11.5021)
        assertEquals(1, farmLocations.size)
    }

    @Test
    fun `test empty farm name is rejected`() {
        saveFarmLocation("F002", "", 3.8480, 11.5021)
        assertEquals(0, farmLocations.size)
    }

    @Test
    fun `test invalid GPS coordinates are rejected`() {
        saveFarmLocation("F003", "Bad Farm", 200.0, 500.0)
        assertEquals(0, farmLocations.size)
    }

    @Test
    fun `test distance calculation is accurate`() {
        val distance = calculateDistance(3.8480, 11.5021, 3.8390, 11.4950)
        assertTrue(distance in 0.5..2.0)
    }

    // ── SHAKE DETECTION TESTS ──

    @Test
    fun `test strong shake is detected`() {
        val data = AccelerometerData(20.0f, 25.0f, 18.0f)
        val force = calculateForce(data)
        assertTrue(force > 15.0)
    }

    @Test
    fun `test normal movement is not detected as shake`() {
        val data = AccelerometerData(1.0f, 9.8f, 0.5f)
        val force = calculateForce(data)
        assertTrue(force < 15.0)
    }

    // ── WEATHER TESTS ──

    @Test
    fun `test high temperature generates HIGH urgency tip`() {
        val weather = WeatherData("Yaoundé", 38.0, 50, "SUNNY", 10.0, "2026-04-17")
        val tips = generateFarmingTips(weather)
        assertTrue(tips.any { it.urgency == "HIGH" })
    }

    @Test
    fun `test stormy weather generates storm warning`() {
        val weather = WeatherData("Yaoundé", 25.0, 70, "STORMY", 60.0, "2026-04-17")
        val tips = generateFarmingTips(weather)
        assertTrue(tips.any { it.category == "Storm" })
    }

    @Test
    fun `test normal weather generates LOW urgency tips`() {
        val weather = WeatherData("Yaoundé", 25.0, 60, "CLOUDY", 10.0, "2026-04-17")
        val tips = generateFarmingTips(weather)
        assertTrue(tips.all { it.urgency == "LOW" })
    }

    // ── VOICE NOTE TESTS ──

    @Test
    fun `test recording starts successfully`() {
        isRecording = false
        startRecording()
        assertTrue(isRecording)
    }

    @Test
    fun `test recording stops and saves correctly`() {
        isRecording = false
        startRecording()
        Thread.sleep(2000)
        val note = stopRecording("V001", activityId = "A001", transcription = "Test note")
        assertNotNull(note)
        assertEquals("A001", note?.activityId)
        assertFalse(isRecording)
    }

    @Test
    fun `test stopping when not recording returns null`() {
        isRecording = false
        val note = stopRecording("V002")
        assertNull(note)
    }

    @Test
    fun `test voice note is linked to activity`() {
        isRecording = false
        startRecording()
        Thread.sleep(1500)
        stopRecording("V003", activityId = "A001", transcription = "Watered tomatoes")
        val notes = getVoiceNotesForActivity("A001")
        assertEquals(1, notes.size)
    }
}
