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
  const [isLoading, setIsLoading] = useState(false);

  const createTicketMutation = trpc.tickets.create.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setIsLoading(false);
      setTimeout(() => {
        setLocation("/tickets");
      }, 1000);
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error(error.message || "Erro ao criar chamado");
      setIsLoading(false);
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
    
    // Validations
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
    
    setIsLoading(true);
    
    // Ensure tipoProblema is one of the valid enum values
    const validProblemTypes = [
      "nao_liga",
      "tela_quebrada",
      "tela_sem_imagem",
      "teclado_defeito",
      "touchpad_defeito",
      "problema_bateria",
      "problema_carregador",
      "sistema_travando",
      "wifi_nao_conecta",
      "outro"
    ];
    
    if (!validProblemTypes.includes(formData.tipoProblema)) {
      toast.error("Tipo de problema inválido");
      setIsLoading(false);
      return;
    }
    
    createTicketMutation.mutate({
      solicitante: formData.solicitante.trim(),
      email: formData.email.trim() || undefined,
      unidadeEscolar: formData.unidadeEscolar.trim(),
      patrimonioChromebook: formData.patrimonioChromebook.trim(),
      numeroSerie: formData.numeroSerie.trim() || undefined,
      tipoProblema: formData.tipoProblema as any,
      descricaoDetalhada: formData.descricaoDetalhada.trim(),
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
                <Label htmlFor="solicitante" className="text-white font-bold">
                  Solicitante <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="solicitante"
                  name="solicitante"
                  placeholder="Nome do solicitante"
                  value={formData.solicitante}
                  onChange={handleChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white font-bold">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Unidade Escolar */}
              <div className="space-y-2">
                <Label htmlFor="unidadeEscolar" className="text-white font-bold">
                  Unidade Escolar <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="unidadeEscolar"
                  name="unidadeEscolar"
                  placeholder="Ex: Sala 101, Laboratório de Informática"
                  value={formData.unidadeEscolar}
                  onChange={handleChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Patrimônio do Chromebook */}
              <div className="space-y-2">
                <Label htmlFor="patrimonioChromebook" className="text-white font-bold">
                  Patrimônio do Chromebook <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="patrimonioChromebook"
                  name="patrimonioChromebook"
                  placeholder="Ex: CB-2024-001"
                  value={formData.patrimonioChromebook}
                  onChange={handleChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Número de Série */}
              <div className="space-y-2">
                <Label htmlFor="numeroSerie" className="text-white font-bold">
                  Número de Série
                </Label>
                <Input
                  id="numeroSerie"
                  name="numeroSerie"
                  placeholder="Número de série do equipamento"
                  value={formData.numeroSerie}
                  onChange={handleChange}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Tipo de Problema */}
              <div className="space-y-2">
                <Label className="text-white font-bold">
                  Tipo de Problema <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.tipoProblema} onValueChange={handleSelectChange}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
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
                <Label htmlFor="descricaoDetalhada" className="text-white font-bold">
                  Descrição Detalhada <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="descricaoDetalhada"
                  name="descricaoDetalhada"
                  placeholder="Descreva o problema em detalhes (mínimo 10 caracteres)"
                  value={formData.descricaoDetalhada}
                  onChange={handleChange}
                  rows={5}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    "Criar Chamado"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/tickets")}
                  className="flex-1 border-slate-600 text-white hover:bg-slate-700"
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
