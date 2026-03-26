# 淇 Vue 鏂囦欢涓枃涔辩爜鐨?PowerShell 鑴氭湰
# 灏?UTF-16LE 缂栫爜鐨勬枃浠惰浆鎹负 UTF-8

param(
    [string]$ProjectPath = "E:\vibecoding\TimeVoyager",
    [switch]$Verbose
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$vueFiles = Get-ChildItem "$ProjectPath\src" -Filter *.vue -Recurse
$successFiles = @()
$failedFiles = @()
$alreadyUtf8 = 0

foreach ($file in $vueFiles) {
    if ($Verbose) { Write-Host "澶勭悊鏂囦欢锛?($file.Name)" -ForegroundColor Cyan }
    
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        
        # 妫€鏌ユ槸鍚︿负 UTF-16LE (BOM: FF FE)
        if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
            $utf16LE = [System.Text.Encoding]::Unicode
            $content = $utf16LE.GetString($bytes)
            
            $utf8NoBOM = New-Object System.Text.UTF8Encoding $false
            $utf8Bytes = $utf8NoBOM.GetBytes($content)
            [System.IO.File]::WriteAllBytes($file.FullName, $utf8Bytes)
            
            Write-Host "  宸蹭慨澶嶏細$($file.Name) (UTF-16LE -> UTF-8)" -ForegroundColor Green
            $successFiles += $file.Name
        } else {
            # 楠岃瘉鏄惁涓烘湁鏁?UTF-8
            try {
                $content = [System.Text.Encoding]::UTF8.GetString($bytes)
                if ($content -match '[\u4e00-\u9fff]') {
                    if ($Verbose) { Write-Host "  宸叉纭細$($file.Name) (UTF-8)" -ForegroundColor Gray }
                    $alreadyUtf8++
                }
            } catch {
                Write-Host "  缂栫爜閿欒锛?($file.Name)" -ForegroundColor Red
                $failedFiles += $file.Name
            }
        }
    }
    catch {
        Write-Host "  澶勭悊澶辫触锛?($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $failedFiles += $file.Name
    }
}

Write-Host "`n========================================" -ForegroundColor White
Write-Host "缂栫爜妫€鏌ュ畬鎴愶紒" -ForegroundColor White
Write-Host "========================================" -ForegroundColor White
Write-Host "宸叉槸 UTF-8: $alreadyUtf8 涓枃浠? -ForegroundColor Green
Write-Host "宸蹭慨澶嶏細$($successFiles.Count) 涓枃浠? -ForegroundColor Green
Write-Host "澶辫触锛?($failedFiles.Count) 涓枃浠? -ForegroundColor Red

if ($failedFiles.Count -gt 0) {
    Write-Host "`n澶辫触鐨勬枃浠?" -ForegroundColor Red
    foreach ($f in $failedFiles) {
        Write-Host "  - $f"
    }
}

exit 0
