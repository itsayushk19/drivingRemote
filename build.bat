@echo off
REM Build script for DrivingRemote on Windows

echo ========================================
echo Building DrivingRemote Executable
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python not found. Please install Python 3.8+ first.
    exit /b 1
)

REM Run the build script
python build_exe.py

if errorlevel 1 (
    echo.
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Build completed successfully!
echo.
pause
