<#
.SYNOPSIS
    Starts an SSH tunnel to forward remote MongoDB (201.18.212.158:27017) to local port 27017 with keepalive and auto-reconnect.
#>
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting MongoDB SSH Tunnel to FastPanel VPS..." -ForegroundColor Cyan
Write-Host "  Forwarding local port 27017 -> 201.18.212.158:27017" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "`nLocal connection string: mongodb://127.0.0.1:27017/t24watches" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to close the tunnel.`n" -ForegroundColor Yellow

while ($true) {
    ssh -o BatchMode=yes -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -N -L 27017:127.0.0.1:27017 root@201.18.212.158
    Write-Host "Tunnel disconnected. Reconnecting in 3 seconds..." -ForegroundColor DarkYellow
    Start-Sleep -Seconds 3
}
