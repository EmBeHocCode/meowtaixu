param(
  [string]$Source = "public/assets/xianxia/logo/logo-main.png",
  [string]$WordmarkSource = "public/assets/xianxia/logo/logo-as.png",
  [string]$OutputDirectory = "public/assets/xianxia/logo"
)

Add-Type -AssemblyName System.Drawing

$sourcePath = (Resolve-Path -LiteralPath $Source).Path
$outputPath = (Resolve-Path -LiteralPath $OutputDirectory).Path
$sourceImage = [System.Drawing.Bitmap]::FromFile($sourcePath)

try {
  $left = $sourceImage.Width
  $top = $sourceImage.Height
  $right = 0
  $bottom = 0

  for ($y = 0; $y -lt $sourceImage.Height; $y += 2) {
    for ($x = 0; $x -lt $sourceImage.Width; $x += 2) {
      if ($sourceImage.GetPixel($x, $y).A -gt 8) {
        if ($x -lt $left) { $left = $x }
        if ($x -gt $right) { $right = $x }
        if ($y -lt $top) { $top = $y }
        if ($y -gt $bottom) { $bottom = $y }
      }
    }
  }

  if ($right -le $left -or $bottom -le $top) {
    throw "No visible pixels found in $Source"
  }

  $crop = [System.Drawing.Rectangle]::FromLTRB($left, $top, $right + 2, $bottom + 2)
  $outputs = @(
    @{ Name = "logo-web.png"; Size = 256; Padding = 12 },
    @{ Name = "apple-touch-icon.png"; Size = 180; Padding = 10 },
    @{ Name = "favicon-192.png"; Size = 192; Padding = 10 },
    @{ Name = "favicon-32.png"; Size = 32; Padding = 2 },
    @{ Name = "favicon-16.png"; Size = 16; Padding = 1 }
  )

  foreach ($output in $outputs) {
    $canvas = New-Object System.Drawing.Bitmap($output.Size, $output.Size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    try {
      $graphics = [System.Drawing.Graphics]::FromImage($canvas)
      try {
        $graphics.Clear([System.Drawing.Color]::Transparent)
        $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

        $available = $output.Size - (2 * $output.Padding)
        $scale = [Math]::Min($available / $crop.Width, $available / $crop.Height)
        $drawWidth = [Math]::Round($crop.Width * $scale)
        $drawHeight = [Math]::Round($crop.Height * $scale)
        $drawX = [Math]::Round(($output.Size - $drawWidth) / 2)
        $drawY = [Math]::Round(($output.Size - $drawHeight) / 2)
        $destination = New-Object System.Drawing.Rectangle($drawX, $drawY, $drawWidth, $drawHeight)
        $graphics.DrawImage($sourceImage, $destination, $crop, [System.Drawing.GraphicsUnit]::Pixel)
      } finally {
        $graphics.Dispose()
      }
      $canvas.Save((Join-Path $outputPath $output.Name), [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
      $canvas.Dispose()
    }
  }
} finally {
  $sourceImage.Dispose()
}

$wordmarkPath = (Resolve-Path -LiteralPath $WordmarkSource).Path
$wordmarkImage = [System.Drawing.Bitmap]::FromFile($wordmarkPath)
try {
  $left = $wordmarkImage.Width
  $top = $wordmarkImage.Height
  $right = 0
  $bottom = 0
  for ($y = 0; $y -lt $wordmarkImage.Height; $y += 2) {
    for ($x = 0; $x -lt $wordmarkImage.Width; $x += 2) {
      if ($wordmarkImage.GetPixel($x, $y).A -gt 8) {
        if ($x -lt $left) { $left = $x }
        if ($x -gt $right) { $right = $x }
        if ($y -lt $top) { $top = $y }
        if ($y -gt $bottom) { $bottom = $y }
      }
    }
  }

  $crop = [System.Drawing.Rectangle]::FromLTRB($left, $top, $right + 2, $bottom + 2)
  $canvas = New-Object System.Drawing.Bitmap(600, 200, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($canvas)
    try {
      $graphics.Clear([System.Drawing.Color]::Transparent)
      $graphics.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
      $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
      $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
      $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
      $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
      $availableWidth = 576
      $availableHeight = 176
      $scale = [Math]::Min($availableWidth / $crop.Width, $availableHeight / $crop.Height)
      $drawWidth = [Math]::Round($crop.Width * $scale)
      $drawHeight = [Math]::Round($crop.Height * $scale)
      $drawX = [Math]::Round((600 - $drawWidth) / 2)
      $drawY = [Math]::Round((200 - $drawHeight) / 2)
      $destination = New-Object System.Drawing.Rectangle($drawX, $drawY, $drawWidth, $drawHeight)
      $graphics.DrawImage($wordmarkImage, $destination, $crop, [System.Drawing.GraphicsUnit]::Pixel)
    } finally {
      $graphics.Dispose()
    }
    $canvas.Save((Join-Path $outputPath "logo-header.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $canvas.Dispose()
  }
} finally {
  $wordmarkImage.Dispose()
}
