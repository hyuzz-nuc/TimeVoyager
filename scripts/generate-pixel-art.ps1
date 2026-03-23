# TimeVoyager Pixel Art Generator
# Using Aliyun Wanx API

param(
    [string]$ApiKey = "sk-6fc1753c6d4f48e39bf21de6ee5d4c24",
    [string]$OutputDir = "E:\vibecoding\TimeVoyager\src\assets\pixel"
)

# API Config - Text to Image
$ApiEndpoint = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-to-image/generation"
$Model = "wanx2.0-t2i-turbo"

# Spirit Prompts
$SpiritPrompts = @(
    @{
        Name = "spirit_base_blue"
        Prompt = "pixel art, cute space spirit creature, floating ethereal being, star-shaped body, gentle glow, blue and purple color palette, game asset, retro style, white background"
        SubDir = "spirits"
    },
    @{
        Name = "spirit_fire"
        Prompt = "pixel art, cute fire spirit creature, floating ethereal being, flame effects, red and orange color palette, game asset, retro style, white background"
        SubDir = "spirits"
    },
    @{
        Name = "spirit_water"
        Prompt = "pixel art, cute water spirit creature, floating ethereal being, water droplets, blue and cyan color palette, game asset, retro style, white background"
        SubDir = "spirits"
    },
    @{
        Name = "spirit_wood"
        Prompt = "pixel art, cute nature spirit creature, floating ethereal being, leaf details, green and brown color palette, game asset, retro style, white background"
        SubDir = "spirits"
    },
    @{
        Name = "spirit_thunder"
        Prompt = "pixel art, cute thunder spirit creature, floating ethereal being, lightning effects, yellow and purple color palette, game asset, retro style, white background"
        SubDir = "spirits"
    },
    @{
        Name = "spirit_dark"
        Prompt = "pixel art, cute dark spirit creature, floating ethereal being, shadow effects, dark purple and black color palette, game asset, retro style, white background"
        SubDir = "spirits"
    },
    @{
        Name = "spirit_light"
        Prompt = "pixel art, cute light spirit creature, floating ethereal being, radiant glow, gold and white color palette, game asset, retro style, white background"
        SubDir = "spirits"
    }
)

# Currency Prompts
$CurrencyPrompts = @(
    @{
        Name = "crystal_amber"
        Prompt = "pixel art crystal, glowing energy gem, amber and blue gradient, faceted shape, game currency icon, clean pixel style, white background"
        SubDir = "currency"
    }
)

# Achievement Prompts
$AchievementPrompts = @(
    @{
        Name = "achievement_beginner"
        Prompt = "pixel art icon, achievement badge, beginner medal, simple design, gold and blue colors, game UI icon, white background"
        SubDir = "icons"
    },
    @{
        Name = "achievement_master"
        Prompt = "pixel art icon, achievement badge, master trophy, elaborate design, gold and blue colors, game UI icon, white background"
        SubDir = "icons"
    },
    @{
        Name = "achievement_runner"
        Prompt = "pixel art icon, achievement badge, running shoes, footprints, gold and blue colors, game UI icon, white background"
        SubDir = "icons"
    },
    @{
        Name = "achievement_explorer"
        Prompt = "pixel art icon, achievement badge, spaceship, planet exploration, gold and blue colors, game UI icon, white background"
        SubDir = "icons"
    },
    @{
        Name = "achievement_warrior"
        Prompt = "pixel art icon, achievement badge, warrior battle helmet, gold and blue colors, game UI icon, white background"
        SubDir = "icons"
    }
)

# Battle Background Prompts
$BattlePrompts = @(
    @{
        Name = "battle_arena"
        Prompt = "pixel art battle scene, space arena background, dark blue starry sky, floating platforms, retro game style, 16-bit aesthetic, clean pixels, game background"
        SubDir = "battle"
    },
    @{
        Name = "battle_nebula"
        Prompt = "pixel art battle scene, nebula clouds background, purple and pink space, retro game style, 16-bit aesthetic, clean pixels, game background"
        SubDir = "battle"
    }
)

# Merge All Prompts
$AllPrompts = $SpiritPrompts + $CurrencyPrompts + $AchievementPrompts + $BattlePrompts

# Create Directory
function Ensure-Directory {
    param([string]$Path)
    if (!(Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
        Write-Host "Created directory: $Path" -ForegroundColor Green
    }
}

# Call Wanx API
function Invoke-WanxAPI {
    param(
        [string]$Prompt,
        [string]$OutputPath,
        [string]$ApiKey
    )
    
    $Headers = @{
        "Authorization" = "Bearer $ApiKey"
        "Content-Type" = "application/json"
    }
    
    # Correct API format for wanx
    $Body = @{
        model = $Model
        input = @{
            prompt = $Prompt
        }
        parameters = @{
            size = "1024x1024"
            style = "<auto>"
            n = 1
        }
    } | ConvertTo-Json -Depth 10
    
    Write-Host "  Sending request..." -ForegroundColor Yellow
    Write-Host "  Prompt: $Prompt" -ForegroundColor Gray
    
    try {
        $Response = Invoke-RestMethod -Uri $ApiEndpoint -Method Post -Headers $Headers -Body $Body
        
        Write-Host "  Response: $($Response | ConvertTo-Json -Depth 5)" -ForegroundColor Cyan
        
        if ($Response.output -and $Response.output.url) {
            $ImageUrl = $Response.output.url
            Write-Host "  Image URL: $ImageUrl" -ForegroundColor Cyan
            
            Invoke-WebRequest -Uri $ImageUrl -OutFile $OutputPath
            Write-Host "  Saved to: $OutputPath" -ForegroundColor Green
            return $true
        } elseif ($Response.output -and $Response.output.task_id) {
            $TaskId = $Response.output.task_id
            Write-Host "  Task ID: $TaskId (async)" -ForegroundColor Cyan
            
            $StatusUrl = "https://dashscope.aliyuncs.com/api/v1/tasks/$TaskId"
            $MaxRetries = 30
            $RetryCount = 0
            
            while ($RetryCount -lt $MaxRetries) {
                Start-Sleep -Seconds 2
                $StatusResponse = Invoke-RestMethod -Uri $StatusUrl -Method Get -Headers $Headers
                
                Write-Host "  Status: $($StatusResponse.output.task_status)" -ForegroundColor Yellow
                
                if ($StatusResponse.output -and $StatusResponse.output.url) {
                    $ImageUrl = $StatusResponse.output.url
                    Write-Host "  Image URL: $ImageUrl" -ForegroundColor Cyan
                    
                    Invoke-WebRequest -Uri $ImageUrl -OutFile $OutputPath
                    Write-Host "  Saved to: $OutputPath" -ForegroundColor Green
                    return $true
                } elseif ($StatusResponse.output -and $StatusResponse.output.task_status -eq "FAILED") {
                    Write-Host "  Task failed: $($StatusResponse.output.message)" -ForegroundColor Red
                    return $false
                }
                
                $RetryCount++
            }
            
            Write-Host "  Task timeout" -ForegroundColor Red
            return $false
        } else {
            Write-Host "  Unexpected response format" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $false
    }
}

# Main Function
function Main {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "TimeVoyager Pixel Art Generator" -ForegroundColor Cyan
    Write-Host "Model: $Model" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    Ensure-Directory "$OutputDir\spirits"
    Ensure-Directory "$OutputDir\icons"
    Ensure-Directory "$OutputDir\currency"
    Ensure-Directory "$OutputDir\battle"
    Ensure-Directory "$OutputDir\tiles"
    
    $SuccessCount = 0
    $FailCount = 0
    
    foreach ($Item in $AllPrompts) {
        $OutputPath = Join-Path $OutputDir "$($Item.SubDir)\$($Item.Name).png"
        
        Write-Host ""
        Write-Host "Generating: $($Item.Name)" -ForegroundColor Magenta
        
        $Result = Invoke-WanxAPI -Prompt $Item.Prompt -OutputPath $OutputPath -ApiKey $ApiKey
        
        if ($Result) {
            $SuccessCount++
        } else {
            $FailCount++
        }
        
        # Rate limit
        Start-Sleep -Seconds 3
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Generation Complete!" -ForegroundColor Green
    Write-Host "Success: $SuccessCount" -ForegroundColor Green
    Write-Host "Failed: $FailCount" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Cyan
}

# Execute
Main
