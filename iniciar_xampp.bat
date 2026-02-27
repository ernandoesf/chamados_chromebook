@echo off
REM ============================================
REM SCRIPT PARA INICIAR O PROJETO NO XAMPP
REM CHROMEBOOK HELP DESK
REM ============================================

echo.
echo ============================================
echo  CHROMEBOOK HELP DESK - INICIALIZAÇÃO
echo ============================================
echo.

REM Verificar se Node.js está instalado
echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERRO: Node.js não está instalado!
    echo Baixe em: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js encontrado

REM Verificar se pnpm está instalado
echo [2/4] Verificando pnpm...
pnpm --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  AVISO: pnpm não está instalado
    echo Instalando pnpm globalmente...
    npm install -g pnpm
)
echo ✅ pnpm encontrado

REM Instalar dependências
echo [3/4] Instalando dependências...
call pnpm install
if errorlevel 1 (
    echo ❌ ERRO ao instalar dependências
    pause
    exit /b 1
)
echo ✅ Dependências instaladas

REM Iniciar servidor
echo [4/4] Iniciando servidor...
echo.
echo ============================================
echo  ✅ SERVIDOR INICIANDO...
echo ============================================
echo.
echo 📍 Acesse: http://localhost:3000
echo.
echo ⚠️  CERTIFIQUE-SE DE QUE:
echo    1. XAMPP está rodando (Apache + MySQL)
echo    2. O banco 'chromebook_helpdesk' foi criado
echo    3. As tabelas foram importadas
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call pnpm dev

pause
