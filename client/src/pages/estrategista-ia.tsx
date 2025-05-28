import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  TrendingUp, 
  Globe, 
  Target, 
  Brain, 
  Zap, 
  Eye, 
  Heart,
  MessageSquare,
  Calendar,
  BarChart3,
  Search,
  Flame,
  Clock,
  Users,
  Star,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Link,
  Copy,
  CheckCircle2,
  Lightbulb,
  Rocket,
  Sparkles,
  Trophy,
  AlertTriangle
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function EstrategistaIA() {
  const [selectedNiche, setSelectedNiche] = useState("seducao");
  const [profileUrl, setProfileUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Dados simulados realistas baseados em tendências atuais
  const globalTrends = [
    {
      id: 1,
      title: "Soft Power no Threads",
      platform: "Threads",
      engagement: 847,
      category: "Copywriting",
      trend: "up",
      description: "Frases sutis de autoridade que geram curiosidade instantânea",
      examples: ["Não preciso provar nada... quem sabe, sabe", "Tenho zero paciência pra quem não me valoriza"],
      hotness: 94
    },
    {
      id: 2, 
      title: "Energy Check nos Stories",
      platform: "Instagram",
      engagement: 623,
      category: "Formato",
      trend: "up",
      description: "Stories com pergunta + emoji de energia que viralizam",
      examples: ["Sua energia hoje tá como? ⚡", "Check de vibe: você tá irradiando o quê? 🔥"],
      hotness: 89
    },
    {
      id: 3,
      title: "Provocação Inteligente TikTok",
      platform: "TikTok", 
      engagement: 1240,
      category: "Hook",
      trend: "up",
      description: "Vídeos que começam provocando e terminam seduzindo",
      examples: ["POV: você é o tipo que...", "Red flag ou green flag? Vou te julgar..."],
      hotness: 96
    }
  ];

  const organicStrategies = [
    {
      type: "Bio Otimizada",
      current: "Apenas vivendo...",
      suggested: "Energia que você não consegue ignorar ⚡",
      impact: "+340% interesse",
      reason: "Misterioso + magnético + chamada energética"
    },
    {
      type: "Primeiro Post Threads",
      suggested: "Começando aqui... será que vocês conseguem me acompanhar? 👀",
      impact: "+12 novos seguidores",
      reason: "Desafio sutil + curiosidade + emoji estratégico"
    },
    {
      type: "Melhor Horário",
      timeSlot: "21h30 - 22h15",
      days: "Terça, Quinta, Domingo",
      impact: "+67% alcance orgânico",
      reason: "Horário de maior vulnerabilidade emocional do público"
    }
  ];

  const conversionStrategies = [
    {
      situation: "Lead respondeu 'kkk'",
      response: "Ri porque se identificou ou porque não quer admitir? 😏",
      effectiveness: 87,
      emotion: "Provocativa",
      category: "Resposta Inteligente"
    },
    {
      situation: "Lead sumiu há 2 dias",
      response: "Você sumiu... interessante estratégia 👀",
      effectiveness: 73,
      emotion: "Misteriosa",
      category: "Reativação"
    },
    {
      situation: "Primeiro contato",
      response: "Sua energia me chamou atenção... isso é perigoso 🔥",
      effectiveness: 91,
      emotion: "Sedutora",
      category: "Abertura"
    }
  ];

  const weeklyMissions = [
    {
      id: 1,
      title: "Grave áudio de 15s com energia magnética",
      description: "Poste no Threads às 21h com frase misteriosa",
      status: "pending",
      points: 150,
      deadline: "Hoje, 21h",
      type: "content"
    },
    {
      id: 2,
      title: "Crie story com pergunta provocativa",
      description: "Use emoji de fogo + responda nos DMs",
      status: "completed",
      points: 100,
      deadline: "Concluído",
      type: "engagement"
    },
    {
      id: 3,
      title: "Otimize bio com técnica de curiosidade",
      description: "Adicione elemento de mistério + emoji estratégico",
      status: "pending", 
      points: 200,
      deadline: "Amanhã",
      type: "optimization"
    }
  ];

  const profileAnalysis = {
    score: 74,
    weakPoints: [
      "Bio muito explícita, falta mistério",
      "Posts sem ganchos emocionais",
      "Falta consistência no tom sedutor"
    ],
    improvements: [
      "Adicione emoji de energia (⚡) na bio",
      "Use mais perguntas provocativas nos posts",
      "Crie expectativa antes de revelar conteúdo"
    ],
    newPositioning: "De 'disponível demais' para 'energia irresistível que escolhe'"
  };

  // Funções simuladas para análise
  const analyzeProfile = async (url: string) => {
    setAnalyzing(true);
    await new Promise(resolve => setTimeout(resolve, 3000));
    setAnalyzing(false);
    toast({ 
      title: "Análise concluída!", 
      description: "Estratégias personalizadas geradas com IA" 
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copiado!", description: "Texto copiado para área de transferência" });
  };

  const getTrendIcon = (trend: string) => {
    return trend === "up" ? (
      <ArrowUp className="h-4 w-4 text-green-400" />
    ) : (
      <ArrowDown className="h-4 w-4 text-red-400" />
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-400" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 bg-gradient-to-br from-gray-900 via-black to-gray-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Estrategista IA
          </h1>
          <p className="text-gray-400">Social Hacker Inteligente • Tendências em Tempo Real</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm">Monitorando</span>
          </div>
          <Badge variant="outline" className="bg-purple-500/20 border-purple-400 text-purple-400">
            Sci-fi Mode
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-gray-800/50 border border-gray-700">
          <TabsTrigger value="trends" className="data-[state=active]:bg-pink-500/20">
            <Globe className="h-4 w-4 mr-2" />
            Tendências
          </TabsTrigger>
          <TabsTrigger value="organic" className="data-[state=active]:bg-green-500/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            Crescimento
          </TabsTrigger>
          <TabsTrigger value="conversion" className="data-[state=active]:bg-red-500/20">
            <Flame className="h-4 w-4 mr-2" />
            Conversão X1
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-blue-500/20">
            <Brain className="h-4 w-4 mr-2" />
            Análise Perfil
          </TabsTrigger>
          <TabsTrigger value="tools" className="data-[state=active]:bg-purple-500/20">
            <Zap className="h-4 w-4 mr-2" />
            Ferramentas
          </TabsTrigger>
          <TabsTrigger value="missions" className="data-[state=active]:bg-cyan-500/20">
            <Target className="h-4 w-4 mr-2" />
            Missões
          </TabsTrigger>
        </TabsList>

        {/* Monitoramento de Tendências Globais */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {globalTrends.map((trend) => (
              <Card key={trend.id} className="bg-gray-800/40 border-gray-700 hover:border-pink-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge className={`${
                      trend.platform === 'TikTok' ? 'bg-black text-white' :
                      trend.platform === 'Instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                      'bg-gray-900 text-white'
                    }`}>
                      {trend.platform}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      {getTrendIcon(trend.trend)}
                      <span className="text-sm text-gray-400">{trend.engagement}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg text-white">{trend.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Flame className="h-4 w-4 text-orange-400" />
                      <span className="text-sm text-orange-400">{trend.hotness}% Hot</span>
                    </div>
                    <Progress value={trend.hotness} className="flex-1 h-2" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm">{trend.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-cyan-400">Exemplos Virais:</h4>
                    {trend.examples.map((example, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-900/50 rounded border border-gray-700">
                        <span className="text-sm text-gray-300">"{example}"</span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => copyToClipboard(example)}
                          className="text-pink-400 hover:text-pink-300"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-cyan-400">
                <Sparkles className="h-5 w-5" />
                <span>IA Insights do Momento</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-pink-500/10 border border-pink-500/30 rounded-lg">
                  <h4 className="font-medium text-pink-400 mb-2">Top Copywriting</h4>
                  <p className="text-sm text-gray-300">"Palavras que mais geram cliques hoje: 'energia', 'mistério', 'perigoso'"</p>
                </div>
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <h4 className="font-medium text-green-400 mb-2">Formato Viral</h4>
                  <p className="text-sm text-gray-300">"Stories com pergunta + emoji de energia têm 340% mais engagement"</p>
                </div>
                <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <h4 className="font-medium text-purple-400 mb-2">Horário Gold</h4>
                  <p className="text-sm text-gray-300">"21h30-22h15: momento de maior vulnerabilidade emocional"</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estratégias de Crescimento Orgânico */}
        <TabsContent value="organic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {organicStrategies.map((strategy, idx) => (
              <Card key={idx} className="bg-gray-800/40 border-gray-700 hover:border-green-500/50 transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-400">
                    <TrendingUp className="h-5 w-5" />
                    <span>{strategy.type}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {strategy.current && (
                    <div>
                      <h4 className="text-sm font-medium text-red-400 mb-1">Atual:</h4>
                      <p className="text-sm text-gray-400 p-2 bg-red-500/10 border border-red-500/30 rounded">
                        {strategy.current}
                      </p>
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-green-400 mb-1">
                      {strategy.timeSlot ? 'Otimizado:' : 'Sugerido:'}
                    </h4>
                    <div className="p-3 bg-green-500/10 border border-green-500/30 rounded space-y-2">
                      <p className="text-sm text-gray-300">
                        {strategy.suggested || strategy.timeSlot}
                      </p>
                      {strategy.days && (
                        <p className="text-xs text-green-400">{strategy.days}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <ArrowUp className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-400">{strategy.impact}</span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => copyToClipboard(strategy.suggested || strategy.timeSlot || '')}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copiar
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 italic">{strategy.reason}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-green-400">
                <Rocket className="h-5 w-5" />
                <span>Plano de Crescimento Personalizado</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">+67%</div>
                  <div className="text-sm text-gray-400">Alcance Orgânico</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">+340%</div>
                  <div className="text-sm text-gray-400">Interesse no Perfil</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">+12</div>
                  <div className="text-sm text-gray-400">Seguidores/Dia</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">89%</div>
                  <div className="text-sm text-gray-400">Engajamento</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Estratégias X1 de Conversão */}
        <TabsContent value="conversion" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {conversionStrategies.map((strategy, idx) => (
              <Card key={idx} className="bg-gray-800/40 border-gray-700 hover:border-red-500/50 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2 text-red-400">
                      <MessageSquare className="h-5 w-5" />
                      <span>{strategy.category}</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${
                        strategy.emotion === 'Provocativa' ? 'bg-orange-500/20 text-orange-400' :
                        strategy.emotion === 'Misteriosa' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-pink-500/20 text-pink-400'
                      }`}>
                        {strategy.emotion}
                      </Badge>
                      <div className="flex items-center space-x-1">
                        <Flame className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-400">{strategy.effectiveness}%</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Situação:</h4>
                    <p className="text-sm text-gray-300 p-2 bg-gray-900/50 rounded border border-gray-700">
                      {strategy.situation}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-red-400 mb-2">Resposta Estratégica:</h4>
                    <div className="flex items-center space-between p-3 bg-red-500/10 border border-red-500/30 rounded">
                      <p className="text-sm text-gray-300 flex-1">"{strategy.response}"</p>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => copyToClipboard(strategy.response)}
                        className="ml-2 text-red-400 hover:text-red-300"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Progress value={strategy.effectiveness} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">Taxa de sucesso baseada em 2,847 conversas analisadas</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border border-red-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-red-400">
                <Trophy className="h-5 w-5" />
                <span>Frases Virais da Semana</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Top 3 frases que mais convertem no X1 brasileiro
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { phrase: "Você tem uma energia que me bagunça... e isso é perigoso demais", success: 94 },
                  { phrase: "Não costumo me interessar fácil, mas contigo é diferente", success: 87 },
                  { phrase: "Tô tentando resistir, mas você torna isso impossível", success: 91 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-700">
                    <div className="flex-1">
                      <p className="text-sm text-gray-300">"{item.phrase}"</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Progress value={item.success} className="w-20 h-1" />
                        <span className="text-xs text-green-400">{item.success}% sucesso</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(item.phrase)}
                      className="text-pink-400 hover:text-pink-300"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Perfil */}
        <TabsContent value="analysis" className="space-y-6">
          <Card className="bg-gray-800/40 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-blue-400">
                <Brain className="h-5 w-5" />
                <span>Analisador de Perfil IA</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Cole o link do seu Instagram, Threads ou TikTok para análise completa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input 
                  placeholder="https://instagram.com/seuperfil ou https://threads.net/@seuperfil"
                  value={profileUrl}
                  onChange={(e) => setProfileUrl(e.target.value)}
                  className="bg-gray-900/50 border-gray-600 text-gray-300"
                />
                <Button 
                  onClick={() => analyzeProfile(profileUrl)}
                  disabled={analyzing || !profileUrl}
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Analisar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Resultado da Análise */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800/40 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-400">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Pontos Fracos Detectados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileAnalysis.weakPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start space-x-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      <p className="text-sm text-gray-300">{point}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-green-400">
                  <Lightbulb className="h-5 w-5" />
                  <span>Melhorias Sugeridas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profileAnalysis.improvements.map((improvement, idx) => (
                    <div key={idx} className="flex items-start space-x-2 p-3 bg-green-500/10 border border-green-500/30 rounded">
                      <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5" />
                      <p className="text-sm text-gray-300">{improvement}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <Star className="h-5 w-5" />
                <span>Novo Posicionamento Sugerido</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="text-3xl font-bold text-purple-400">{profileAnalysis.score}/100</div>
                <p className="text-gray-300">{profileAnalysis.newPositioning}</p>
                <Button className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
                  <Rocket className="h-4 w-4 mr-2" />
                  Implementar Transformação
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ferramentas Extras */}
        <TabsContent value="tools" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-800/40 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-purple-400">
                  <Zap className="h-5 w-5" />
                  <span>Gerador de Gatilhos</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Gatilhos psicológicos personalizados por temperatura de lead
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select defaultValue="quente">
                  <SelectTrigger className="bg-gray-900/50 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="frio">Lead Frio ❄️</SelectItem>
                    <SelectItem value="morno">Lead Morno 🔥</SelectItem>
                    <SelectItem value="quente">Lead Quente 💎</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Gatilho
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700 hover:border-cyan-500/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-cyan-400">
                  <Calendar className="h-5 w-5" />
                  <span>Planejador Viral</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Calendário automático com conteúdo viral personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {['Threads', 'Instagram', 'TikTok'].map(platform => (
                    <div key={platform} className="p-2 bg-gray-900/50 rounded text-center border border-gray-700">
                      {platform}
                    </div>
                  ))}
                </div>
                <Button className="w-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  Gerar Calendário
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/40 border-gray-700 hover:border-red-500/50 transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-red-400">
                  <Eye className="h-5 w-5" />
                  <span>Detector de Queda</span>
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Monitora alcance e sugere ações corretivas imediatas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Status do Alcance:</span>
                  <Badge className="bg-green-500/20 text-green-400">Estável</Badge>
                </div>
                <Button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analisar Tendência
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-white">
                <Brain className="h-5 w-5" />
                <span>Central de Ferramentas IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Bio Magnética", icon: "⚡", status: "Pronto" },
                  { name: "Hooks Virais", icon: "🎣", status: "Gerando..." },
                  { name: "Stories Ideas", icon: "📱", status: "Pronto" },
                  { name: "Reels Scripts", icon: "🎬", status: "Pronto" }
                ].map((tool, idx) => (
                  <div key={idx} className="p-3 bg-gray-900/50 rounded border border-gray-700 text-center hover:border-pink-500/50 transition-all cursor-pointer">
                    <div className="text-2xl mb-2">{tool.icon}</div>
                    <div className="text-sm text-gray-300 mb-1">{tool.name}</div>
                    <div className={`text-xs ${tool.status === 'Pronto' ? 'text-green-400' : 'text-yellow-400'}`}>
                      {tool.status}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Missões da Semana */}
        <TabsContent value="missions" className="space-y-6">
          <Card className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-cyan-400">
                <Target className="h-5 w-5" />
                <span>Missões da Semana</span>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Tarefas geradas automaticamente para maximizar seu impacto
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {weeklyMissions.map((mission) => (
              <Card key={mission.id} className={`bg-gray-800/40 border-gray-700 transition-all duration-300 ${
                mission.status === 'completed' ? 'border-green-500/50 bg-green-500/5' : 'hover:border-cyan-500/50'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="mt-1">
                      {getStatusIcon(mission.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-white">{mission.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${
                            mission.type === 'content' ? 'bg-pink-500/20 text-pink-400' :
                            mission.type === 'engagement' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {mission.type}
                          </Badge>
                          <span className="text-sm text-cyan-400">+{mission.points} pts</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-3">{mission.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Prazo: {mission.deadline}</span>
                        {mission.status === 'pending' && (
                          <Button size="sm" className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Marcar como Concluído
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gray-800/40 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-400">
                <Trophy className="h-5 w-5" />
                <span>Progresso Semanal</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-400">1/3</div>
                  <div className="text-sm text-gray-400">Missões Completas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">100</div>
                  <div className="text-sm text-gray-400">Pontos Ganhos</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-400">350</div>
                  <div className="text-sm text-gray-400">Meta Semanal</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progresso</span>
                  <span className="text-sm text-purple-400">29%</span>
                </div>
                <Progress value={29} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}