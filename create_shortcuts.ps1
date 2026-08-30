$workspace = "C:\Users\Clayton Almeida\Documents\antigravity\mysterious-borg"
$desktop = [System.Environment]::GetFolderPath('Desktop')
$targetVbs = "$workspace\launch.vbs"
$iconPath = "$workspace\app-icon.ico"
$appUrl = "http://localhost:3000/linecode-idle/"
$wsh = New-Object -ComObject WScript.Shell

# 1. Desktop .LNK App Shortcut (Auto-starts server + opens browser silently)
$desktopLnk = $wsh.CreateShortcut("$desktop\LineCode IDLE.lnk")
$desktopLnk.TargetPath = "wscript.exe"
$desktopLnk.Arguments = "`"$targetVbs`""
$desktopLnk.WorkingDirectory = $workspace
$desktopLnk.IconLocation = "$iconPath, 0"
$desktopLnk.Description = "Start Server and Open LineCode IDLE in Browser"
$desktopLnk.WindowStyle = 7 # Minimized/Hidden
$desktopLnk.Save()

# 2. Workspace .LNK App Shortcut
$wsLnk = $wsh.CreateShortcut("$workspace\LineCode IDLE.lnk")
$wsLnk.TargetPath = "wscript.exe"
$wsLnk.Arguments = "`"$targetVbs`""
$wsLnk.WorkingDirectory = $workspace
$wsLnk.IconLocation = "$iconPath, 0"
$wsLnk.Description = "Start Server and Open LineCode IDLE in Browser"
$wsLnk.WindowStyle = 7
$wsLnk.Save()

# 3. Desktop .URL Direct Browser Shortcut
$urlContent = @"
[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,0
[InternetShortcut]
IDList=
URL=$appUrl
IconFile=$iconPath
IconIndex=0
"@

[System.IO.File]::WriteAllText("$desktop\LineCode IDLE (Browser Link).url", $urlContent, [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText("$workspace\LineCode IDLE (Browser Link).url", $urlContent, [System.Text.Encoding]::ASCII)

Write-Output "Shortcuts created successfully on Desktop and Workspace!"
