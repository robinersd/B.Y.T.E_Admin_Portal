@echo off
title B.Y.T.E. Admin Portal Local Server
echo ====================================================
echo       B.Y.T.E. ADMIN PORTAL LOCAL SERVER
echo ====================================================
echo.
echo Starting local web server at http://localhost:8000 ...
echo To access from your phone, connect to same Wi-Fi and use your PC's IP address or DevTunnel.
echo.
start "" "http://localhost:8000"
python "%~dp0serve.py"
pause
