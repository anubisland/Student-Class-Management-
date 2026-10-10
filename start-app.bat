@echo off
title Family Class & Activity Manager - Local Server
echo ========================================================
echo   Starting Family Class Manager Server...
echo ========================================================
echo.

cd /d "%~dp0"

:: Check if Python is available
python --version >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Launching local server with Python on http://localhost:8080 ...
    start "" http://localhost:8080
    python -m http.server 8080
    goto end
)

:: Check if Node is available
node -v >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo [OK] Launching local server with Node.js on http://localhost:8080 ...
    start "" http://localhost:8080
    npx -y serve -l 8080 .
    goto end
)

echo [!] Opening directly in Chrome...
start chrome "file:///%~dp0index.html"

:end
