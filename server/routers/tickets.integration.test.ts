import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { tickets, slaRules } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

let db: any;
let connection: any;

beforeAll(async () => {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.warn("DATABASE_URL not set, skipping integration tests");
    return;
  }

  try {
    const url = new URL(DATABASE_URL);
    connection = await mysql.createConnection({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      port: url.port ? parseInt(url.port) : 3306,
    });

    db = drizzle(connection);

    // Create tables if they don't exist
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

    // Insert SLA rules
    await connection.execute(`INSERT IGNORE INTO slaRules (tipoProblema, prioridade, prazoHoras) VALUES (?, ?, ?)`, ['nao_liga', 'critica', 4]);
    await connection.execute(`INSERT IGNORE INTO slaRules (tipoProblema, prioridade, prazoHoras) VALUES (?, ?, ?)`, ['tela_quebrada', 'alta', 8]);

    console.log("✓ Test database initialized");
  } catch (error) {
    console.error("Failed to initialize test database:", error);
  }
});

afterAll(async () => {
  if (connection) {
    await connection.end();
  }
});

describe("Tickets Integration", () => {
  it("should create a ticket successfully", async () => {
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const ticketData = {
      ticketNumber: "CH-0001",
      solicitante: "João Silva",
      email: "joao@example.com",
      unidadeEscolar: "Sala 101",
      patrimonioChromebook: "CB-2024-001",
      numeroSerie: "ABC123",
      tipoProblema: "nao_liga" as const,
      descricaoDetalhada: "Chromebook não liga de jeito nenhum",
      prioridade: "critica" as const,
      status: "aberto" as const,
      dataAbertura: new Date(),
      dataLimiteSLA: new Date(Date.now() + 4 * 60 * 60 * 1000),
      slaVencido: false,
    };

    const result = await db.insert(tickets).values(ticketData);
    console.log("Insert result:", result);

    // Verify ticket was created
    const createdTicket = await db.select().from(tickets).where(eq(tickets.ticketNumber, "CH-0001")).limit(1);
    
    expect(createdTicket.length).toBe(1);
    expect(createdTicket[0].solicitante).toBe("João Silva");
    expect(createdTicket[0].tipoProblema).toBe("nao_liga");
  });

  it("should retrieve SLA rules", async () => {
    if (!db) {
      console.warn("Database not available, skipping test");
      return;
    }

    const rules = await db.select().from(slaRules);
    console.log("SLA Rules:", rules);
    
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((r: any) => r.tipoProblema === "nao_liga")).toBe(true);
  });
});
