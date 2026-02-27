import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Loader2 } from "lucide-react";

const statusColors: Record<string, string> = {
  aberto: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  em_analise: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  aguardando_peca: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  em_manutencao: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  resolvido: "bg-green-500/20 text-green-300 border-green-500/30",
  cancelado: "bg-red-500/20 text-red-300 border-red-500/30",
};

const priorityColors: Record<string, string> = {
  baixa: "bg-slate-500/20 text-slate-300",
  media: "bg-blue-500/20 text-blue-300",
  alta: "bg-orange-500/20 text-orange-300",
  critica: "bg-red-500/20 text-red-300",
};

const problemTypeLabels: Record<string, string> = {
  nao_liga: "Não liga",
  tela_quebrada: "Tela quebrada",
  tela_sem_imagem: "Tela sem imagem",
  teclado_defeito: "Teclado com defeito",
  touchpad_defeito: "Touchpad não funciona",
  problema_bateria: "Problema na bateria",
  problema_carregador: "Problema no carregador",
  sistema_travando: "Sistema travando",
  wifi_nao_conecta: "Não conecta ao Wi-Fi",
  outro: "Outro",
};

export default function Tickets() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const { data: tickets, isLoading } = trpc.tickets.list.useQuery();

  const filteredTickets = useMemo(() => {
    if (!tickets) return [];

    return tickets.filter(ticket => {
      const matchesSearch =
        ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.solicitante.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.patrimonioChromebook.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.unidadeEscolar.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = !filterStatus || ticket.status === filterStatus;
      const matchesPriority = !filterPriority || ticket.prioridade === filterPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, filterStatus, filterPriority]);

  const formatDate = (date: Date | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Chamados Técnicos</h1>
            <p className="text-slate-400 mt-1">Gestão de Chromebooks</p>
          </div>
          <Button
            onClick={() => setLocation("/new-ticket")}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Plus className="h-4 w-4" />
            Novo Chamado
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label className="text-slate-200">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Número, solicitante, patrimônio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label className="text-slate-200">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="" className="text-white">Todos os status</SelectItem>
                    <SelectItem value="aberto" className="text-white">Aberto</SelectItem>
                    <SelectItem value="em_analise" className="text-white">Em análise</SelectItem>
                    <SelectItem value="aguardando_peca" className="text-white">Aguardando peça</SelectItem>
                    <SelectItem value="em_manutencao" className="text-white">Em manutenção</SelectItem>
                    <SelectItem value="resolvido" className="text-white">Resolvido</SelectItem>
                    <SelectItem value="cancelado" className="text-white">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label className="text-slate-200">Prioridade</Label>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Todas as prioridades" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="" className="text-white">Todas as prioridades</SelectItem>
                    <SelectItem value="baixa" className="text-white">Baixa</SelectItem>
                    <SelectItem value="media" className="text-white">Média</SelectItem>
                    <SelectItem value="alta" className="text-white">Alta</SelectItem>
                    <SelectItem value="critica" className="text-white">Crítica</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count */}
              <div className="flex items-end">
                <div className="text-slate-300">
                  {filteredTickets.length} de {tickets?.length || 0} chamados
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">Nenhum chamado encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/50">
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Número</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Solicitante</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Unidade</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Patrimônio</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Problema</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Prioridade</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Status</th>
                      <th className="px-6 py-3 text-left text-slate-300 font-semibold">Abertura</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((ticket) => (
                      <tr
                        key={ticket.id}
                        onClick={() => setLocation(`/ticket/${ticket.id}`)}
                        className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 text-white font-semibold">{ticket.ticketNumber}</td>
                        <td className="px-6 py-4 text-slate-300">{ticket.solicitante}</td>
                        <td className="px-6 py-4 text-slate-300">{ticket.unidadeEscolar}</td>
                        <td className="px-6 py-4 text-slate-300">{ticket.patrimonioChromebook}</td>
                        <td className="px-6 py-4 text-slate-300">
                          {problemTypeLabels[ticket.tipoProblema] || ticket.tipoProblema}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${priorityColors[ticket.prioridade]} border`}>
                            {ticket.prioridade.charAt(0).toUpperCase() + ticket.prioridade.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={`${statusColors[ticket.status]} border`}>
                            {ticket.status.replace(/_/g, " ").charAt(0).toUpperCase() + ticket.status.replace(/_/g, " ").slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-slate-300 text-xs">
                          {formatDate(ticket.dataAbertura)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
