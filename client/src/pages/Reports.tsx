import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Download, Loader2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const [, setLocation] = useLocation();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");

  const { data: summary, isLoading: summaryLoading } = trpc.reports.generateSummary.useQuery();
  const { data: csvData, isLoading: csvLoading } = trpc.reports.generateCSV.useQuery({
    status: filterStatus || undefined,
    prioridade: filterPriority || undefined,
  });

  const handleDownloadCSV = () => {
    if (!csvData?.data) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    const element = document.createElement("a");
    const file = new Blob([csvData.data], { type: "text/csv;charset=utf-8;" });
    element.href = URL.createObjectURL(file);
    element.download = csvData.filename || "relatorio.csv";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Relatório CSV exportado com sucesso");
  };

  const handleDownloadJSON = () => {
    if (!csvData?.data) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    try {
      const element = document.createElement("a");
      const file = new Blob([JSON.stringify(csvData.data, null, 2)], { type: "application/json;charset=utf-8;" });
      element.href = URL.createObjectURL(file);
      element.download = `relatorio_chamados_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Relatório JSON exportado com sucesso");
    } catch (error) {
      toast.error("Erro ao exportar relatório JSON");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="h-8 w-8 text-orange-500" />
              Relatórios
            </h1>
            <p className="text-slate-400 mt-1">Exportar dados e métricas do sistema</p>
          </div>
          <Button
            onClick={() => setLocation("/")}
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>

        {/* Summary Report */}
        {summaryLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : summary?.data ? (
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white">Resumo de Desempenho</CardTitle>
              <CardDescription>Estatísticas gerais do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm mb-1">Total de Chamados</p>
                  <p className="text-2xl font-bold text-white">{summary.data.totalTickets}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm mb-1">Abertos</p>
                  <p className="text-2xl font-bold text-yellow-400">{summary.data.openTickets}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm mb-1">Resolvidos</p>
                  <p className="text-2xl font-bold text-green-400">{summary.data.resolvedTickets}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm mb-1">Taxa Resolução</p>
                  <p className="text-2xl font-bold text-purple-400">{summary.data.resolutionRate}%</p>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm mb-1">Críticos</p>
                  <p className="text-2xl font-bold text-red-400">{summary.data.criticalTickets}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm mb-1">Altos</p>
                  <p className="text-2xl font-bold text-orange-400">{summary.data.highTickets}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm mb-1">SLA Vencido</p>
                  <p className="text-2xl font-bold text-red-500">{summary.data.violatedSLA}</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                  <p className="text-slate-400 text-sm mb-1">Tempo Médio (min)</p>
                  <p className="text-2xl font-bold text-blue-400">{summary.data.averageResolutionTime}</p>
                </div>
              </div>

              {/* Distribution Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {/* Problem Type Distribution */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Distribuição por Tipo de Problema</h3>
                  <div className="space-y-2">
                    {summary.data.problemTypeDistribution.map((item: any) => (
                      <div key={item.type} className="flex justify-between p-2 bg-slate-700/30 rounded border border-slate-600">
                        <span className="text-slate-300">{item.type}</span>
                        <span className="text-white font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unit Distribution */}
                <div>
                  <h3 className="text-white font-semibold mb-3">Distribuição por Unidade</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {summary.data.unitDistribution.map((item: any) => (
                      <div key={item.unit} className="flex justify-between p-2 bg-slate-700/30 rounded border border-slate-600">
                        <span className="text-slate-300 truncate">{item.unit}</span>
                        <span className="text-white font-semibold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Export Options */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Exportar Dados</CardTitle>
            <CardDescription>Selecione filtros e formato de exportação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-slate-200 text-sm">Status</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    <SelectItem value="" className="text-white">Todos os status</SelectItem>
                    <SelectItem value="aberto" className="text-white">Aberto</SelectItem>
                    <SelectItem value="em_analise" className="text-white">Em análise</SelectItem>
                    <SelectItem value="resolvido" className="text-white">Resolvido</SelectItem>
                    <SelectItem value="cancelado" className="text-white">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-slate-200 text-sm">Prioridade</label>
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
            </div>

            {/* Export Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleDownloadCSV}
                disabled={csvLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                {csvLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>

              <Button
                onClick={handleDownloadJSON}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar JSON
              </Button>
            </div>

            <p className="text-slate-400 text-sm">
              Os relatórios serão gerados com os filtros selecionados e baixados automaticamente em seu navegador.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
