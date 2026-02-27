import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Parse DATABASE_URL
    const url = new URL(DATABASE_URL);
    const connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port ? parseInt(url.port) : 3306,
    });

    console.log('Creating tables...');
    
    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        openId VARCHAR(64) NOT NULL UNIQUE,
        name TEXT,
        email VARCHAR(320),
        loginMethod VARCHAR(64),
        role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
        lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log('✓ Users table created');

    // Create tickets table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS tickets (
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
        dataResolucao TIMESTAMP,
        responsavelAtendimento VARCHAR(255),
        observacoesSolucao TEXT,
        slaVencido BOOLEAN DEFAULT FALSE,
        dataLimiteSLA TIMESTAMP,
        tempoAtendimentoMinutos INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log('✓ Tickets table created');

    // Create slaRules table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS slaRules (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tipoProblema ENUM('nao_liga', 'tela_quebrada', 'tela_sem_imagem', 'teclado_defeito', 'touchpad_defeito', 'problema_bateria', 'problema_carregador', 'sistema_travando', 'wifi_nao_conecta', 'outro') NOT NULL UNIQUE,
        prioridade ENUM('baixa', 'media', 'alta', 'critica') NOT NULL,
        prazoHoras INT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log('✓ SLA Rules table created');

    // Create ticketHistory table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ticketHistory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ticketId INT NOT NULL,
        statusAnterior ENUM('aberto', 'em_analise', 'aguardando_peca', 'em_manutencao', 'resolvido', 'cancelado'),
        statusNovo ENUM('aberto', 'em_analise', 'aguardando_peca', 'em_manutencao', 'resolvido', 'cancelado') NOT NULL,
        responsavel VARCHAR(255) NOT NULL,
        observacoes TEXT,
        dataAlteracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log('✓ Ticket History table created');

    // Insert SLA rules
    console.log('Inserting SLA rules...');
    const slaRulesData = [
      { tipoProblema: 'nao_liga', prioridade: 'critica', prazoHoras: 4 },
      { tipoProblema: 'tela_quebrada', prioridade: 'alta', prazoHoras: 8 },
      { tipoProblema: 'tela_sem_imagem', prioridade: 'alta', prazoHoras: 8 },
      { tipoProblema: 'teclado_defeito', prioridade: 'media', prazoHoras: 24 },
      { tipoProblema: 'touchpad_defeito', prioridade: 'media', prazoHoras: 24 },
      { tipoProblema: 'problema_bateria', prioridade: 'media', prazoHoras: 24 },
      { tipoProblema: 'problema_carregador', prioridade: 'media', prazoHoras: 24 },
      { tipoProblema: 'sistema_travando', prioridade: 'media', prazoHoras: 24 },
      { tipoProblema: 'wifi_nao_conecta', prioridade: 'baixa', prazoHoras: 48 },
      { tipoProblema: 'outro', prioridade: 'baixa', prazoHoras: 48 },
    ];

    for (const rule of slaRulesData) {
      await connection.execute(
        `INSERT IGNORE INTO slaRules (tipoProblema, prioridade, prazoHoras) VALUES (?, ?, ?)`,
        [rule.tipoProblema, rule.prioridade, rule.prazoHoras]
      );
    }
    console.log('✓ SLA rules inserted');

    console.log('✅ Database initialized successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
