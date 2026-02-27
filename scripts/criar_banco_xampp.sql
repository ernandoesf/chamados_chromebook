-- ============================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS
-- CHROMEBOOK HELP DESK - XAMPP
-- ============================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS chromebook_helpdesk;
USE chromebook_helpdesk;

-- ============================================
-- TABELA: USUÁRIOS
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  openId VARCHAR(64) NOT NULL UNIQUE,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_openId (openId),
  INDEX idx_email (email)
);

-- ============================================
-- TABELA: REGRAS DE SLA
-- ============================================
CREATE TABLE IF NOT EXISTS slaRules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipoProblema ENUM(
    'nao_liga',
    'tela_quebrada',
    'tela_sem_imagem',
    'teclado_defeito',
    'touchpad_defeito',
    'problema_bateria',
    'problema_carregador',
    'sistema_travando',
    'wifi_nao_conecta',
    'outro'
  ) NOT NULL UNIQUE,
  prioridade ENUM('baixa', 'media', 'alta', 'critica') NOT NULL,
  prazoHoras INT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_tipoProblema (tipoProblema)
);

-- ============================================
-- INSERIR REGRAS DE SLA PADRÃO
-- ============================================
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
('outro', 'media', 24)
ON DUPLICATE KEY UPDATE prazoHoras = VALUES(prazoHoras);

-- ============================================
-- TABELA: TICKETS (CHAMADOS)
-- ============================================
CREATE TABLE IF NOT EXISTS tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketNumber VARCHAR(20) NOT NULL UNIQUE,
  solicitante VARCHAR(255) NOT NULL,
  email VARCHAR(320),
  unidadeEscolar VARCHAR(255) NOT NULL,
  patrimonioChromebook VARCHAR(100) NOT NULL,
  numeroSerie VARCHAR(100),
  tipoProblema ENUM(
    'nao_liga',
    'tela_quebrada',
    'tela_sem_imagem',
    'teclado_defeito',
    'touchpad_defeito',
    'problema_bateria',
    'problema_carregador',
    'sistema_travando',
    'wifi_nao_conecta',
    'outro'
  ) NOT NULL,
  descricaoDetalhada TEXT NOT NULL,
  prioridade ENUM('baixa', 'media', 'alta', 'critica') NOT NULL,
  status ENUM(
    'aberto',
    'em_analise',
    'aguardando_peca',
    'em_manutencao',
    'resolvido',
    'cancelado'
  ) DEFAULT 'aberto' NOT NULL,
  dataAbertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  dataResolucao TIMESTAMP NULL,
  responsavelAtendimento VARCHAR(255),
  observacoesSolucao TEXT,
  slaVencido BOOLEAN DEFAULT FALSE,
  dataLimiteSLA TIMESTAMP NULL,
  tempoAtendimentoMinutos INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_ticketNumber (ticketNumber),
  INDEX idx_status (status),
  INDEX idx_tipoProblema (tipoProblema),
  INDEX idx_dataAbertura (dataAbertura),
  INDEX idx_slaVencido (slaVencido)
);

-- ============================================
-- TABELA: HISTÓRICO DE TICKETS
-- ============================================
CREATE TABLE IF NOT EXISTS ticketHistory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ticketId INT NOT NULL,
  statusAnterior ENUM(
    'aberto',
    'em_analise',
    'aguardando_peca',
    'em_manutencao',
    'resolvido',
    'cancelado'
  ),
  statusNovo ENUM(
    'aberto',
    'em_analise',
    'aguardando_peca',
    'em_manutencao',
    'resolvido',
    'cancelado'
  ) NOT NULL,
  responsavel VARCHAR(255) NOT NULL,
  observacoes TEXT,
  dataAlteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX idx_ticketId (ticketId),
  INDEX idx_dataAlteracao (dataAlteracao)
);

-- ============================================
-- DADOS DE TESTE (OPCIONAL)
-- ============================================

-- Inserir usuário de teste
INSERT INTO users (openId, name, email, loginMethod, role) VALUES
('test-user-001', 'Usuário Teste', 'teste@example.com', 'local', 'user'),
('test-admin-001', 'Administrador', 'admin@example.com', 'local', 'admin')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- ============================================
-- VERIFICAÇÃO FINAL
-- ============================================
SELECT 'Banco de dados criado com sucesso!' AS status;
SELECT COUNT(*) as total_sla_rules FROM slaRules;
SELECT COUNT(*) as total_users FROM users;
