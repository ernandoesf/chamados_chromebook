import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  getNextTicketNumber,
  createTicket,
  getTicketById,
  getAllTickets,
  updateTicketStatus,
  getSLARules,
  getSLARuleByProblemType,
} from "../db";
import { problemTypeEnum, priorityEnum } from "../../drizzle/schema";

// Validation schemas
const createTicketSchema = z.object({
  solicitante: z.string().min(1, "Solicitante é obrigatório"),
  email: z.string().email("Email inválido").optional(),
  unidadeEscolar: z.string().min(1, "Unidade escolar é obrigatória"),
  patrimonioChromebook: z.string().min(1, "Patrimônio do Chromebook é obrigatório"),
  numeroSerie: z.string().optional(),
  tipoProblema: z.enum(problemTypeEnum),
  descricaoDetalhada: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
});

const updateStatusSchema = z.object({
  ticketId: z.number(),
  status: z.enum(["aberto", "em_analise", "aguardando_peca", "em_manutencao", "resolvido", "cancelado"]),
  responsavelAtendimento: z.string().min(1, "Responsável é obrigatório"),
  observacoesSolucao: z.string().optional(),
});

export const ticketsRouter = router({
  // Create new ticket
  create: publicProcedure
    .input(createTicketSchema)
    .mutation(async ({ input }) => {
      try {
        const ticketNumber = await getNextTicketNumber();
        
        // Get SLA rule for the problem type
        const slaRule = await getSLARuleByProblemType(input.tipoProblema);
        const prazoHoras = slaRule?.prazoHoras || 24;
        
        // Calculate SLA deadline
        const dataAbertura = new Date();
        const dataLimiteSLA = new Date(dataAbertura.getTime() + prazoHoras * 60 * 60 * 1000);
        
        // Determine priority based on problem type
        let prioridade: typeof priorityEnum[number] = "media";
        if (input.tipoProblema === "nao_liga") prioridade = "critica";
        else if (input.tipoProblema === "tela_quebrada") prioridade = "alta";
        else if (input.tipoProblema === "tela_sem_imagem") prioridade = "alta";
        else if (input.tipoProblema === "wifi_nao_conecta") prioridade = "media";
        
        const ticketData = {
          ticketNumber,
          solicitante: input.solicitante,
          email: input.email,
          unidadeEscolar: input.unidadeEscolar,
          patrimonioChromebook: input.patrimonioChromebook,
          numeroSerie: input.numeroSerie,
          tipoProblema: input.tipoProblema,
          descricaoDetalhada: input.descricaoDetalhada,
          prioridade,
          status: "aberto" as const,
          dataAbertura,
          dataLimiteSLA,
          slaVencido: false,
        };
        
        await createTicket(ticketData);
        
        return {
          success: true,
          ticketNumber,
          message: `Chamado ${ticketNumber} criado com sucesso`,
        };
      } catch (error) {
        console.error("Error creating ticket:", error);
        throw new Error("Erro ao criar chamado");
      }
    }),

  // Get all tickets
  list: publicProcedure.query(async () => {
    try {
      const allTickets = await getAllTickets();
      return allTickets;
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw new Error("Erro ao buscar chamados");
    }
  }),

  // Get ticket by ID
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      try {
        const ticket = await getTicketById(input.id);
        if (!ticket) {
          throw new Error("Chamado não encontrado");
        }
        return ticket;
      } catch (error) {
        console.error("Error fetching ticket:", error);
        throw new Error("Erro ao buscar chamado");
      }
    }),

  // Update ticket status
  updateStatus: protectedProcedure
    .input(updateStatusSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        await updateTicketStatus(
          input.ticketId,
          input.status,
          ctx.user?.name || "Sistema",
          input.observacoesSolucao
        );
        
        return {
          success: true,
          message: "Status do chamado atualizado com sucesso",
        };
      } catch (error) {
        console.error("Error updating ticket status:", error);
        throw new Error("Erro ao atualizar status do chamado");
      }
    }),

  // Get SLA rules
  getSLARules: publicProcedure.query(async () => {
    try {
      const rules = await getSLARules();
      return rules;
    } catch (error) {
      console.error("Error fetching SLA rules:", error);
      throw new Error("Erro ao buscar regras de SLA");
    }
  }),

  // Get statistics
  getStats: publicProcedure.query(async () => {
    try {
      const allTickets = await getAllTickets();
      
      const totalAbertos = allTickets.filter(t => t.status === "aberto").length;
      const totalResolvidos = allTickets.filter(t => t.status === "resolvido").length;
      const totalAtrasados = allTickets.filter(t => t.slaVencido && t.status !== "resolvido").length;
      
      const tempoMedioAtendimento = allTickets
        .filter(t => t.tempoAtendimentoMinutos)
        .reduce((sum, t) => sum + (t.tempoAtendimentoMinutos || 0), 0) / 
        Math.max(allTickets.filter(t => t.tempoAtendimentoMinutos).length, 1);
      
      const taxaResolucao = allTickets.length > 0 ? (totalResolvidos / allTickets.length) * 100 : 0;
      
      return {
        totalChamados: allTickets.length,
        totalAbertos,
        totalResolvidos,
        totalAtrasados,
        tempoMedioAtendimento: Math.round(tempoMedioAtendimento),
        taxaResolucao: Math.round(taxaResolucao * 100) / 100,
      };
    } catch (error) {
      console.error("Error fetching statistics:", error);
      throw new Error("Erro ao buscar estatísticas");
    }
  }),
});
