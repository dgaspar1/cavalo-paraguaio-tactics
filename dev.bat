@echo off
echo 🚀 Iniciando Cavalo Paraguayo Tactics...
echo 📦 Instalando dependencias...

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

echo 🔧 Iniciando backend com live reload...
echo 🌐 Iniciando frontend...
echo.

REM Iniciar ambos simultaneamente
npm run dev:all

echo.
echo ✅ Ambiente de desenvolvimento iniciado!
echo 📱 Frontend: http://localhost:3000
echo 🔌 Backend: http://localhost:3001
echo.
echo 💡 Dicas:
echo    - Backend reinicia automaticamente ao alterar arquivos
echo    - Frontend tem hot reload para mudancas
echo    - Use Ctrl+C para parar ambos
echo    - Use 'rs' no terminal do backend para reiniciar manualmente
pause 