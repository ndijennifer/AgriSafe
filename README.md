AgriSafe -- A Smart and Secure Farming Assistant

An Android application empowering rural farmers in Cameroon to log farming activities, monitor crop health, and stay protected from marketplace scams.

 Project Overview
AgriSafe is a high-impact Android application designed to empower rural farmers in Cameroon. Many farmers face challenges such as unreliable internet access, difficulty tracking daily activities, and vulnerability to marketplace scams. AgriSafe addresses these issues by providing a simple, offline-first mobile solution that leverages the sensors already built into smartphones.

 Key Features
•	Daily Activity Logging: Farmers can record tasks quickly, even offline.
•	Crop Health Monitoring: Using the CameraX API, farmers capture crop images that can be analyzed with ML Kit/TensorFlow Lite for early signs of disease.
•	Farm Mapping: GPS/Location Services tag and visualize farm plots, helping farmers track their land.
•	Gesture-Based Logging: The Accelerometer (SensorManager) allows farmers to log activities with simple phone shakes.
•	Voice Notes: Hands-free recording with MediaRecorder API makes it easy to capture observations in the field.
•	Marketplace Scam Detection: The app analyzes incoming messages and alerts farmers to suspicious content, protecting them from fraudulent buyers and suppliers.
•	Offline Storage: Data is stored locally with Room/SQLite, ensuring full functionality without internet, and syncs when connectivity returns.
•	Reliability: Automated testing with JUnit and Espresso ensures the app remains stable and trustworthy.

 Sensors Used
Sensor	API Used	Purpose
Camera	CameraX API	Crop photo capture and disease monitoring
GPS	Location Services	Farm plot mapping and activity tagging
Accelerometer	SensorManager	Shake-to-log farming activities
Microphone	MediaRecorder API	Hands-free voice note recording

 Tech Stack
Component	Technology
Language	Kotlin
IDE	Android Studio
Database	Room (SQLite)
Machine Learning	ML Kit / TensorFlow Lite
Unit Testing	JUnit
UI Testing	Espresso
Weather Data	OpenWeatherMap API


 Team Structure
Role	Responsibility
Lead Developer	Core features, sensor integrations, UI design, API connections
QA Developer	Automated unit and UI testing using JUnit and Espresso


 Impact
AgriSafe is more than a technical project, it's a tool for resilience. By combining accessible mobile technology with offline reliability, it helps farmers protect their crops, organize their work, and avoid scams, ultimately strengthening food security and livelihoods in rural communities.

Project Status
 In Development.

