@echo off
echo ============================================
echo   Media Toolkit - Setup
echo ============================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Get it from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js found
node --version
echo.

echo Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)
echo [OK] Dependencies installed.

if not exist "bin" mkdir bin

where yt-dlp >nul 2>nul
if %errorlevel% neq 0 (
    if not exist "bin\yt-dlp.exe" (
        echo.
        echo [NOTE] yt-dlp not found — YouTube downloads won't work.
        echo Download from: https://github.com/yt-dlp/yt-dlp/releases
        echo Place yt-dlp.exe in the "bin" folder.
    )
)

echo.
echo ============================================
echo   Done! Run: npm start
echo   Build:    npm run build
echo ============================================
pause
