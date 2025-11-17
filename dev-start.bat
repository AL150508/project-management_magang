@echo off
echo Mencari proses yang menggunakan port 3000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do (
    echo Menghentikan proses PID: %%a
    taskkill /PID %%a /F >nul 2>&1
)
echo Port 3000 sudah dibersihkan!
echo.
echo Memulai development server...
npm run dev
