#!/bin/bash

echo "🚀 Iniciando Cavalo Paraguayo Tactics..."
echo "📦 Instalando dependências..."

# Instalar dependências se não existirem
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

echo "🔧 Iniciando backend com live reload..."
echo "🌐 Iniciando frontend..."
echo ""

# Iniciar ambos simultaneamente
npm run dev:all

echo ""
echo "✅ Ambiente de desenvolvimento iniciado!"
echo "📱 Frontend: http://localhost:3000"
echo "🔌 Backend: http://localhost:3001"
echo ""
echo "💡 Dicas:"
echo "   - Backend reinicia automaticamente ao alterar arquivos"
echo "   - Frontend tem hot reload para mudanças"
echo "   - Use Ctrl+C para parar ambos"
echo "   - Use 'rs' no terminal do backend para reiniciar manualmente" 