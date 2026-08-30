Add-Type -AssemblyName System.Drawing

$sourcePath = "C:\Users\Clayton Almeida\.gemini\antigravity-ide\brain\0ae83ce9-bcc6-40f2-9f1a-725c588bfcda\linecode_app_icon_1788099453890.jpg"
$destRoot = "c:\Users\Clayton Almeida\Documents\antigravity\mysterious-borg"
$publicDir = "$destRoot\public"

if (!(Test-Path $publicDir)) {
    New-Item -ItemType Directory -Path $publicDir -Force | Out-Null
}

$img = [System.Drawing.Image]::FromFile($sourcePath)

# Function to resize image
function Resize-Image($srcImg, $width, $height) {
    $bmp = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bmp)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.DrawImage($srcImg, 0, 0, $width, $height)
    $graphics.Dispose()
    return $bmp
}

# 1. Save High Res PNG
$png512 = Resize-Image $img 512 512
$png512.Save("$destRoot\app-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$png512.Save("$publicDir\app-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$png512.Dispose()

# 2. Build multi-resolution ICO file
$sizes = @(256, 128, 64, 48, 32, 16)
$pngByteArrays = @()

foreach ($size in $sizes) {
    $bmp = Resize-Image $img $size $size
    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $pngByteArrays += ,$ms.ToArray()
    $ms.Dispose()
    $bmp.Dispose()
}

$img.Dispose()

function Build-Ico($pngArrays, $sizeList, $outPath) {
    $fs = [System.IO.File]::Create($outPath)
    $bw = New-Object System.IO.BinaryWriter($fs)
    
    $count = $pngArrays.Count
    # Header: Reserved (0), Type (1 = ICO), Count
    $bw.Write([uint16]0)
    $bw.Write([uint16]1)
    $bw.Write([uint16]$count)
    
    # Calculate initial data offset (Header: 6 bytes + 16 bytes per entry)
    $offset = 6 + (16 * $count)
    
    for ($i = 0; $i -lt $count; $i++) {
        $s = $sizeList[$i]
        $w = if ($s -ge 256) { 0 } else { [byte]$s }
        $h = if ($s -ge 256) { 0 } else { [byte]$s }
        $data = $pngArrays[$i]
        $dataLen = $data.Length
        
        $bw.Write([byte]$w)          # Width
        $bw.Write([byte]$h)          # Height
        $bw.Write([byte]0)           # Color count (0 for 32bpp)
        $bw.Write([byte]0)           # Reserved
        $bw.Write([uint16]1)         # Planes
        $bw.Write([uint16]32)        # Bit count
        $bw.Write([uint32]$dataLen)  # Bytes in resource
        $bw.Write([uint32]$offset)   # Image offset
        
        $offset += $dataLen
    }
    
    # Write image data
    for ($i = 0; $i -lt $count; $i++) {
        $bw.Write($pngArrays[$i])
    }
    
    $bw.Flush()
    $bw.Close()
    $fs.Close()
}

Build-Ico $pngByteArrays $sizes "$destRoot\app-icon.ico"
Build-Ico $pngByteArrays $sizes "$publicDir\favicon.ico"

Write-Output "Successfully generated app-icon.png and app-icon.ico!"
