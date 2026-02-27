import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, tickets, slaRules, ticketHistory, ticketStatusEnum, priorityEnum, problemTypeEnum } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Tickets queries
export async function getNextTicketNumber(): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({ ticketNumber: tickets.ticketNumber }).from(tickets).orderBy(tickets.id);
  
  // Extract the number from the last ticket (e.g., "CH-0001" -> 1)
  const lastNumber = result.length > 0 ? parseInt(result[result.length - 1]?.ticketNumber?.split("-")[1] || "0") : 0;
  const nextNumber = lastNumber + 1;
  
  return `CH-${String(nextNumber).padStart(4, "0")}`;
}

export async function createTicket(ticketData: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(tickets).values(ticketData);
  return result;
}

export async function getTicketById(ticketId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getAllTickets() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(tickets).orderBy(tickets.dataAbertura);
}

export async function updateTicketStatus(
  ticketId: number,
  status: typeof ticketStatusEnum[number],
  responsavel: string,
  observacoes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get current ticket
  const currentTicket = await db.select().from(tickets).where(eq(tickets.id, ticketId)).limit(1);
  
  if (currentTicket.length === 0) throw new Error("Ticket not found");
  
  const oldStatus = currentTicket[0].status;
  
  // Update ticket
  const updateData: any = { status };
  if (status === "resolvido") {
    updateData.dataResolucao = new Date();
    if (currentTicket[0].dataAbertura) {
      const tempoMinutos = Math.floor((new Date().getTime() - currentTicket[0].dataAbertura.getTime()) / 60000);
      updateData.tempoAtendimentoMinutos = tempoMinutos;
    }
  }
  if (responsavel) updateData.responsavelAtendimento = responsavel;
  if (observacoes) updateData.observacoesSolucao = observacoes;
  
  await db.update(tickets).set(updateData).where(eq(tickets.id, ticketId));
  
  // Log history
  await db.insert(ticketHistory).values({
    ticketId: ticketId,
    statusAnterior: oldStatus,
    statusNovo: status,
    responsavel: responsavel,
    observacoes: observacoes,
  });
}

export async function getSLARules() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(slaRules);
}

export async function getSLARuleByProblemType(tipoProblema: typeof problemTypeEnum[number]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(slaRules).where(eq(slaRules.tipoProblema, tipoProblema)).limit(1);
  
  return result.length > 0 ? result[0] : null;
}
