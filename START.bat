@echo off
title Accord Events Registration System
color 0A

echo.
echo ===============================================
echo    🎫 ACCORD EVENTS REGISTRATION SYSTEM
echo ===============================================
echo.
echo Made with ❤️ by Mostafa Tarek ElFar
echo.

echo 🚀 Starting the registration system...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed on this computer.
    echo.
    echo Please install Python from: https://python.org
    echo Then run this file again.
    echo.
    pause
    exit /b 1
)

echo ✅ Python found! Starting server...
echo.

REM Start the server
cd /d "%~dp0"
python -m http.server 8000

echo.
echo 🛑 Server stopped.
pause 