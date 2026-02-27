import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

const problemTypes = [
  { value: "nao_liga", label: "Não liga" },
  { value: "tela_quebrada", label: "Tela quebrada" },
  { value: "tela_sem_imagem", label: "Tela sem imagem" },
  { value: "teclado_defeito", label: "Teclado com defeito" },
  { value: "touchpad_defeito", label: "Touchpad não funciona" },
  { value: "problema_bateria", label: "Problema na bateria" },
  { value: "problema_carregador", label: "Problema no carregador" },
  { value: "sistema_travando", label: "Sistema travando" },
  { value: "wifi_nao_conecta", label: "Não conecta ao Wi-Fi" },
  { value: "outro", label: "Outro" },
];

export default function NewTicket() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    solicitante: "",
    email: "",
    unidadeEscolar: "",
    patrimonioChromebook: "",
    numeroSerie: "",
    tipoProblema: "",
    descricaoDetalhada: "",
  });

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setTimeout(() => {
        setLocation("/tickets");
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar chamado");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, tipoProblema: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.solicitante.trim()) {
      toast.error("Solicitante é obrigatório");
      return;
    }
    
    if (!formData.unidadeEscolar.trim()) {
      toast.error("Unidade escolar é obrigatória");
      return;
    }
    
    if (!formData.patrimonioChromebook.trim()) {
      toast.error("Patrimônio do Chromebook é obrigatório");
      return;
    }
    
    if (!formData.tipoProblema) {
      toast.error("Tipo de problema é obrigatório");
      return;
    }
    
    if (formData.descricaoDetalhada.trim().length < 10) {
      toast.error("Descrição deve ter pelo menos 10 caracteres");
      return;
    }
    
    createTicketMutation.mutate({
      ...formData,
      tipoProblema: formData.tipoProblema as any,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Abrir Novo Chamado</CardTitle>
            <CardDescription>Preencha os dados do Chromebook com defeito</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Solicitante */}
              <div className="space-y-2">
                <Label htmlFor="solicitante" className="text-slate-200">Solicitante *</Label>
                <Input
                  id="solicitante"
                  name="solicitante"
                  value={formData.solicitante}
                  onChange={handleChange}
                  placeholder="Nome do solicitante"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Unidade Escolar */}
              <div className="space-y-2">
                <Label htmlFor="unidadeEscolar" className="text-slate-200">Unidade Escolar *</Label>
                <Input
                  id="unidadeEscolar"
                  name="unidadeEscolar"
                  value={formData.unidadeEscolar}
                  onChange={handleChange}
                  placeholder="Ex: Sala 101, Laboratório de Informática"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Patrimônio */}
              <div className="space-y-2">
                <Label htmlFor="patrimonioChromebook" className="text-slate-200">Patrimônio do Chromebook *</Label>
                <Input
                  id="patrimonioChromebook"
                  name="patrimonioChromebook"
                  value={formData.patrimonioChromebook}
                  onChange={handleChange}
                  placeholder="Ex: CB-2024-001"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Número de Série */}
              <div className="space-y-2">
                <Label htmlFor="numeroSerie" className="text-slate-200">Número de Série</Label>
                <Input
                  id="numeroSerie"
                  name="numeroSerie"
                  value={formData.numeroSerie}
                  onChange={handleChange}
                  placeholder="Número de série do equipamento"
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Tipo de Problema */}
              <div className="space-y-2">
                <Label htmlFor="tipoProblema" className="text-slate-200">Tipo de Problema *</Label>
                <Select value={formData.tipoProblema} onValueChange={handleSelectChange}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Selecione o tipo de problema" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 border-slate-600">
                    {problemTypes.map(type => (
                      <SelectItem key={type.value} value={type.value} className="text-white hover:bg-slate-600">
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Descrição Detalhada */}
              <div className="space-y-2">
                <Label htmlFor="descricaoDetalhada" className="text-slate-200">Descrição Detalhada *</Label>
                <Textarea
                  id="descricaoDetalhada"
                  name="descricaoDetalhada"
                  value={formData.descricaoDetalhada}
                  onChange={handleChange}
                  placeholder="Descreva o problema em detalhes (mínimo 10 caracteres)"
                  rows={5}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={createTicketMutation.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {createTicketMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {createTicketMutation.isPending ? "Criando..." : "Criar Chamado"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/")}
                  className="flex-1 border-slate-600 text-slate-200 hover:bg-slate-700"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
