$workspace = "C:\Users\Clayton Almeida\Documents\antigravity\mysterious-borg"
$desktop = [System.Environment]::GetFolderPath('Desktop')
$targetVbs = "$workspace\launch.vbs"
$appUrl = "http://localhost:3000/linecode-idle/"
$wsh = New-Object -ComObject WScript.Shell

# Built-in icon: imageres.dll index 97 = lightbulb (fitting for a learning/practice app)
$builtinIcon = "$env:SystemRoot\system32\imageres.dll, 97"

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

# 3. Desktop .URL Direct Browser Shortcut (built-in icon)
$iconFile = "$env:SystemRoot\system32\imageres.dll"
$urlContent = @"
[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,0
[InternetShortcut]
IDList=
URL=$appUrl
IconFile=$iconFile
IconIndex=97
"@

[System.IO.File]::WriteAllText("$desktop\LineCode IDLE (Browser Link).url", $urlContent, [System.Text.Encoding]::ASCII)
[System.IO.File]::WriteAllText("$workspace\LineCode IDLE (Browser Link).url", $urlContent, [System.Text.Encoding]::ASCII)

Write-Output "Shortcuts created successfully with built-in lightbulb icon!"
