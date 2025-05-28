import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Bot, 
  Users, 
  FileText, 
  Zap, 
  TrendingUp, 
  Shield,
  Sparkles,
  ArrowRight
} from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Bot,
      title: "IA Contextual Avançada",
      description: "ChatGPT integrado com seus dados para respostas personalizadas e automação inteligente",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Users,
      title: "CRM Inteligente",
      description: "Gestão completa de leads com pontuação automática e insights preditivos",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: FileText,
      title: "Processamento de Arquivos",
      description: "Upload e análise automática de PDFs, textos e imagens para treinamento da IA",
      gradient: "from-purple-500 to-violet-500"
    },
    {
      icon: Zap,
      title: "Automação Premium",
      description: "Workflows inteligentes que aprendem com suas interações e otimizam conversões",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  const metrics = [
    { value: "95%", label: "Taxa de Satisfação" },
    { value: "3x", label: "Aumento em Conversões" },
    { value: "85%", label: "Redução de Tempo" },
    { value: "500+", label: "Empresas Ativas" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header */}
      <header className="glass-morphism border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                Eidos Connect
              </h1>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white border-0 px-8 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Entrar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-500/20 to-pink-500/20 border border-blue-500/30 text-blue-200 mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Plataforma SaaS Premium
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              CRM Inteligente
            </span>
            <br />
            <span className="text-white">com IA Contextual</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Transforme seus leads em vendas com a mais avançada plataforma de automação e IA. 
            Integração premium com ChatGPT para respostas contextuais e insights preditivos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg" 
              className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white border-0 px-12 py-4 text-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Começar Agora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-12 py-4 text-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {metrics.map((metric, index) => (
              <Card key={index} className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent mb-2">
                    {metric.value}
                  </div>
                  <div className="text-gray-300 text-sm md:text-base">
                    {metric.label}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
                Recursos Premium
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Tecnologia de ponta para maximizar suas conversões e otimizar seu funil de vendas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 group">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="glass-card border-white/10 bg-gradient-to-br from-blue-500/10 to-pink-500/10 backdrop-blur-xl">
            <CardContent className="p-12">
              <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-6" />
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
                Pronto para Revolucionar seu CRM?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Junte-se a centenas de empresas que já transformaram seus resultados com nossa plataforma premium de automação com IA.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Button 
                  onClick={() => window.location.href = '/api/login'}
                  size="lg" 
                  className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white border-0 px-12 py-4 text-lg rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg shadow-blue-500/25"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Começar Gratuitamente
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-pink-400 bg-clip-text text-transparent">
              Eidos Connect
            </span>
          </div>
          
          <p className="text-gray-400">
            © 2024 Eidos Connect. Todos os direitos reservados. Plataforma SaaS Premium com IA Contextual.
          </p>
        </div>
      </footer>
    </div>
  );
}
