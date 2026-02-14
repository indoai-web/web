@echo off
echo ========================================
echo   INDO AI - Starting Development Server
echo ========================================
echo.

REM Change to the project directory
cd /d "%~dp0"

echo [1/3] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found: 
node --version
echo.

echo [2/3] Starting Next.js development server...
echo Server will start at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the development server and open browser after 5 seconds
start /B cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"

REM Run the development server
npm run dev

pause
