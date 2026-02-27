#!/bin/bash

# ============================================
# SCRIPT PARA INICIAR O PROJETO NO XAMPP
# CHROMEBOOK HELP DESK - MAC/LINUX
# ============================================

echo ""
echo "============================================"
echo " CHROMEBOOK HELP DESK - INICIALIZAÇÃO"
echo "============================================"
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se Node.js está instalado
echo "[1/4] Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ ERRO: Node.js não está instalado!${NC}"
    echo "Baixe em: https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✅ Node.js encontrado$(node --version)${NC}"

# Verificar se pnpm está instalado
echo "[2/4] Verificando pnpm..."
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  AVISO: pnpm não está instalado${NC}"
    echo "Instalando pnpm globalmente..."
    npm install -g pnpm
fi
echo -e "${GREEN}✅ pnpm encontrado$(pnpm --version)${NC}"

# Instalar dependências
echo "[3/4] Instalando dependências..."
pnpm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ ERRO ao instalar dependências${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependências instaladas${NC}"

# Iniciar servidor
echo "[4/4] Iniciando servidor..."
echo ""
echo "============================================"
echo -e " ${GREEN}✅ SERVIDOR INICIANDO...${NC}"
echo "============================================"
echo ""
echo "📍 Acesse: http://localhost:3000"
echo ""
echo -e "${YELLOW}⚠️  CERTIFIQUE-SE DE QUE:${NC}"
echo "   1. XAMPP está rodando (Apache + MySQL)"
echo "   2. O banco 'chromebook_helpdesk' foi criado"
echo "   3. As tabelas foram importadas"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

pnpm dev
