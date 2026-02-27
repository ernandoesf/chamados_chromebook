# 🚀 Chromebook Help Desk - Versão XAMPP

Sistema de gestão de chamados técnicos para Chromebooks escolares, otimizado para rodar localmente no XAMPP.

---

## ⚡ Início Rápido (5 minutos)

### Windows
```bash
# Duplo clique em:
iniciar_xampp.bat
```

### Mac/Linux
```bash
# Execute:
./iniciar_xampp.sh
```

---

## 📋 Pré-requisitos

- ✅ **XAMPP** instalado (https://www.apachefriends.org/)
- ✅ **Node.js 18+** instalado (https://nodejs.org/)
- ✅ **MySQL rodando** no XAMPP
- ✅ **Banco de dados criado** (veja abaixo)

---

## 🗄️ Configurar Banco de Dados (Primeira Vez)

### 1. Abrir phpMyAdmin
```
http://localhost/phpmyadmin
```

### 2. Criar Banco de Dados
- Clique em **"Novo"**
- Nome: `chromebook_helpdesk`
- Clique em **"Criar"**

### 3. Importar Tabelas
- Clique no banco `chromebook_helpdesk`
- Vá para aba **"SQL"**
- Copie o conteúdo de: `scripts/criar_banco_xampp.sql`
- Cole no editor SQL
- Clique em **"Executar"**

✅ Pronto! Banco configurado.

---

## 🚀 Executar o Projeto

### Opção 1: Script Automático (Recomendado)

**Windows:**
```bash
iniciar_xampp.bat
```

**Mac/Linux:**
```bash
./iniciar_xampp.sh
```

### Opção 2: Manual

```bash
# 1. Instalar dependências
pnpm install

# 2. Iniciar servidor
pnpm dev

# 3. Abrir navegador
http://localhost:3000
```

---

## ✅ Testar o Sistema

1. **Criar Chamado:**
   - Clique em "Novo Chamado"
   - Preencha os dados
   - Clique em "Criar Chamado"

2. **Visualizar Chamados:**
   - Clique em "Chamados"
   - Veja a lista de chamados criados

3. **Dashboard:**
   - Clique em "Dashboard"
   - Veja gráficos e indicadores

---

## 🔧 Variáveis de Ambiente

O arquivo `.env.local` é criado automaticamente com valores padrão:

```env
DATABASE_URL=mysql://root:@localhost:3306/chromebook_helpdesk
JWT_SECRET=sua_chave_secreta
NODE_ENV=development
PORT=3000
```

**Se você configurou senha no MySQL:**
```env
DATABASE_URL=mysql://root:sua_senha@localhost:3306/chromebook_helpdesk
```

---

## 🛠️ Solução de Problemas

### Erro: "Cannot connect to MySQL"
1. Abra XAMPP Control Panel
2. Clique em **Start** para MySQL
3. Aguarde 5 segundos
4. Tente novamente

### Erro: "Port 3000 already in use"
```bash
# Mude a porta no .env.local:
PORT=3001

# Acesse: http://localhost:3001
```

### Erro: "Database not found"
1. Abra http://localhost/phpmyadmin
2. Verifique se o banco `chromebook_helpdesk` existe
3. Se não, crie e importe as tabelas (veja acima)

### Erro: "Cannot find module 'mysql2'"
```bash
pnpm install mysql2
```

---

## 📁 Estrutura do Projeto

```
chromebook-helpdesk/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (NewTicket, Tickets, Dashboard, etc)
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── App.tsx        # Rotas principais
│   └── index.html
├── server/                # Backend Node.js/Express
│   ├── routers/           # Endpoints tRPC
│   ├── db.ts              # Funções de banco de dados
│   └── _core/             # Configuração interna
├── drizzle/               # Schema do banco de dados
├── scripts/
│   └── criar_banco_xampp.sql  # Script SQL para criar tabelas
├── GUIA_XAMPP.md          # Guia completo (este arquivo)
├── iniciar_xampp.bat      # Script para Windows
├── iniciar_xampp.sh       # Script para Mac/Linux
└── package.json
```

---

## 📊 Funcionalidades

✅ **Abertura de Chamados**
- Formulário com validação
- Auto-incremento de número
- Priorização automática

✅ **Base de Chamados**
- Listagem com filtros
- Busca avançada
- Atualização de status

✅ **Dashboard**
- KPIs (total, resolvidos, taxa)
- Gráficos de distribuição
- Análise de SLA

✅ **Sistema de SLA**
- Cálculo automático de prazos
- Alertas para vencimento
- Prioridades por tipo

✅ **Relatórios**
- Exportação em CSV
- Filtros customizáveis
- Métricas consolidadas

---

## 🎨 Design

Tema técnico inspirado em plantas arquitetônicas:
- Fundo azul royal profundo
- Grade técnica sutil
- Linhas brancas em estilo CAD
- Tipografia sans-serif em negrito

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se XAMPP está rodando
2. Verifique se Node.js está instalado: `node --version`
3. Limpe cache: `pnpm store prune`
4. Reinstale: `pnpm install`
5. Consulte `GUIA_XAMPP.md` para mais detalhes

---

## 🚀 Próximos Passos

Depois de confirmar que tudo funciona:

1. **Personalizar:** Ajuste cores, textos e logos
2. **Adicionar Usuários:** Crie mais usuários no banco
3. **Integrar Email:** Configure notificações por email
4. **Deploy:** Suba para produção quando pronto

---

**Desenvolvido com ❤️ para gerenciamento de chamados técnicos de Chromebooks**

Versão: 1.0.0  
Última atualização: Fevereiro 2026
