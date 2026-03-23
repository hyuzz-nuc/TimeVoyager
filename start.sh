#!/bin/bash

echo "========================================"
echo "  TimeVoyager - 时光旅行者"
echo "  快速启动脚本 (macOS/Linux)"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/3] 检查 Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未检测到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js 已安装 ($(node --version))"

echo ""
echo "[2/3] 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖（约 1-2 分钟）..."
    echo ""
    npm install --registry=https://registry.npmmirror.com
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

echo ""
echo "[3/3] 启动开发服务器..."
echo ""
echo "🚀 正在启动..."
echo "📍 访问地址：http://localhost:5173"
echo "💡 按 Ctrl+C 停止服务"
echo ""

npm run dev
