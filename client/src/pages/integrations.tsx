import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertIntegrationSchema } from "@shared/schema";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Plug, 
  Plus, 
  Bot,
  Mail,
  BarChart3,
  Settings,
  CheckCircle,
  AlertCircle,
  XCircle,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { z } from "zod";

const integrationFormSchema = insertIntegrationSchema.extend({
  config: z.object({
    apiKey: z.string().min(1, "API Key é obrigatória"),
    endpoint: z.string().optional(),
    model: z.string().optional(),
  })
});

type IntegrationFormData = z.infer<typeof integrationFormSchema>;

export default function Integrations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<any>(null);
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: integrations, isLoading } = useQuery({
    queryKey: ["/api/integrations"],
  });

  const form = useForm<IntegrationFormData>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      type: "",
      name: "",
      config: {
        apiKey: "",
        endpoint: "",
        model: "",
      },
    },
  });

  const createIntegrationMutation = useMutation({
    mutationFn: async (data: IntegrationFormData) => {
      const response = await apiRequest("POST", "/api/integrations", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Integração criada",
        description: "Integração configurada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro na integração",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<IntegrationFormData> }) => {
      const response = await apiRequest("PATCH", `/api/integrations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      setIsDialogOpen(false);
      setEditingIntegration(null);
      form.reset();
      toast({
        title: "Integração atualizada",
        description: "Configurações salvas com sucesso",
      });
    },
  });

  const deleteIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/integrations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Integração removida",
        description: "Integração desconfigurada com sucesso",
      });
    },
  });

  const testIntegrationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("POST", `/api/integrations/${id}/test`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/integrations"] });
      toast({
        title: "Teste realizado",
        description: "Integração testada com sucesso",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro no teste",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: IntegrationFormData) => {
    if (editingIntegration) {
      updateIntegrationMutation.mutate({ id: editingIntegration.id, data });
    } else {
      createIntegrationMutation.mutate(data);
    }
  };

  const handleEdit = (integration: any) => {
    setEditingIntegration(integration);
    form.reset({
      ...integration,
      config: integration.config || { apiKey: "", endpoint: "", model: "" }
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja remover esta integração?")) {
      deleteIntegrationMutation.mutate(id);
    }
  };

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case "openai":
        return Bot;
      case "email_marketing":
        return Mail;
      case "analytics":
        return BarChart3;
      default:
        return Settings;
    }
  };

  const getIntegrationGradient = (type: string) => {
    switch (type) {
      case "openai":
        return "from-green-500 to-emerald-500";
      case "email_marketing":
        return "from-blue-500 to-cyan-500";
      case "analytics":
        return "from-purple-500 to-violet-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "connected":
        return "Conectado";
      case "error":
        return "Erro";
      case "disconnected":
        return "Desconectado";
      default:
        return "Configurando";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "openai":
        return "OpenAI";
      case "email_marketing":
        return "Email Marketing";
      case "analytics":
        return "Analytics";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="glass-morphism p-4 md:p-6 sticky top-0 z-20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <Plug className="w-6 h-6 mr-3 text-orange-400" />
            Integrações
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white border-0"
                onClick={() => {
                  setEditingIntegration(null);
                  form.reset();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nova Integração
              </Button>
            </DialogTrigger>
            
            <DialogContent className="glass-morphism border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingIntegration ? "Editar Integração" : "Nova Integração"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Integração</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="glass-morphism border-white/20 text-white">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI (ChatGPT)</SelectItem>
                              <SelectItem value="email_marketing">Email Marketing</SelectItem>
                              <SelectItem value="analytics">Analytics</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="glass-morphism border-white/20 text-white"
                              placeholder="Nome da integração"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="config.apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              {...field} 
                              type={showApiKey.form ? "text" : "password"}
                              className="glass-morphism border-white/20 text-white pr-10"
                              placeholder="Sua chave de API"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                              onClick={() => toggleApiKeyVisibility("form")}
                            >
                              {showApiKey.form ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("type") === "openai" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="config.model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Modelo</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || "gpt-4o"}>
                              <FormControl>
                                <SelectTrigger className="glass-morphism border-white/20 text-white">
                                  <SelectValue placeholder="Selecione o modelo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="gpt-4o">GPT-4o (Recomendado)</SelectItem>
                                <SelectItem value="gpt-4">GPT-4</SelectItem>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="config.endpoint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endpoint (Opcional)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="glass-morphism border-white/20 text-white"
                                placeholder="https://api.openai.com/v1"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      disabled={createIntegrationMutation.isPending || updateIntegrationMutation.isPending}
                    >
                      {editingIntegration ? "Atualizar" : "Criar"} Integração
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-4 md:p-6">
        {/* Integration Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card border-white/10 bg-white/5 backdrop-blur-xl animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-white/20 rounded mb-4"></div>
                  <div className="h-3 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded mb-4"></div>
                  <div className="h-6 bg-white/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : integrations?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {integrations.map((integration: any) => {
              const Icon = getIntegrationIcon(integration.type);
              const gradient = getIntegrationGradient(integration.type);
              
              return (
                <Card key={integration.id} className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mr-4`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">
                            {integration.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {getTypeLabel(integration.type)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {getStatusIcon(integration.status)}
                      </div>
                    </div>

                    <div className="mb-4">
                      <Badge className={`${getStatusColor(integration.status)} border`}>
                        {getStatusLabel(integration.status)}
                      </Badge>
                    </div>

                    {integration.config?.apiKey && (
                      <div className="mb-4 p-3 bg-black/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">API Key:</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleApiKeyVisibility(integration.id)}
                            className="text-gray-400 hover:text-white p-1"
                          >
                            {showApiKey[integration.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </Button>
                        </div>
                        <code className="text-xs text-white font-mono">
                          {showApiKey[integration.id] 
                            ? integration.config.apiKey 
                            : "••••••••••••••••"}
                        </code>
                      </div>
                    )}

                    {integration.lastSync && (
                      <p className="text-xs text-gray-400 mb-4">
                        Última sincronização: {new Date(integration.lastSync).toLocaleString()}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => testIntegrationMutation.mutate(integration.id)}
                          className="text-blue-400 hover:bg-blue-500/20"
                          disabled={testIntegrationMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(integration)}
                          className="text-yellow-400 hover:bg-yellow-500/20"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(integration.id)}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Plug className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhuma integração configurada
            </h3>
            <p className="text-gray-400 mb-6">
              Configure suas primeiras integrações para conectar o Eidos Connect com suas ferramentas
            </p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Primeira Integração
            </Button>
          </div>
        )}

        {/* Integration Types Info */}
        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">
              Tipos de Integração Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start p-4 glass-card rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-4">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">OpenAI</h4>
                  <p className="text-sm text-gray-300">
                    Integre com ChatGPT para respostas contextuais inteligentes baseadas nos seus dados
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 glass-card rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Email Marketing</h4>
                  <p className="text-sm text-gray-300">
                    Automatize campanhas de email e nutrir leads com sequências personalizadas
                  </p>
                </div>
              </div>

              <div className="flex items-start p-4 glass-card rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">Analytics</h4>
                  <p className="text-sm text-gray-300">
                    Conecte com Google Analytics e outras ferramentas para insights avançados
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
