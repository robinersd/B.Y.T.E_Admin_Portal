@echo off
title B.Y.T.E 2.0 - Cloudflare Online Tunnel
cd /d "%~dp0"

echo ===================================================
echo     Starting B.Y.T.E 2.0 Cloudflare Online Tunnel
echo ===================================================
echo.
python start_tunnel.py
pause
