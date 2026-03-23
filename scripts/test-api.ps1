$ApiKey = "sk-6fc1753c6d4f48e39bf21de6ee5d4c24"

# Test different header formats
$TestConfigs = @(
    @{
        Name = "DashScope Standard"
        Endpoint = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-image/generation"
        Headers = @{
            "Authorization" = "Bearer $ApiKey"
            "Content-Type" = "application/json"
        }
        Body = @{
            model = "wanx2.0-t2i-turbo"
            input = @{
                prompt = "pixel art cat"
            }
            parameters = @{
                size = "1024x1024"
            }
        } | ConvertTo-Json -Depth 10
    },
    @{
        Name = "DashScope with X-DashScope-Async"
        Endpoint = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-image/generation"
        Headers = @{
            "Authorization" = "Bearer $ApiKey"
            "Content-Type" = "application/json"
            "X-DashScope-Async" = "enable"
        }
        Body = @{
            model = "wanx2.0-t2i-turbo"
            input = @{
                prompt = "pixel art cat"
            }
            parameters = @{
                size = "1024x1024"
            }
        } | ConvertTo-Json -Depth 10
    },
    @{
        Name = "Bailian OpenAPI"
        Endpoint = "https://bailian.aliyuncs.com/openapi/v1/models/wanx2.0-t2i-turbo/generate-image"
        Headers = @{
            "Authorization" = "Bearer $ApiKey"
            "Content-Type" = "application/json"
            "X-Acs-AccessKeyId" = $ApiKey
        }
        Body = @{
            Prompt = "pixel art cat"
            Size = "1024x1024"
            NumImages = 1
        } | ConvertTo-Json -Depth 10
    }
)

foreach ($Config in $TestConfigs) {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Testing: $($Config.Name)" -ForegroundColor Yellow
    Write-Host "Endpoint: $($Config.Endpoint)" -ForegroundColor Gray
    Write-Host ""
    
    try {
        $Response = Invoke-RestMethod -Uri $Config.Endpoint -Method Post -Headers $Config.Headers -Body $Config.Body
        Write-Host "Response:" -ForegroundColor Green
        Write-Host ($Response | ConvertTo-Json -Depth 10) -ForegroundColor Cyan
        
        if ($Response.output -or $Response.Data) {
            Write-Host ">>> SUCCESS! <<<" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "Failed:" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host $_.ErrorDetails.Message -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    Start-Sleep -Seconds 2
}
