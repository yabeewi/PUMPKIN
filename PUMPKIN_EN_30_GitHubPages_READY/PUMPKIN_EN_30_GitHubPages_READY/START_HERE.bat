@echo off
setlocal
cd /d "%~dp0"
title Halloween Pumpkin Hunt v5.0 EN 30

echo ================================================
echo  Halloween Pumpkin Hunt v5.0 - English / 30
echo ================================================
echo.
echo Website folder:
echo %CD%
echo.
echo Opening http://localhost:8000/
echo Keep this window open while testing.
echo.
start "" "http://localhost:8000/"
python -m http.server 8000

if errorlevel 1 (
  echo.
  echo Python command failed. Trying py launcher...
  py -m http.server 8000
)
endlocal
