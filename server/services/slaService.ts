import { getAllTickets } from "../db";
import { notifyOwner } from "../_core/notification";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { tickets } from "../../drizzle/schema";

/**
 * Check for SLA violations and send notifications
 * This should be called periodically (e.g., every hour)
 */
export async function checkSLAViolations() {
  try {
    const allTickets = await getAllTickets();
    const now = new Date();
    let violationsFound = 0;
    let criticalIssues = 0;

    for (const ticket of allTickets) {
      // Skip resolved or cancelled tickets
      if (ticket.status === "resolvido" || ticket.status === "cancelado") {
        continue;
      }

      // Check if SLA is violated
      if (ticket.dataLimiteSLA) {
        const slaDeadline = new Date(ticket.dataLimiteSLA);
        const isViolated = now > slaDeadline;

        if (isViolated && !ticket.slaVencido) {
          // Update ticket to mark as SLA violated
          const db = await getDb();
          if (db) {
            await db.update(tickets)
              .set({ slaVencido: true })
              .where(eq(tickets.id, ticket.id));
          }

          violationsFound++;

          // Send notification
          await notifyOwner({
            title: `⚠️ SLA Vencido: ${ticket.ticketNumber}`,
            content: `O chamado ${ticket.ticketNumber} do solicitante ${ticket.solicitante} (${ticket.unidadeEscolar}) ultrapassou o prazo de SLA.\n\nProblema: ${ticket.tipoProblema}\nData de Abertura: ${ticket.dataAbertura}\nData Limite: ${ticket.dataLimiteSLA}`,
          });
        }
      }

      // Check for critical issues without attention for more than 2 hours
      if (ticket.prioridade === "critica" && ticket.status === "aberto") {
        const openTime = now.getTime() - new Date(ticket.dataAbertura).getTime();
        const hoursOpen = openTime / (1000 * 60 * 60);

        if (hoursOpen > 2) {
          criticalIssues++;

          // Send notification
          await notifyOwner({
            title: `🔴 Chamado Crítico Sem Atendimento: ${ticket.ticketNumber}`,
            content: `O chamado crítico ${ticket.ticketNumber} do solicitante ${ticket.solicitante} está aberto há mais de 2 horas sem atendimento.\n\nProblema: ${ticket.tipoProblema}\nData de Abertura: ${ticket.dataAbertura}\nTempo em Aberto: ${Math.floor(hoursOpen)} horas`,
          });
        }
      }
    }

    console.log(`[SLA Service] Checked ${allTickets.length} tickets. Violations: ${violationsFound}, Critical Issues: ${criticalIssues}`);

    return {
      totalTicketsChecked: allTickets.length,
      violationsFound,
      criticalIssues,
    };
  } catch (error) {
    console.error("[SLA Service] Error checking SLA violations:", error);
    throw error;
  }
}

/**
 * Get SLA status for a specific ticket
 */
export function getSLAStatus(ticket: any) {
  if (!ticket.dataLimiteSLA) {
    return {
      status: "unknown",
      message: "SLA não configurado",
      hoursRemaining: null,
    };
  }

  const now = new Date();
  const deadline = new Date(ticket.dataLimiteSLA);
  const timeRemaining = deadline.getTime() - now.getTime();
  const hoursRemaining = timeRemaining / (1000 * 60 * 60);

  if (timeRemaining <= 0) {
    return {
      status: "violated",
      message: "SLA vencido",
      hoursRemaining: 0,
    };
  }

  if (hoursRemaining <= 1) {
    return {
      status: "critical",
      message: "SLA crítico (menos de 1 hora)",
      hoursRemaining: Math.round(hoursRemaining * 100) / 100,
    };
  }

  if (hoursRemaining <= 4) {
    return {
      status: "warning",
      message: "SLA em risco",
      hoursRemaining: Math.round(hoursRemaining * 100) / 100,
    };
  }

  return {
    status: "ok",
    message: "SLA dentro do prazo",
    hoursRemaining: Math.round(hoursRemaining * 100) / 100,
  };
}

/**
 * Calculate SLA deadline based on problem type and priority
 */
export function calculateSLADeadline(openDate: Date, prazoHoras: number): Date {
  const deadline = new Date(openDate);
  deadline.setHours(deadline.getHours() + prazoHoras);
  return deadline;
}
