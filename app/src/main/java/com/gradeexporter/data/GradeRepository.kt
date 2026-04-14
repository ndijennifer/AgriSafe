package com.gradeexporter.data

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

class GradeRepository(context: Context) {
    
    private val prefs: SharedPreferences = context.getSharedPreferences(STORAGE_KEY, Context.MODE_PRIVATE)
    
    companion object {
        private const val STORAGE_KEY = "grade_calc_records_v2"
    }
    
    fun getAllRecords(): List<StudentRecord> {
        val json = prefs.getString(STORAGE_KEY, null) ?: return emptyList()
        return try {
            val array = JSONArray(json)
            (0 until array.length()).map { i ->
                parseRecord(array.getJSONObject(i))
            }
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    fun saveRecord(record: StudentRecord) {
        val records = getAllRecords().toMutableList()
        val existingIndex = records.indexOfFirst { it.id == record.id }
        if (existingIndex >= 0) {
            records[existingIndex] = record
        } else {
            records.add(0, record)
        }
        saveAllRecords(records)
    }
    
    fun updateRecord(record: StudentRecord) {
        val records = getAllRecords().map { if (it.id == record.id) record else it }
        saveAllRecords(records)
    }
    
    fun deleteRecord(id: String) {
        val records = getAllRecords().filter { it.id != id }
        saveAllRecords(records)
    }
    
    private fun saveAllRecords(records: List<StudentRecord>) {
        val array = JSONArray()
        records.forEach { record ->
            array.put(recordToJson(record))
        }
        prefs.edit().putString(STORAGE_KEY, array.toString()).apply()
    }
    
    private fun recordToJson(record: StudentRecord): JSONObject {
        return JSONObject().apply {
            put("id", record.id)
            put("studentName", record.studentName)
            put("studentId", record.studentId)
            put("createdAt", record.createdAt)
            put("courses", JSONArray().apply {
                record.courses.forEach { course ->
                    put(JSONObject().apply {
                        put("id", course.id)
                        put("name", course.name)
                        put("ca", course.ca)
                        put("exam", course.exam)
                    })
                }
            })
        }
    }
    
    private fun parseRecord(json: JSONObject): StudentRecord {
        val coursesArray = json.getJSONArray("courses")
        val courses = (0 until coursesArray.length()).map { i ->
            val courseJson = coursesArray.getJSONObject(i)
            Course(
                id = courseJson.getString("id"),
                name = courseJson.getString("name"),
                ca = courseJson.getDouble("ca"),
                exam = courseJson.getDouble("exam")
            )
        }
        return StudentRecord(
            id = json.getString("id"),
            studentName = json.getString("studentName"),
            studentId = json.getString("studentId"),
            createdAt = json.getString("createdAt"),
            courses = courses
        )
    }
}