@echo off
echo ========================================
echo  VidGrabber Pro - Starting Services
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python tidak ditemukan!
    echo Silakan install Python 3.11+ terlebih dahulu
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js tidak ditemukan!
    echo Silakan install Node.js terlebih dahulu
    pause
    exit /b 1
)

echo [1/4] Checking backend dependencies...
cd backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing/Updating dependencies...
pip install -r requirements.txt --quiet

echo.
echo [2/4] Starting Backend Server...
start "VidGrabber Backend" cmd /k "cd /d %cd% && venv\Scripts\activate.bat && python main.py"

timeout /t 3 /nobreak >nul

cd ..

echo.
echo [3/4] Checking frontend dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
)

echo.
echo [4/4] Starting Frontend Server...
start "VidGrabber Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo  Services Started Successfully!
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to stop all services...
pause >nul

echo.
echo Stopping services...
taskkill /FI "WindowTitle eq VidGrabber Backend*" /T /F >nul 2>&1
taskkill /FI "WindowTitle eq VidGrabber Frontend*" /T /F >nul 2>&1

echo Services stopped.
pause
