import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Plus, List, BarChart3, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats } = trpc.tickets.getStats.useQuery();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">📋</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Chromebook Help Desk</h1>
              <p className="text-xs text-slate-400">Sistema de Gestão de Chamados Técnicos</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && user && (
              <>
                <div className="text-right hidden md:block">
                  <p className="text-sm text-white font-medium">{user.name}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Sair
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">Bem-vindo ao Help Desk</h2>
          <p className="text-slate-400 text-lg">
            Plataforma profissional para gestão de chamados técnicos de Chromebooks escolares
          </p>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <List className="h-4 w-4 text-blue-500" />
                  Total de Chamados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalChamados}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Abertos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalAbertos}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Resolvidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalResolvidos}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Atrasados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.totalAtrasados}</div>
              </CardContent>
            </Card>

            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition-colors">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-purple-500" />
                  Taxa Resolução
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{stats.taxaResolucao}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition-colors cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-400 transition-colors">
                <Plus className="h-6 w-6 text-blue-500" />
                Abrir Novo Chamado
              </CardTitle>
              <CardDescription>Registre um novo problema técnico</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation("/new-ticket")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Criar Chamado
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition-colors cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-400 transition-colors">
                <List className="h-6 w-6 text-purple-500" />
                Visualizar Chamados
              </CardTitle>
              <CardDescription>Acompanhe todos os chamados abertos</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation("/tickets")}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                Ver Chamados
              </Button>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50 backdrop-blur hover:bg-slate-800/70 transition-colors cursor-pointer group">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-400 transition-colors">
                <BarChart3 className="h-6 w-6 text-orange-500" />
                Dashboard Executivo
              </CardTitle>
              <CardDescription>Métricas e indicadores de desempenho</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => setLocation("/dashboard")}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
              >
                Ver Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Recursos Disponíveis</CardTitle>
            <CardDescription>Funcionalidades do sistema de Help Desk</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2">📋 Formulário Inteligente</h3>
                <p className="text-slate-400 text-sm">Abertura automática de chamados com priorização</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2">⏱️ Controle de SLA</h3>
                <p className="text-slate-400 text-sm">Monitoramento automático de prazos e alertas</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2">📊 Dashboard Executivo</h3>
                <p className="text-slate-400 text-sm">Métricas e gráficos em tempo real</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2">🔍 Filtros Avançados</h3>
                <p className="text-slate-400 text-sm">Busca por múltiplos critérios</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2">📧 Notificações</h3>
                <p className="text-slate-400 text-sm">Alertas automáticos por email</p>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <h3 className="text-white font-semibold mb-2">📥 Exportação</h3>
                <p className="text-slate-400 text-sm">Relatórios em CSV e Excel</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center text-slate-400 text-sm">
          <p>© 2024 Chromebook Help Desk - Sistema de Gestão de Chamados Técnicos</p>
        </div>
      </footer>
    </div>
  );
}
