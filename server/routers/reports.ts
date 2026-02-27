import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { generateCSVReport, generateSummaryReport } from "../services/reportService";

export const reportsRouter = router({
  // Generate CSV report
  generateCSV: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
        prioridade: z.string().optional(),
        unidadeEscolar: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const csv = await generateCSVReport(input);
        return {
          success: true,
          data: csv,
          filename: `relatorio_chamados_${new Date().toISOString().split("T")[0]}.csv`,
        };
      } catch (error) {
        console.error("Error generating CSV report:", error);
        throw new Error("Erro ao gerar relatório CSV");
      }
    }),

  // Generate summary report
  generateSummary: publicProcedure.query(async () => {
    try {
      const summary = await generateSummaryReport();
      return {
        success: true,
        data: summary,
      };
    } catch (error) {
      console.error("Error generating summary report:", error);
      throw new Error("Erro ao gerar relatório resumido");
    }
  }),

  // Generate detailed JSON report
  generateJSON: publicProcedure
    .input(
      z.object({
        status: z.string().optional(),
        prioridade: z.string().optional(),
        unidadeEscolar: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      try {
        const { getAllTickets } = await import("../db");
        const allTickets = await getAllTickets();

        // Apply filters if provided
        let filteredTickets = allTickets;
        if (input?.status) {
          filteredTickets = filteredTickets.filter(t => t.status === input.status);
        }
        if (input?.prioridade) {
          filteredTickets = filteredTickets.filter(t => t.prioridade === input.prioridade);
        }
        if (input?.unidadeEscolar) {
          filteredTickets = filteredTickets.filter(t => t.unidadeEscolar === input.unidadeEscolar);
        }

        return {
          success: true,
          data: filteredTickets,
          filename: `relatorio_chamados_${new Date().toISOString().split("T")[0]}.json`,
        };
      } catch (error) {
        console.error("Error generating JSON report:", error);
        throw new Error("Erro ao gerar relatório JSON");
      }
    }),
});
