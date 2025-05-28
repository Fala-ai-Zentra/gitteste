import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Brain, 
  MessageSquare, 
  Users, 
  Zap, 
  Target, 
  Activity, 
  Clock, 
  TrendingUp,
  Eye,
  Heart,
  Flame,
  Settings,
  Webhook,
  Bot,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const personalitySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  mode: z.enum(["seductive", "professional", "provocative", "dominant", "curious"]),
  prompt: z.string().min(10, "Prompt deve ter pelo menos 10 caracteres"),
  isActive: z.boolean().default(false),
});

type PersonalityFormData = z.infer<typeof personalitySchema>;

const webhookSchema = z.object({
  platform: z.string().min(1, "Plataforma é obrigatória"),
  webhookUrl: z.string().url("URL inválida"),
  apiKey: z.string().optional(),
});

type WebhookFormData = z.infer<typeof webhookSchema>;

export default function EidosAgent() {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: personalities = [] } = useQuery({
    queryKey: ["/api/agent/personalities"],
  });

  const { data: externalLeads = [] } = useQuery({
    queryKey: ["/api/external-leads"],
  });

  const { data: leadRadar } = useQuery({
    queryKey: ["/api/lead-radar"],
    refetchInterval: 30000, // Atualiza a cada 30 segundos
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ["/api/webhooks"],
  });

  // Forms
  const personalityForm = useForm<PersonalityFormData>({
    resolver: zodResolver(personalitySchema),
    defaultValues: {
      name: "",
      mode: "seductive",
      prompt: "",
      isActive: false,
    },
  });

  const webhookForm = useForm<WebhookFormData>({
    resolver: zodResolver(webhookSchema),
    defaultValues: {
      platform: "",
      webhookUrl: "",
      apiKey: "",
    },
  });

  // Mutations
  const createPersonalityMutation = useMutation({
    mutationFn: (data: PersonalityFormData) => 
      apiRequest("/api/agent/personalities", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/agent/personalities"] });
      personalityForm.reset();
      toast({ title: "Personalidade criada com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao criar personalidade", variant: "destructive" });
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: (data: WebhookFormData) => 
      apiRequest("/api/webhooks", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/webhooks"] });
      webhookForm.reset();
      toast({ title: "Webhook configurado com sucesso!" });
    },
    onError: () => {
      toast({ title: "Erro ao configurar webhook", variant: "destructive" });
    },
  });

  const convertLeadMutation = useMutation({
    mutationFn: ({ leadId, strategy }: { leadId: number; strategy: string }) =>
      apiRequest(`/api/external-leads/${leadId}/convert`, { 
        method: "POST", 
        body: { strategy } 
      }),
    onSuccess: (data) => {
      toast({ title: "Tentativa de conversão enviada!", description: data.response });
      queryClient.invalidateQueries({ queryKey: ["/api/external-leads"] });
    },
    onError: () => {
      toast({ title: "Erro na conversão", variant: "destructive" });
    },
  });

  const onSubmitPersonality = (data: PersonalityFormData) => {
    createPersonalityMutation.mutate(data);
  };

  const onSubmitWebhook = (data: WebhookFormData) => {
    createWebhookMutation.mutate(data);
  };

  const handleConversion = (leadId: number, strategy: string) => {
    convertLeadMutation.mutate({ leadId, strategy });
  };

  const modeColors = {
    seductive: "bg-pink-500 text-white",
    professional: "bg-blue-500 text-white", 
    provocative: "bg-orange-500 text-white",
    dominant: "bg-red-500 text-white",
    curious: "bg-purple-500 text-white",
  };

  const modeIcons = {
    seductive: Heart,
    professional: Settings,
    provocative: Flame,
    dominant: Target,
    curious: Eye,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Eidos Agent</h1>
          <p className="text-muted-foreground">Agente IA Conversacional Avançado</p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-8 w-8 text-primary" />
          <Badge variant="outline" className="bg-primary/10">
            Autônomo
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="radar" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="radar">Lead Radar</TabsTrigger>
          <TabsTrigger value="personalities">Personalidades</TabsTrigger>
          <TabsTrigger value="leads">Leads Externos</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Lead Radar - Monitoramento em tempo real */}
        <TabsContent value="radar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ativos Agora</CardTitle>
                <Activity className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {leadRadar?.activeNow?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Últimos 5 minutos
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads Quentes</CardTitle>
                <Flame className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {leadRadar?.hotLeads?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Score ≥ 7
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads Frios</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {leadRadar?.coldLeads?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  +24h sem contato
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total</CardTitle>
                <Users className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {leadRadar?.totalLeads || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Leads registrados
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Leads Ativos em Tempo Real</CardTitle>
              <CardDescription>
                Monitoramento de leads com alta probabilidade de conversão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {leadRadar?.hotLeads?.map((lead: any) => (
                    <div key={lead.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                            {lead.name?.[0] || "?"}
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="font-medium">{lead.name || `Lead ${lead.externalId}`}</p>
                          <p className="text-sm text-muted-foreground">
                            {lead.platform} • Score: {lead.conversionScore}/10
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={(lead.conversionScore || 0) * 10} className="w-20" />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleConversion(lead.id, "emotional_peak")}
                          disabled={convertLeadMutation.isPending}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Converter
                        </Button>
                      </div>
                    </div>
                  ))}
                  {(!leadRadar?.hotLeads || leadRadar.hotLeads.length === 0) && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum lead quente no momento</p>
                      <p className="text-sm">O Eidos Agent está monitorando...</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personalidades do Agente */}
        <TabsContent value="personalities" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Personalidades do Agente</h2>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Bot className="h-4 w-4 mr-2" />
                  Nova Personalidade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Personalidade</DialogTitle>
                  <DialogDescription>
                    Configure uma nova personalidade para o Eidos Agent
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...personalityForm}>
                  <form onSubmit={personalityForm.handleSubmit(onSubmitPersonality)} className="space-y-4">
                    <FormField
                      control={personalityForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Personalidade</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Sedutora Premium" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalityForm.control}
                      name="mode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Modo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o modo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="seductive">🔥 Sedutora</SelectItem>
                              <SelectItem value="professional">💼 Profissional</SelectItem>
                              <SelectItem value="provocative">😏 Provocadora</SelectItem>
                              <SelectItem value="dominant">😈 Dominadora</SelectItem>
                              <SelectItem value="curious">💬 Curiosa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalityForm.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prompt da Personalidade</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva como o agente deve se comportar..."
                              className="min-h-[100px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={personalityForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Ativar Personalidade</FormLabel>
                            <FormDescription>
                              Tornar esta a personalidade ativa do agente
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="submit"
                        disabled={createPersonalityMutation.isPending}
                      >
                        {createPersonalityMutation.isPending ? "Criando..." : "Criar Personalidade"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {personalities.map((personality: any) => {
              const Icon = modeIcons[personality.mode as keyof typeof modeIcons];
              return (
                <Card key={personality.id} className={personality.isActive ? "ring-2 ring-primary" : ""}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <Icon className="h-5 w-5" />
                        <span>{personality.name}</span>
                      </CardTitle>
                      {personality.isActive && (
                        <Badge variant="default">Ativa</Badge>
                      )}
                    </div>
                    <Badge className={modeColors[personality.mode as keyof typeof modeColors]}>
                      {personality.mode}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {personality.prompt}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Leads Externos */}
        <TabsContent value="leads" className="space-y-6">
          <h2 className="text-2xl font-bold">Leads Externos</h2>
          
          <div className="grid gap-4">
            {externalLeads.map((lead: any) => (
              <Card key={lead.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        {lead.name?.[0] || "?"}
                      </div>
                      <div>
                        <CardTitle>{lead.name || `Lead ${lead.externalId}`}</CardTitle>
                        <CardDescription>
                          {lead.platform} • {lead.phone || lead.email}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={lead.status === "active" ? "default" : "secondary"}>
                        {lead.status}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm font-medium">Score: {lead.conversionScore}/10</div>
                        <Progress value={(lead.conversionScore || 0) * 10} className="w-20" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Webhooks */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Configurações de Webhook</h2>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Webhook className="h-4 w-4 mr-2" />
                  Novo Webhook
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar Webhook</DialogTitle>
                  <DialogDescription>
                    Conecte o Eidos Agent com plataformas externas
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...webhookForm}>
                  <form onSubmit={webhookForm.handleSubmit(onSubmitWebhook)} className="space-y-4">
                    <FormField
                      control={webhookForm.control}
                      name="platform"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Plataforma</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a plataforma" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="manychat">ManyChat</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                              <SelectItem value="telegram">Telegram</SelectItem>
                              <SelectItem value="360dialog">360Dialog</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={webhookForm.control}
                      name="webhookUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL do Webhook</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://sua-plataforma.com/webhook" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={webhookForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key (Opcional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="password"
                              placeholder="Chave de API da plataforma" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button
                        type="submit"
                        disabled={createWebhookMutation.isPending}
                      >
                        {createWebhookMutation.isPending ? "Configurando..." : "Configurar"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {webhooks.map((webhook: any) => (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-2">
                        <Webhook className="h-5 w-5" />
                        <span>{webhook.platform}</span>
                      </CardTitle>
                      <CardDescription>{webhook.webhookUrl}</CardDescription>
                    </div>
                    <Badge variant={webhook.status === "active" ? "default" : "secondary"}>
                      {webhook.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <h2 className="text-2xl font-bold">Analytics do Eidos Agent</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">68.4%</div>
                <p className="text-xs text-muted-foreground">
                  +12% desde o último mês
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio de Resposta</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2s</div>
                <p className="text-xs text-muted-foreground">
                  Simulação humana realística
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Mensagens Processadas</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2,847</div>
                <p className="text-xs text-muted-foreground">
                  Esta semana
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Desempenho das Personalidades</CardTitle>
              <CardDescription>
                Eficácia de cada modo do agente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { mode: "Sedutora", conversion: 78, color: "bg-pink-500" },
                  { mode: "Provocadora", conversion: 65, color: "bg-orange-500" },
                  { mode: "Dominadora", conversion: 72, color: "bg-red-500" },
                  { mode: "Curiosa", conversion: 58, color: "bg-purple-500" },
                  { mode: "Profissional", conversion: 45, color: "bg-blue-500" },
                ].map((personality) => (
                  <div key={personality.mode} className="flex items-center space-x-4">
                    <div className="w-20 text-sm font-medium">{personality.mode}</div>
                    <div className="flex-1">
                      <Progress value={personality.conversion} className="h-2" />
                    </div>
                    <div className="w-12 text-sm font-bold">{personality.conversion}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}