import { describe, expect, it, beforeEach, vi } from "vitest";
import { ticketsRouter } from "./tickets";
import * as db from "../db";

// Mock database functions
vi.mock("../db", () => ({
  getNextTicketNumber: vi.fn(),
  createTicket: vi.fn(),
  getTicketById: vi.fn(),
  getAllTickets: vi.fn(),
  updateTicketStatus: vi.fn(),
  getSLARules: vi.fn(),
  getSLARuleByProblemType: vi.fn(),
}));

describe("Tickets Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("create procedure", () => {
    it("should create a new ticket with valid input", async () => {
      // Mock the database functions
      vi.mocked(db.getNextTicketNumber).mockResolvedValue("CH-0001");
      vi.mocked(db.getSLARuleByProblemType).mockResolvedValue({
        id: 1,
        tipoProblema: "nao_liga",
        prioridade: "critica",
        prazoHoras: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(db.createTicket).mockResolvedValue({} as any);

      const caller = ticketsRouter.createCaller({} as any);

      const result = await caller.create({
        solicitante: "João Silva",
        email: "joao@example.com",
        unidadeEscolar: "Sala 101",
        patrimonioChromebook: "CB-2024-001",
        tipoProblema: "nao_liga",
        descricaoDetalhada: "Chromebook não liga quando conectado ao carregador",
      });

      expect(result.success).toBe(true);
      expect(result.ticketNumber).toBe("CH-0001");
      expect(result.message).toContain("CH-0001");
      expect(db.createTicket).toHaveBeenCalled();
    });

    it("should assign critical priority for nao_liga problem", async () => {
      vi.mocked(db.getNextTicketNumber).mockResolvedValue("CH-0002");
      vi.mocked(db.getSLARuleByProblemType).mockResolvedValue({
        id: 1,
        tipoProblema: "nao_liga",
        prioridade: "critica",
        prazoHoras: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(db.createTicket).mockResolvedValue({} as any);

      const caller = ticketsRouter.createCaller({} as any);

      await caller.create({
        solicitante: "Maria Santos",
        unidadeEscolar: "Laboratório",
        patrimonioChromebook: "CB-2024-002",
        tipoProblema: "nao_liga",
        descricaoDetalhada: "Equipamento não inicia",
      });

      // Check if createTicket was called with critical priority
      const callArgs = vi.mocked(db.createTicket).mock.calls[0][0];
      expect(callArgs.prioridade).toBe("critica");
    });

    it("should calculate SLA deadline correctly", async () => {
      const now = new Date();
      vi.mocked(db.getNextTicketNumber).mockResolvedValue("CH-0003");
      vi.mocked(db.getSLARuleByProblemType).mockResolvedValue({
        id: 1,
        tipoProblema: "tela_quebrada",
        prioridade: "alta",
        prazoHoras: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      vi.mocked(db.createTicket).mockResolvedValue({} as any);

      const caller = ticketsRouter.createCaller({} as any);

      await caller.create({
        solicitante: "Pedro Costa",
        unidadeEscolar: "Sala 202",
        patrimonioChromebook: "CB-2024-003",
        tipoProblema: "tela_quebrada",
        descricaoDetalhada: "Tela do Chromebook está quebrada",
      });

      const callArgs = vi.mocked(db.createTicket).mock.calls[0][0];
      const expectedDeadline = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      
      // Check if deadline is approximately 8 hours from now
      const timeDiff = Math.abs(callArgs.dataLimiteSLA.getTime() - expectedDeadline.getTime());
      expect(timeDiff).toBeLessThan(1000); // Within 1 second
    });
  });

  describe("list procedure", () => {
    it("should return all tickets", async () => {
      const mockTickets = [
        {
          id: 1,
          ticketNumber: "CH-0001",
          solicitante: "João",
          status: "aberto",
          prioridade: "critica",
          tipoProblema: "nao_liga",
          dataAbertura: new Date(),
          slaVencido: false,
        },
      ];

      vi.mocked(db.getAllTickets).mockResolvedValue(mockTickets as any);

      const caller = ticketsRouter.createCaller({} as any);
      const result = await caller.list();

      expect(result).toEqual(mockTickets);
      expect(db.getAllTickets).toHaveBeenCalled();
    });
  });

  describe("getStats procedure", () => {
    it("should calculate statistics correctly", async () => {
      const mockTickets = [
        {
          id: 1,
          status: "aberto",
          slaVencido: false,
          tempoAtendimentoMinutos: 120,
        },
        {
          id: 2,
          status: "resolvido",
          slaVencido: false,
          tempoAtendimentoMinutos: 180,
        },
        {
          id: 3,
          status: "aberto",
          slaVencido: true,
          tempoAtendimentoMinutos: null,
        },
      ];

      vi.mocked(db.getAllTickets).mockResolvedValue(mockTickets as any);

      const caller = ticketsRouter.createCaller({} as any);
      const stats = await caller.getStats();

      expect(stats.totalChamados).toBe(3);
      expect(stats.totalAbertos).toBe(2);
      expect(stats.totalResolvidos).toBe(1);
      expect(stats.totalAtrasados).toBe(1);
      expect(stats.tempoMedioAtendimento).toBe(150); // (120 + 180) / 2
      expect(stats.taxaResolucao).toBe(33.33); // 1/3 * 100
    });
  });
});
