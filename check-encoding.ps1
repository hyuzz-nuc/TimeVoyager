# 检查项目文件编码
# 用法：.\check-encoding.ps1

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectPath = "E:\vibecoding\TimeVoyager"
$files = Get-ChildItem "$ProjectPath\src" -Include *.vue,*.js,*.ts -Recurse

$utf8Count = 0
$utf16Count = 0
$otherCount = 0

foreach ($file in $files) {
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    
    if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
        Write-Host "UTF-16LE: $($file.Name)" -ForegroundColor Yellow
        $utf16Count++
    } elseif ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Write-Host "UTF-8-BOM: $($file.Name)" -ForegroundColor Gray
        $utf8Count++
    } else {
        try {
            $content = [System.Text.Encoding]::UTF8.GetString($bytes)
            if ($content -match '[\u4e00-\u9fff]') {
                Write-Host "UTF-8 (中文): $($file.Name)" -ForegroundColor Green
            }
            $utf8Count++
        } catch {
            Write-Host "未知编码：$($file.Name)" -ForegroundColor Red
            $otherCount++
        }
    }
}

Write-Host "`n统计:" -ForegroundColor Cyan
Write-Host "  UTF-8: $utf8Count" -ForegroundColor Green
Write-Host "  UTF-16LE: $utf16Count" -ForegroundColor Yellow
Write-Host "  其他：$otherCount" -ForegroundColor Red
