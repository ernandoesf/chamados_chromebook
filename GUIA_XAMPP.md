# 🚀 Guia Completo: Executar Chromebook Help Desk no XAMPP

Este guia fornece instruções passo a passo para executar o projeto **Chromebook Help Desk** localmente no seu computador usando XAMPP.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

1. **XAMPP** (versão 8.0 ou superior)
   - Download: https://www.apachefriends.org/
   - Inclui: Apache, MySQL, PHP

2. **Node.js** (versão 18 ou superior)
   - Download: https://nodejs.org/
   - Inclui: npm ou pnpm

3. **Git** (para clonar o repositório)
   - Download: https://git-scm.com/

4. **Visual Studio Code** (opcional, mas recomendado)
   - Download: https://code.visualstudio.com/

---

## ✅ Passo 1: Instalar e Configurar XAMPP

### 1.1 Instalar XAMPP

1. Baixe o instalador em https://www.apachefriends.org/
2. Execute o instalador
3. Selecione os componentes:
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ phpMyAdmin
4. Escolha a pasta de instalação (padrão: `C:\xampp` no Windows ou `/Applications/XAMPP` no Mac)
5. Conclua a instalação

### 1.2 Iniciar XAMPP

**Windows:**
1. Abra o **XAMPP Control Panel**
2. Clique em **Start** para:
   - Apache
   - MySQL

**Mac/Linux:**
```bash
sudo /Applications/XAMPP/xamppfiles/xampp start
```

### 1.3 Verificar se XAMPP está Funcionando

1. Abra seu navegador
2. Acesse: http://localhost
3. Você deve ver a página inicial do XAMPP ✅

---

## 📁 Passo 2: Preparar o Projeto

### 2.1 Clonar o Repositório

Abra o terminal/prompt de comando e execute:

```bash
# Navegue para a pasta onde deseja clonar o projeto
cd C:\Users\SeuUsuario\Documents
# ou no Mac/Linux:
cd ~/Documents

# Clone o repositório
git clone https://github.com/ernandoesf/chamados_chromebook.git

# Entre na pasta do projeto
cd chamados_chromebook
```

### 2.2 Instalar Dependências

```bash
# Instale as dependências do projeto
pnpm install

# Se não tiver pnpm instalado, use npm:
npm install
```

---

## 🗄️ Passo 3: Configurar Banco de Dados

### 3.1 Criar Banco de Dados

1. Abra seu navegador
2. Acesse: http://localhost/phpmyadmin
3. Faça login (padrão: usuário `root`, senha vazia)
4. Clique em **"Novo"** no menu esquerdo
5. Digite o nome do banco: `chromebook_helpdesk`
6. Clique em **"Criar"**

### 3.2 Importar Tabelas

1. Clique no banco `chromebook_helpdesk`
2. Vá para a aba **"SQL"**
3. Cole este SQL:

```sql
-- Tabela de Usuários
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Tabela de Regras de SLA
CREATE TABLE slaRules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipoProblema ENUM('nao_liga', 'tela_quebrada', 'tela_sem_imagem', 'teclado_defeito', 'touchpad_defeito', 'problema_bateria', 'problema_carregador', 'sistema_travando', 'wifi_nao_conecta', 'outro') NOT NULL UNIQUE,
  prioridade ENUM('baixa', 'media', 'alta', 'critica') NOT NULL,
  prazoHoras INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Inserir Regras de SLA
INSERT INTO slaRules (tipoProblema, prioridade, prazoHoras) VALUES
('nao_liga', 'critica', 4),
('tela_quebrada', 'alta', 8),
('tela_sem_imagem', 'alta', 8),
('teclado_defeito', 'media', 24),
('touchpad_defeito', 'media', 24),
('problema_bateria', 'media', 24),
('problema_carregador', 'media', 24),
('sistema_travando', 'media', 24),
('wifi_nao_conecta', 'baixa', 48),
('outro', 'media', 24);

-- Tabela de Tickets
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketNumber VARCHAR(20) NOT NULL UNIQUE,
  solicitante VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  unidadeEscolar VARCHAR(255) NOT NULL,
  patrimonioChromebook VARCHAR(100) NOT NULL,
  numeroSerie VARCHAR(100),
  tipoProblema ENUM('nao_liga', 'tela_quebrada', 'tela_sem_imagem', 'teclado_defeito', 'touchpad_defeito', 'problema_bateria', 'problema_carregador', 'sistema_travando', 'wifi_nao_conecta', 'outro') NOT NULL,
  descricaoDetalhada TEXT NOT NULL,
  prioridade ENUM('baixa', 'media', 'alta', 'critica') NOT NULL,
  status ENUM('aberto', 'em_analise', 'aguardando_peca', 'em_manutencao', 'resolvido', 'cancelado') DEFAULT 'aberto' NOT NULL,
  dataAbertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  dataResolucao TIMESTAMP NULL,
  responsavelAtendimento VARCHAR(255),
  observacoesSolucao TEXT,
  slaVencido BOOLEAN DEFAULT FALSE,
  dataLimiteSLA TIMESTAMP NULL,
  tempoAtendimentoMinutos INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
);

-- Tabela de Histórico de Tickets
CREATE TABLE ticketHistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketId INT NOT NULL,
  statusAnterior ENUM('aberto', 'em_analise', 'aguardando_peca', 'em_manutencao', 'resolvido', 'cancelado'),
  statusNovo ENUM('aberto', 'em_analise', 'aguardando_peca', 'em_manutencao', 'resolvido', 'cancelado') NOT NULL,
  responsavel VARCHAR(255) NOT NULL,
  observacoes TEXT,
  dataAlteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

SELECT 'Banco de dados criado com sucesso!' AS status;
```

4. Clique em **"Executar"**
5. Você deve ver a mensagem: "Banco de dados criado com sucesso!" ✅

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

### 4.1 Criar Arquivo `.env.local`

1. Na pasta raiz do projeto (`chromebook-helpdesk`), crie um arquivo chamado `.env.local`
2. Cole este conteúdo:

```env
# Banco de Dados (XAMPP)
DATABASE_URL=mysql://root:@localhost:3306/chromebook_helpdesk

# JWT Secret (chave para sessões)
JWT_SECRET=sua_chave_secreta_local_aqui_pode_ser_qualquer_coisa

# Manus OAuth (para login - pode usar valores de teste)
VITE_APP_ID=test-app-id
OAUTH_SERVER_URL=http://localhost:3000
VITE_OAUTH_PORTAL_URL=http://localhost:3000

# Informações do Proprietário
OWNER_OPEN_ID=test-owner-001
OWNER_NAME=Administrador Local

# APIs Manus (pode deixar em branco para teste local)
BUILT_IN_FORGE_API_URL=http://localhost:3000
BUILT_IN_FORGE_API_KEY=test-key
VITE_FRONTEND_FORGE_API_KEY=test-key
VITE_FRONTEND_FORGE_API_URL=http://localhost:3000

# Aplicação
VITE_APP_TITLE=Chromebook Help Desk
NODE_ENV=development
PORT=3000
```

### 4.2 Ajustar Credenciais do MySQL

Se você configurou uma senha para o MySQL no XAMPP:

```env
DATABASE_URL=mysql://root:sua_senha@localhost:3306/chromebook_helpdesk
```

---

## 🚀 Passo 5: Executar o Projeto

### 5.1 Terminal 1: Iniciar o Servidor Node.js

```bash
# Na pasta do projeto
cd chromebook-helpdesk

# Inicie o servidor
pnpm dev

# Você deve ver:
# Server running on http://localhost:3000/
```

### 5.2 Abrir no Navegador

1. Abra seu navegador
2. Acesse: **http://localhost:3000**
3. Você deve ver a página inicial do Chromebook Help Desk ✅

---

## 🧪 Passo 6: Testar o Sistema

### 6.1 Criar um Chamado

1. Clique em **"Novo Chamado"**
2. Preencha o formulário:
   - **Solicitante**: João Silva
   - **Email**: joao@example.com
   - **Unidade Escolar**: Sala 101
   - **Patrimônio**: CB-2024-001
   - **Tipo de Problema**: Não liga
   - **Descrição**: Chromebook não liga de jeito nenhum
3. Clique em **"Criar Chamado"**
4. Você deve ver uma mensagem de sucesso ✅

### 6.2 Visualizar Chamados

1. Clique em **"Chamados"**
2. Você deve ver o chamado que criou na lista
3. Clique nele para ver os detalhes

### 6.3 Acessar Dashboard

1. Clique em **"Dashboard"**
2. Você deve ver os gráficos e indicadores

---

## 🛠️ Solução de Problemas

### Erro: "Cannot find module 'mysql2'"

**Solução:**
```bash
pnpm install mysql2
```

### Erro: "ECONNREFUSED - Conexão recusada"

**Solução:**
1. Verifique se o MySQL está rodando no XAMPP
2. Verifique se a `DATABASE_URL` está correta no `.env.local`
3. Reinicie o XAMPP

### Erro: "Port 3000 already in use"

**Solução:**
1. Mude a porta no `.env.local`:
   ```env
   PORT=3001
   ```
2. Acesse: http://localhost:3001

### Erro: "Cannot GET /"

**Solução:**
1. Aguarde alguns segundos para o servidor iniciar completamente
2. Atualize a página (F5)
3. Verifique se o servidor está rodando (deve mostrar "Server running on...")

---

## 📊 Acessar phpMyAdmin

Para gerenciar o banco de dados diretamente:

1. Abra: http://localhost/phpmyadmin
2. Usuário: `root`
3. Senha: (deixe em branco ou a que você configurou)
4. Selecione o banco `chromebook_helpdesk`

---

## 🎉 Parabéns!

Você agora tem o **Chromebook Help Desk** rodando localmente no XAMPP com 100% de funcionamento!

### Próximos Passos:

- ✅ Criar mais chamados para testar
- ✅ Visualizar relatórios no Dashboard
- ✅ Testar filtros e busca
- ✅ Exportar relatórios em CSV

---

## 📞 Suporte

Se encontrar problemas:

1. Verifique se XAMPP está rodando (Apache + MySQL)
2. Verifique se Node.js está instalado: `node --version`
3. Verifique se pnpm está instalado: `pnpm --version`
4. Limpe o cache: `pnpm store prune`
5. Reinstale dependências: `pnpm install`

---

**Desenvolvido com ❤️ para gerenciamento de chamados técnicos de Chromebooks**
