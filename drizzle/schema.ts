import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Enum definitions for tickets
export const ticketStatusEnum = ["aberto", "em_analise", "aguardando_peca", "em_manutencao", "resolvido", "cancelado"] as const;
export const priorityEnum = ["baixa", "media", "alta", "critica"] as const;
export const problemTypeEnum = [
  "nao_liga",
  "tela_quebrada",
  "tela_sem_imagem",
  "teclado_defeito",
  "touchpad_defeito",
  "problema_bateria",
  "problema_carregador",
  "sistema_travando",
  "wifi_nao_conecta",
  "outro"
] as const;

// Tickets table
export const tickets = mysqlTable("tickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketNumber: varchar("ticketNumber", { length: 20 }).notNull().unique(), // CH-0001, CH-0002, etc
  solicitante: varchar("solicitante", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  unidadeEscolar: varchar("unidadeEscolar", { length: 255 }).notNull(),
  patrimonioChromebook: varchar("patrimonioChromebook", { length: 100 }).notNull(),
  numeroSerie: varchar("numeroSerie", { length: 100 }),
  tipoProblema: mysqlEnum("tipoProblema", problemTypeEnum).notNull(),
  descricaoDetalhada: text("descricaoDetalhada").notNull(),
  prioridade: mysqlEnum("prioridade", priorityEnum).notNull(),
  status: mysqlEnum("status", ticketStatusEnum).default("aberto").notNull(),
  dataAbertura: timestamp("dataAbertura").defaultNow().notNull(),
  dataResolucao: timestamp("dataResolucao"),
  responsavelAtendimento: varchar("responsavelAtendimento", { length: 255 }),
  observacoesSolucao: text("observacoesSolucao"),
  slaVencido: boolean("slaVencido").default(false),
  dataLimiteSLA: timestamp("dataLimiteSLA"),
  tempoAtendimentoMinutos: int("tempoAtendimentoMinutos"), // Tempo total em minutos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Ticket = typeof tickets.$inferSelect;
export type InsertTicket = typeof tickets.$inferInsert;

// SLA Rules table
export const slaRules = mysqlTable("slaRules", {
  id: int("id").autoincrement().primaryKey(),
  tipoProblema: mysqlEnum("tipoProblema", problemTypeEnum).notNull().unique(),
  prioridade: mysqlEnum("prioridade", priorityEnum).notNull(),
  prazoHoras: int("prazoHoras").notNull(), // Número de horas para resolver
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SLARule = typeof slaRules.$inferSelect;
export type InsertSLARule = typeof slaRules.$inferInsert;

// Ticket history table for tracking status changes
export const ticketHistory = mysqlTable("ticketHistory", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  statusAnterior: mysqlEnum("statusAnterior", ticketStatusEnum),
  statusNovo: mysqlEnum("statusNovo", ticketStatusEnum).notNull(),
  responsavel: varchar("responsavel", { length: 255 }).notNull(),
  observacoes: text("observacoes"),
  dataAlteracao: timestamp("dataAlteracao").defaultNow().notNull(),
});

export type TicketHistory = typeof ticketHistory.$inferSelect;
export type InsertTicketHistory = typeof ticketHistory.$inferInsert;