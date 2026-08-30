@echo off
title LineCode IDLE Launcher
cd /d "%~dp0"

echo ========================================================
echo               LineCode IDLE Launcher                    
echo ========================================================
echo Starting server and launching browser...

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1"
