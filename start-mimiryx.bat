@echo off
title Launching MIMIRYX Neural Knowledge Network...
echo ========================================================
echo  MIMIRYX - Neural Knowledge Network (Standalone)
echo ========================================================
echo Starting local web server...
cd /d "%~dp0"
start http://localhost:5173
npm run dev
pause
