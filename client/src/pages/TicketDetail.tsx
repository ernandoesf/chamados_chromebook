import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { ArrowLeft, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";

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

export default function TicketDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/ticket/:id");
  const { user } = useAuth();
  const [newStatus, setNewStatus] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const ticketId = params?.id ? parseInt(params.id) : null;
  const { data: ticket, isLoading } = trpc.tickets.getById.useQuery(
    { id: ticketId! },
    { enabled: !!ticketId }
  );

  const updateStatusMutation = trpc.tickets.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status do chamado atualizado com sucesso");
      setIsDialogOpen(false);
      setNewStatus("");
      setObservacoes("");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleUpdateStatus = () => {
    if (!newStatus) {
      toast.error("Selecione um novo status");
      return;
    }

    if (!ticket) return;

    updateStatusMutation.mutate({
      ticketId: ticket.id,
      status: newStatus as any,
      responsavelAtendimento: user?.name || "Sistema",
      observacoesSolucao: observacoes,
    });
  };

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

  const calculateTimeElapsed = (startDate: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(startDate).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button
            onClick={() => setLocation("/tickets")}
            variant="outline"
            className="mb-4 border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardContent className="py-12 text-center">
              <p className="text-slate-400">Chamado não encontrado</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => setLocation("/tickets")}
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-white">{ticket.ticketNumber}</h1>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        {/* Main Info */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-white">Informações do Chamado</CardTitle>
                <CardDescription>Detalhes técnicos do equipamento</CardDescription>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <Edit2 className="h-4 w-4" />
                    Atualizar Status
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Atualizar Status do Chamado</DialogTitle>
                    <DialogDescription>Altere o status e adicione observações</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-200">Novo Status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                          <SelectValue placeholder="Selecione o novo status" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-700 border-slate-600">
                          <SelectItem value="aberto" className="text-white">Aberto</SelectItem>
                          <SelectItem value="em_analise" className="text-white">Em análise</SelectItem>
                          <SelectItem value="aguardando_peca" className="text-white">Aguardando peça</SelectItem>
                          <SelectItem value="em_manutencao" className="text-white">Em manutenção</SelectItem>
                          <SelectItem value="resolvido" className="text-white">Resolvido</SelectItem>
                          <SelectItem value="cancelado" className="text-white">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-200">Observações</Label>
                      <Textarea
                        value={observacoes}
                        onChange={(e) => setObservacoes(e.target.value)}
                        placeholder="Adicione observações sobre a solução"
                        className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                        rows={4}
                      />
                    </div>
                    <Button
                      onClick={handleUpdateStatus}
                      disabled={updateStatusMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {updateStatusMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {updateStatusMutation.isPending ? "Atualizando..." : "Atualizar Status"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status and Priority */}
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-400 text-sm">Status</Label>
                  <Badge className={`${statusColors[ticket.status]} border mt-1`}>
                    {ticket.status.replace(/_/g, " ").charAt(0).toUpperCase() + ticket.status.replace(/_/g, " ").slice(1)}
                  </Badge>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Prioridade</Label>
                  <Badge className={`${priorityColors[ticket.prioridade]} border mt-1`}>
                    {ticket.prioridade.charAt(0).toUpperCase() + ticket.prioridade.slice(1)}
                  </Badge>
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-4">
                <div>
                  <Label className="text-slate-400 text-sm">Data de Abertura</Label>
                  <p className="text-white mt-1">{formatDate(ticket.dataAbertura)}</p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Tempo Decorrido</Label>
                  <p className="text-white mt-1">{calculateTimeElapsed(ticket.dataAbertura)}</p>
                </div>
              </div>
            </div>

            {/* Solicitante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-400 text-sm">Solicitante</Label>
                <p className="text-white mt-1">{ticket.solicitante}</p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Email</Label>
                <p className="text-white mt-1">{ticket.email || "-"}</p>
              </div>
            </div>

            {/* Unidade e Patrimônio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-400 text-sm">Unidade Escolar</Label>
                <p className="text-white mt-1">{ticket.unidadeEscolar}</p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Patrimônio do Chromebook</Label>
                <p className="text-white mt-1">{ticket.patrimonioChromebook}</p>
              </div>
            </div>

            {/* Série e Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-400 text-sm">Número de Série</Label>
                <p className="text-white mt-1">{ticket.numeroSerie || "-"}</p>
              </div>
              <div>
                <Label className="text-slate-400 text-sm">Tipo de Problema</Label>
                <p className="text-white mt-1">{problemTypeLabels[ticket.tipoProblema] || ticket.tipoProblema}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Descrição Detalhada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 whitespace-pre-wrap">{ticket.descricaoDetalhada}</p>
          </CardContent>
        </Card>

        {/* SLA Info */}
        {ticket.dataLimiteSLA && (
          <Card className={`border-slate-700 backdrop-blur ${ticket.slaVencido ? "bg-red-500/10" : "bg-slate-800/50"}`}>
            <CardHeader>
              <CardTitle className={`text-white ${ticket.slaVencido ? "text-red-400" : ""}`}>
                Informações de SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-400 text-sm">Data Limite SLA</Label>
                  <p className={`mt-1 ${ticket.slaVencido ? "text-red-400 font-semibold" : "text-white"}`}>
                    {formatDate(ticket.dataLimiteSLA)}
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Status SLA</Label>
                  <Badge className={`mt-1 ${ticket.slaVencido ? "bg-red-500/20 text-red-300 border-red-500/30" : "bg-green-500/20 text-green-300 border-green-500/30"} border`}>
                    {ticket.slaVencido ? "VENCIDO" : "NO PRAZO"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resolution Info */}
        {ticket.status === "resolvido" && (
          <Card className="border-slate-700 bg-green-500/10 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-green-400">Informações de Resolução</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-slate-400 text-sm">Data de Resolução</Label>
                  <p className="text-white mt-1">{formatDate(ticket.dataResolucao)}</p>
                </div>
                <div>
                  <Label className="text-slate-400 text-sm">Responsável</Label>
                  <p className="text-white mt-1">{ticket.responsavelAtendimento || "-"}</p>
                </div>
              </div>
              {ticket.observacoesSolucao && (
                <div>
                  <Label className="text-slate-400 text-sm">Observações da Solução</Label>
                  <p className="text-slate-300 mt-1 whitespace-pre-wrap">{ticket.observacoesSolucao}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
