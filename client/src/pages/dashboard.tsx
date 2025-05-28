import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MetricsCard from "@/components/metrics-card";
import ChatInterface from "@/components/chat-interface";
import IntegrationStatus from "@/components/integration-status";
import { 
  Users, 
  Bot, 
  FileText, 
  TrendingUp,
  Plus,
  Upload,
  Settings,
  UserPlus,
  Bell,
  Search
} from "lucide-react";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: recentFiles } = useQuery({
    queryKey: ["/api/files"],
  });

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="glass-morphism p-4 md:p-6 sticky top-0 z-20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">Dashboard Principal</h2>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="glass-card hover:bg-white/20 text-white">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-pink-500 w-2 h-2 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="sm" className="glass-card hover:bg-white/20 text-white">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="p-4 md:p-6 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <MetricsCard
            title="Leads Ativos"
            value={metricsLoading ? "..." : metrics?.leadsCount?.toString() || "0"}
            change="+12%"
            icon={Users}
            gradient="from-blue-500 to-cyan-500"
            delay="0s"
          />
          <MetricsCard
            title="Interações IA"
            value={metricsLoading ? "..." : metrics?.aiInteractions?.toString() || "0"}
            change="+8%"
            icon={Bot}
            gradient="from-pink-500 to-rose-500"
            delay="0.2s"
          />
          <MetricsCard
            title="Arquivos Processados"
            value={metricsLoading ? "..." : metrics?.filesProcessed?.toString() || "0"}
            change="+15%"
            icon={FileText}
            gradient="from-green-500 to-emerald-500"
            delay="0.4s"
          />
          <MetricsCard
            title="Receita Mensal"
            value={metricsLoading ? "..." : `R$ ${(metrics?.revenue || 0).toLocaleString()}`}
            change="+23%"
            icon={TrendingUp}
            gradient="from-purple-500 to-violet-500"
            delay="0.6s"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>

          {/* Sidebar Content */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <Plus className="w-5 h-5 mr-3 text-yellow-400" />
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start glass-card hover:bg-blue-500/20 text-white transition-all group"
                >
                  <Upload className="w-4 h-4 mr-3 text-blue-400 group-hover:scale-110 transition-transform" />
                  Carregar Arquivo
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start glass-card hover:bg-pink-500/20 text-white transition-all group"
                >
                  <Settings className="w-4 h-4 mr-3 text-pink-400 group-hover:scale-110 transition-transform" />
                  Configurar API
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start glass-card hover:bg-green-500/20 text-white transition-all group"
                >
                  <UserPlus className="w-4 h-4 mr-3 text-green-400 group-hover:scale-110 transition-transform" />
                  Novo Lead
                </Button>
              </CardContent>
            </Card>

            {/* Recent Files */}
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-white flex items-center">
                  <FileText className="w-5 h-5 mr-3 text-purple-400" />
                  Arquivos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentFiles?.slice(0, 3).map((file: any) => (
                  <div key={file.id} className="flex items-center p-3 glass-card rounded-lg hover:bg-white/10 transition-all">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">{file.originalName}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      file.status === 'processed' ? 'bg-green-500/20 text-green-400' :
                      file.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {file.status === 'processed' ? 'Processado' :
                       file.status === 'processing' ? 'Processando' : 'Erro'}
                    </span>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-400">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum arquivo carregado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Integration Status */}
        <IntegrationStatus />
      </main>
    </div>
  );
}
