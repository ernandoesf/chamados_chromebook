import { getAllTickets } from "../db";

/**
 * Generate CSV report of tickets
 */
export async function generateCSVReport(filters?: any): Promise<string> {
  try {
    const allTickets = await getAllTickets();

    // Apply filters if provided
    let filteredTickets = allTickets;
    if (filters?.status) {
      filteredTickets = filteredTickets.filter(t => t.status === filters.status);
    }
    if (filters?.prioridade) {
      filteredTickets = filteredTickets.filter(t => t.prioridade === filters.prioridade);
    }
    if (filters?.unidadeEscolar) {
      filteredTickets = filteredTickets.filter(t => t.unidadeEscolar === filters.unidadeEscolar);
    }

    // Prepare data for CSV
    const csvData = filteredTickets.map(ticket => ({
      "Número": ticket.ticketNumber,
      "Solicitante": ticket.solicitante,
      "Email": ticket.email || "-",
      "Unidade": ticket.unidadeEscolar,
      "Patrimônio": ticket.patrimonioChromebook,
      "Série": ticket.numeroSerie || "-",
      "Tipo Problema": ticket.tipoProblema,
      "Prioridade": ticket.prioridade,
      "Status": ticket.status,
      "Data Abertura": formatDate(ticket.dataAbertura),
      "Data Resolução": ticket.dataResolucao ? formatDate(ticket.dataResolucao) : "-",
      "Responsável": ticket.responsavelAtendimento || "-",
      "SLA Vencido": ticket.slaVencido ? "Sim" : "Não",
      "Tempo Atendimento (min)": ticket.tempoAtendimentoMinutos || "-",
    }));

    // Create CSV string
    const headers = Object.keys(csvData[0] || {});
    let csv = headers.join(",") + "\n";
    
    for (const row of csvData) {
      const values = headers.map(header => {
        const value = row[header as keyof typeof row];
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value || "");
        return stringValue.includes(",") ? `"${stringValue.replace(/"/g, '""')}"` : stringValue;
      });
      csv += values.join(",") + "\n";
    }

    return csv;
  } catch (error) {
    console.error("[Report Service] Error generating CSV report:", error);
    throw error;
  }
}

/**
 * Generate summary statistics for report
 */
export async function generateSummaryReport(): Promise<any> {
  try {
    const allTickets = await getAllTickets();
    const now = new Date();

    // Calculate statistics
    const stats = {
      totalTickets: allTickets.length,
      openTickets: allTickets.filter(t => t.status === "aberto").length,
      resolvedTickets: allTickets.filter(t => t.status === "resolvido").length,
      cancelledTickets: allTickets.filter(t => t.status === "cancelado").length,
      violatedSLA: allTickets.filter(t => t.slaVencido && t.status !== "resolvido").length,
      
      // By priority
      criticalTickets: allTickets.filter(t => t.prioridade === "critica").length,
      highTickets: allTickets.filter(t => t.prioridade === "alta").length,
      mediumTickets: allTickets.filter(t => t.prioridade === "media").length,
      lowTickets: allTickets.filter(t => t.prioridade === "baixa").length,

      // By problem type
      problemTypeDistribution: Object.entries(
        allTickets.reduce((acc: Record<string, number>, ticket) => {
          acc[ticket.tipoProblema] = (acc[ticket.tipoProblema] || 0) + 1;
          return acc;
        }, {})
      ).map(([type, count]) => ({ type, count })),

      // By unit
      unitDistribution: Object.entries(
        allTickets.reduce((acc: Record<string, number>, ticket) => {
          acc[ticket.unidadeEscolar] = (acc[ticket.unidadeEscolar] || 0) + 1;
          return acc;
        }, {})
      ).map(([unit, count]) => ({ unit, count })),

      // Average metrics
      averageResolutionTime: Math.round(
        allTickets
          .filter(t => t.tempoAtendimentoMinutos)
          .reduce((sum, t) => sum + (t.tempoAtendimentoMinutos || 0), 0) /
        Math.max(allTickets.filter(t => t.tempoAtendimentoMinutos).length, 1)
      ),

      resolutionRate: Math.round(
        (allTickets.filter(t => t.status === "resolvido").length / Math.max(allTickets.length, 1)) * 100
      ),

      generatedAt: new Date().toISOString(),
    };

    return stats;
  } catch (error) {
    console.error("[Report Service] Error generating summary report:", error);
    throw error;
  }
}

/**
 * Helper function to format date
 */
function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
