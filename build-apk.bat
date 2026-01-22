@echo off
echo Building APK from repository source...

REM Set paths
set REPO_DIR=C:\Users\melwa\OneDrive\Documents\GitHub\Student-Class-Management-
set BUILD_DIR=C:\temp\build-student-app
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk

REM Clean up previous build directory
if exist "%BUILD_DIR%" rmdir /s /q "%BUILD_DIR%"

REM Create build directory
mkdir "%BUILD_DIR%"

REM Copy source files from repository
xcopy "%REPO_DIR%\mobile-app" "%BUILD_DIR%\mobile-app" /e /i /h /k

REM Navigate to build directory
cd /d "%BUILD_DIR%\mobile-app"

REM Install dependencies
call npm install

REM Install metro dependencies if not present
call npm install @react-native/metro-config metro-config

REM Build APK
cd android
call gradlew.bat clean assembleRelease

REM Copy APK back to repository
if exist "app\build\outputs\apk\release\app-release.apk" (
    copy "app\build\outputs\apk\release\app-release.apk" "%REPO_DIR%\app-release.apk"
    echo APK successfully built and copied to repository!
) else (
    echo APK build failed!
)

pause