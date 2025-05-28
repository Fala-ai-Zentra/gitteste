import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Mail, 
  BarChart3,
  Plug,
  CheckCircle,
  AlertCircle,
  XCircle
} from "lucide-react";

export default function IntegrationStatus() {
  const { data: integrations } = useQuery({
    queryKey: ["/api/integrations"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case "error":
        return <XCircle className="w-3 h-3 text-red-400" />;
      default:
        return <AlertCircle className="w-3 h-3 text-yellow-400" />;
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

  // Default integrations to show even if none configured
  const defaultIntegrations = [
    {
      id: "openai",
      type: "openai",
      name: "OpenAI GPT-4",
      status: "connected",
      icon: Bot,
      gradient: "from-green-500 to-emerald-500"
    },
    {
      id: "email",
      type: "email_marketing",
      name: "Email Marketing",
      status: "disconnected",
      icon: Mail,
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      id: "analytics",
      type: "analytics",
      name: "Analytics",
      status: "disconnected",
      icon: BarChart3,
      gradient: "from-gray-500 to-gray-600"
    }
  ];

  const displayIntegrations = integrations?.length ? 
    integrations.map((integration: any) => ({
      ...integration,
      icon: integration.type === 'openai' ? Bot : 
            integration.type === 'email_marketing' ? Mail : BarChart3,
      gradient: integration.type === 'openai' ? 'from-green-500 to-emerald-500' :
                integration.type === 'email_marketing' ? 'from-yellow-500 to-orange-500' :
                'from-gray-500 to-gray-600'
    })) : defaultIntegrations;

  return (
    <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white flex items-center">
          <Plug className="w-6 h-6 mr-3 text-orange-400" />
          Status das Integrações
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayIntegrations.map((integration: any) => {
            const Icon = integration.icon;
            
            return (
              <div key={integration.id} className="flex items-center p-4 glass-card rounded-xl hover:bg-white/10 transition-all">
                <div className={`w-12 h-12 bg-gradient-to-br ${integration.gradient} rounded-xl flex items-center justify-center mr-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold text-white text-sm mb-1">
                    {integration.name}
                  </h4>
                  <Badge className={`text-xs ${getStatusColor(integration.status)} border`}>
                    {getStatusLabel(integration.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center">
                  {getStatusIcon(integration.status)}
                  <div className={`w-2 h-2 rounded-full ml-2 ${
                    integration.status === 'connected' ? 'bg-green-400 animate-pulse' :
                    integration.status === 'error' ? 'bg-red-400' :
                    'bg-yellow-400 animate-pulse'
                  }`}></div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
