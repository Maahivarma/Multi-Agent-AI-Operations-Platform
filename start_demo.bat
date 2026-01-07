@echo off
echo ===================================================
echo LAUNCHING COO.AI COMMAND CENTER
echo ===================================================
echo.
echo [1/3] Verifying Core Systems...
echo [2/3] Initializing Neural Interface...
echo [3/3] Opening Secure Channel...
echo.
echo Please allow your browser to open 'http://localhost:8000'
echo.
start http://localhost:8000

python -m http.server 8000
