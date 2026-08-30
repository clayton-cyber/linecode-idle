$port = 3000
$url = "http://localhost:$port/linecode-idle/"
$workspace = "C:\Users\Clayton Almeida\Documents\antigravity\mysterious-borg"

Set-Location $workspace

function Test-ServerReady {
    param([string]$targetUrl)
    try {
        $req = [System.Net.WebRequest]::Create($targetUrl)
        $req.Timeout = 800
        $req.Method = "HEAD"
        $resp = $req.GetResponse()
        $status = [int]$resp.StatusCode
        $resp.Close()
        return ($status -ge 200 -and $status -lt 400)
    } catch {
        return $false
    }
}

# 1. Check if server is already responding
if (-not (Test-ServerReady -targetUrl $url)) {
    # Start the Vite development server in the background
    Start-Process -FilePath "node.exe" -ArgumentList ".\node_modules\vite\bin\vite.js" -WorkingDirectory $workspace -WindowStyle Hidden
    
    # Wait until the dev server is active and responding (up to 15 seconds)
    $maxWaitSec = 15
    $startTime = Get-Date
    while (-not (Test-ServerReady -targetUrl $url) -and ((Get-Date) - $startTime).TotalSeconds -lt $maxWaitSec) {
        Start-Sleep -Milliseconds 250
    }
}

# 2. Open the application in the user's default browser
Start-Process $url
