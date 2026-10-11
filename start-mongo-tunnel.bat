@echo off
title MongoDB SSH Tunnel (201.18.212.158)
echo ========================================================
echo   Starting MongoDB SSH Tunnel to FastPanel VPS...
echo   Forwarding local port 27017 to remote MongoDB (201.18.212.158:27017)
echo ========================================================
echo.
echo Local connection string: mongodb://127.0.0.1:27017/t24watches
echo.
echo Press Ctrl+C anytime to stop the tunnel.
echo.

:loop
ssh -o BatchMode=yes -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -N -L 27017:127.0.0.1:27017 root@201.18.212.158
echo Tunnel disconnected. Reconnecting in 3 seconds...
timeout /t 3 /nobreak >nul
goto loop
