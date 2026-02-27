import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { checkSLAViolations, getSLAStatus } from "../services/slaService";
import { getTicketById, getAllTickets } from "../db";

export const slaRouter = router({
  // Check SLA violations and send notifications
  checkViolations: protectedProcedure.mutation(async () => {
    try {
      const result = await checkSLAViolations();
      return {
        success: true,
        ...result,
      };
    } catch (error) {
      console.error("Error checking SLA violations:", error);
      throw new Error("Erro ao verificar violações de SLA");
    }
  }),

  // Get SLA status for a specific ticket
  getStatus: publicProcedure
    .input(z.object({ ticketId: z.number() }))
    .query(async ({ input }) => {
      try {
        const ticket = await getTicketById(input.ticketId);
        if (!ticket) {
          throw new Error("Ticket not found");
        }

        const status = getSLAStatus(ticket);
        return {
          ticketNumber: ticket.ticketNumber,
          ...status,
        };
      } catch (error) {
        console.error("Error getting SLA status:", error);
        throw new Error("Erro ao obter status de SLA");
      }
    }),

  // Get all tickets with SLA violations
  getViolations: publicProcedure.query(async () => {
    try {
      const allTickets = await getAllTickets();
      const now = new Date();

      const violations = allTickets
        .filter(ticket => {
          if (ticket.status === "resolvido" || ticket.status === "cancelado") {
            return false;
          }
          if (!ticket.dataLimiteSLA) {
            return false;
          }
          const deadline = new Date(ticket.dataLimiteSLA as any);
          return now > deadline;
        })
        .map(ticket => ({
          id: ticket.id,
          ticketNumber: ticket.ticketNumber,
          solicitante: ticket.solicitante,
          unidadeEscolar: ticket.unidadeEscolar,
          prioridade: ticket.prioridade,
          status: ticket.status,
          dataAbertura: ticket.dataAbertura,
          dataLimiteSLA: ticket.dataLimiteSLA,
          horasAtrasado: Math.round(
            (now.getTime() - new Date(ticket.dataLimiteSLA as any).getTime()) / (1000 * 60 * 60)
          ),
        }));

      return violations;
    } catch (error) {
      console.error("Error fetching SLA violations:", error);
      throw new Error("Erro ao buscar violações de SLA");
    }
  }),

  // Get tickets at risk (SLA expiring soon)
  getAtRisk: publicProcedure.query(async () => {
    try {
      const allTickets = await getAllTickets();
      const now = new Date();
      const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000);

      const atRisk = allTickets
        .filter(ticket => {
          if (ticket.status === "resolvido" || ticket.status === "cancelado") {
            return false;
          }
          if (!ticket.dataLimiteSLA) {
            return false;
          }
          const deadline = new Date(ticket.dataLimiteSLA as any);
          return deadline > now && deadline <= fourHoursFromNow;
        })
        .map(ticket => {
          const deadline = new Date(ticket.dataLimiteSLA as any);
          const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

          return {
            id: ticket.id,
            ticketNumber: ticket.ticketNumber,
            solicitante: ticket.solicitante,
            unidadeEscolar: ticket.unidadeEscolar,
            prioridade: ticket.prioridade,
            status: ticket.status,
            dataAbertura: ticket.dataAbertura,
            dataLimiteSLA: ticket.dataLimiteSLA,
            horasRestantes: Math.round(hoursRemaining * 100) / 100,
          };
        });

      return atRisk;
    } catch (error) {
      console.error("Error fetching at-risk tickets:", error);
      throw new Error("Erro ao buscar chamados em risco");
    }
  }),
});
