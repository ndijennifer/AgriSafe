package com.gradeexporter.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import com.gradeexporter.data.Course
import com.gradeexporter.data.GradeCalculator
import com.gradeexporter.data.GradeRepository
import com.gradeexporter.data.StudentRecord

class GradeViewModel(application: Application) : AndroidViewModel(application) {
    
    private val repository = GradeRepository(application)
    
    private val _records = MutableLiveData<List<StudentRecord>>()
    val records: LiveData<List<StudentRecord>> = _records
    
    private val _activeRecord = MutableLiveData<StudentRecord?>()
    val activeRecord: LiveData<StudentRecord?> = _activeRecord
    
    private val _isLoading = MutableLiveData(true)
    val isLoading: LiveData<Boolean> = _isLoading
    
    init {
        loadRecords()
    }
    
    private fun loadRecords() {
        _isLoading.value = true
        _records.value = repository.getAllRecords()
        _isLoading.value = false
    }
    
    fun setActiveRecord(record: StudentRecord?) {
        _activeRecord.value = record
    }
    
    fun addRecord(record: StudentRecord) {
        repository.saveRecord(record)
        _records.value = repository.getAllRecords()
    }
    
    fun updateRecord(record: StudentRecord) {
        repository.updateRecord(record)
        _records.value = repository.getAllRecords()
        if (_activeRecord.value?.id == record.id) {
            _activeRecord.value = record
        }
    }
    
    fun deleteRecord(id: String) {
        repository.deleteRecord(id)
        _records.value = repository.getAllRecords()
        if (_activeRecord.value?.id == id) {
            _activeRecord.value = null
        }
    }
    
    fun computeOverallAverage(courses: List<Course>): Double {
        return GradeCalculator.computeOverallAverage(courses)
    }
    
    fun determineGrade(average: Double): String {
        return GradeCalculator.determineGrade(average)
    }
}