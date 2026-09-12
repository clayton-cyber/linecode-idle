$workspace = "C:\Users\Clayton Almeida\Documents\antigravity\mysterious-borg"
$desktop = [System.Environment]::GetFolderPath('Desktop')
$targetVbs = "$workspace\launch.vbs"
$appUrl = "http://localhost:3000/linecode-idle/"
$wsh = New-Object -ComObject WScript.Shell

# shell32.dll index 14 = computer/monitor icon (reliable across all Windows 10/11 versions)
$builtinIcon = "$env:SystemRoot\system32\shell32.dll, 14"

# 1. Desktop .LNK App Shortcut (Auto-starts server + opens browser silently)
$desktopLnk = $wsh.CreateShortcut("$desktop\LineCode IDLE.lnk")
$desktopLnk.TargetPath = "wscript.exe"
$desktopLnk.Arguments = "`"$targetVbs`""
$desktopLnk.WorkingDirectory = $workspace
$desktopLnk.IconLocation = $builtinIcon
$desktopLnk.Description = "Start Server and Open LineCode IDLE in Browser"
$desktopLnk.WindowStyle = 7 # Minimized/Hidden
$desktopLnk.Save()

# 2. Workspace .LNK App Shortcut
$wsLnk = $wsh.CreateShortcut("$workspace\LineCode IDLE.lnk")
$wsLnk.TargetPath = "wscript.exe"
$wsLnk.Arguments = "`"$targetVbs`""
$wsLnk.WorkingDirectory = $workspace
$wsLnk.IconLocation = $builtinIcon
$wsLnk.Description = "Start Server and Open LineCode IDLE in Browser"
$wsLnk.WindowStyle = 7
$wsLnk.Save()

# 3. Desktop .URL Direct Browser Shortcut
$iconFile = "$env:SystemRoot\system32\shell32.dll"
$urlContent = "[{000214A0-0000-0000-C000-000000000046}]`r`nProp3=19,0`r`n[InternetShortcut]`r`nIDList=`r`nURL=$appUrl`r`nIconFile=$iconFile`r`nIconIndex=14`r`n"
[System.IO.File]::WriteAllText("$desktop\LineCode IDLE (Browser Link).url", $urlContent, [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText("$workspace\LineCode IDLE (Browser Link).url", $urlContent, [System.Text.Encoding]::ASCII)

# Force-clear Windows icon cache so the new icon appears immediately
Write-Output "Clearing icon cache..."
Stop-Process -Name explorer -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 500

$iconCacheDir = "$env:LOCALAPPDATA\Microsoft\Windows\Explorer"
Get-ChildItem -Path $iconCacheDir -Filter "iconcache*" -ErrorAction SilentlyContinue |
    Remove-Item -Force -ErrorAction SilentlyContinue

# Restart Explorer
Start-Process explorer.exe
Start-Sleep -Milliseconds 800

Write-Output "Done! Shortcuts created with shell32.dll monitor icon."
