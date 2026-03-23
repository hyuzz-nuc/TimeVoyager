@echo off
chcp 65001 >nul
echo ========================================
echo   TimeVoyager - 时光旅行者
echo   快速启动脚本
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 错误：未检测到 Node.js
    echo 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js 已安装

echo.
echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖（约 1-2 分钟）...
    echo.
    call npm install --registry=https://registry.npmmirror.com
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
) else (
    echo ✅ 依赖已安装
)

echo.
echo [3/3] 启动开发服务器...
echo.
echo 🚀 正在启动...
echo 📍 访问地址：http://localhost:5173
echo 💡 按 Ctrl+C 停止服务
echo.

call npm run dev

pause
