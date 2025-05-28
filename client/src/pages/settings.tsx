import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Palette,
  Database,
  Key,
  Save,
  Upload,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    plan: user?.plan || "free",
  });

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    leadAlerts: true,
    systemUpdates: true,
    weeklyReports: false,
  });

  // Security settings state
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    sessionTimeout: "24", // hours
    loginAlerts: true,
  });

  const { data: integrations } = useQuery({
    queryKey: ["/api/integrations"],
  });

  const toggleApiKeyVisibility = (key: string) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveProfile = () => {
    // In a real app, this would call an API to update the profile
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notificações atualizadas",
      description: "Suas preferências de notificação foram salvas",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Segurança atualizada",
      description: "Suas configurações de segurança foram salvas",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Seus dados serão enviados por email em breve",
    });
  };

  const handleDeleteAccount = () => {
    if (confirm("Tem certeza que deseja excluir sua conta? Esta ação é irreversível.")) {
      toast({
        title: "Conta excluída",
        description: "Sua conta foi agendada para exclusão",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="glass-morphism p-4 md:p-6 sticky top-0 z-20 border-b border-white/10">
        <div className="flex items-center">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <SettingsIcon className="w-6 h-6 mr-3 text-yellow-400" />
            Configurações
          </h2>
        </div>
      </header>

      <main className="p-4 md:p-6">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="glass-morphism border-white/20 bg-white/5">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/20">
              <User className="w-4 h-4 mr-2" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/20">
              <Bell className="w-4 h-4 mr-2" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-white/20">
              <Shield className="w-4 h-4 mr-2" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-white/20">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-white/20">
              <Database className="w-4 h-4 mr-2" />
              Dados
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <User className="w-5 h-5 mr-3 text-blue-400" />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="w-20 h-20 border-4 border-white/20">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-gray-600 text-white text-2xl">
                      <User className="w-8 h-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 mb-2">
                      <Upload className="w-4 h-4 mr-2" />
                      Alterar Foto
                    </Button>
                    <p className="text-sm text-gray-400">
                      Recomendamos uma imagem de 400x400px
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-white">Nome</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="glass-morphism border-white/20 text-white"
                      placeholder="Seu nome"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-white">Sobrenome</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="glass-morphism border-white/20 text-white"
                      placeholder="Seu sobrenome"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    className="glass-morphism border-white/20 text-white"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="plan" className="text-white">Plano Atual</Label>
                  <Select value={profileData.plan} onValueChange={(value) => setProfileData(prev => ({ ...prev, plan: value }))}>
                    <SelectTrigger className="glass-morphism border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Gratuito</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  onClick={handleSaveProfile}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <Bell className="w-5 h-5 mr-3 text-yellow-400" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Notificações por Email</Label>
                      <p className="text-sm text-gray-400">Receber notificações importantes por email</p>
                    </div>
                    <Switch 
                      checked={notifications.emailNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-400">Notificações no navegador</p>
                    </div>
                    <Switch 
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Alertas de Leads</Label>
                      <p className="text-sm text-gray-400">Notificar sobre novos leads e atualizações</p>
                    </div>
                    <Switch 
                      checked={notifications.leadAlerts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, leadAlerts: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Atualizações do Sistema</Label>
                      <p className="text-sm text-gray-400">Notificações sobre novos recursos e melhorias</p>
                    </div>
                    <Switch 
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Relatórios Semanais</Label>
                      <p className="text-sm text-gray-400">Resumo semanal de métricas e atividades</p>
                    </div>
                    <Switch 
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveNotifications}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <Shield className="w-5 h-5 mr-3 text-green-400" />
                  Configurações de Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Autenticação de Dois Fatores</Label>
                      <p className="text-sm text-gray-400">Adicionar uma camada extra de segurança</p>
                    </div>
                    <Switch 
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, twoFactorEnabled: checked }))}
                    />
                  </div>

                  <div>
                    <Label className="text-white font-medium">Timeout de Sessão</Label>
                    <p className="text-sm text-gray-400 mb-2">Tempo para logout automático</p>
                    <Select 
                      value={security.sessionTimeout} 
                      onValueChange={(value) => setSecurity(prev => ({ ...prev, sessionTimeout: value }))}
                    >
                      <SelectTrigger className="glass-morphism border-white/20 text-white w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hora</SelectItem>
                        <SelectItem value="8">8 horas</SelectItem>
                        <SelectItem value="24">24 horas</SelectItem>
                        <SelectItem value="168">1 semana</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white font-medium">Alertas de Login</Label>
                      <p className="text-sm text-gray-400">Notificar sobre novos logins</p>
                    </div>
                    <Switch 
                      checked={security.loginAlerts}
                      onCheckedChange={(checked) => setSecurity(prev => ({ ...prev, loginAlerts: checked }))}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <h4 className="text-white font-medium mb-2">Alterar Senha</h4>
                  <p className="text-sm text-gray-400 mb-4">
                    Para alterar sua senha, faça logout e use a opção "Esqueci minha senha" no login.
                  </p>
                  <Button 
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                    onClick={() => window.location.href = '/api/logout'}
                  >
                    Fazer Logout
                  </Button>
                </div>

                <Button 
                  onClick={handleSaveSecurity}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <Key className="w-5 h-5 mr-3 text-purple-400" />
                  Chaves de API e Integrações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrations?.length ? (
                  integrations.map((integration: any) => (
                    <div key={integration.id} className="p-4 glass-card rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-white font-medium">{integration.name}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          integration.status === 'connected' ? 'bg-green-500/20 text-green-400' :
                          integration.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {integration.status === 'connected' ? 'Conectado' :
                           integration.status === 'error' ? 'Erro' : 'Desconectado'}
                        </span>
                      </div>
                      
                      {integration.config?.apiKey && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <Label className="text-gray-400 text-xs">API Key:</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleApiKeyVisibility(integration.id)}
                              className="text-gray-400 hover:text-white p-1"
                            >
                              {showApiKeys[integration.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </Button>
                          </div>
                          <code className="text-xs text-white font-mono bg-black/20 p-2 rounded block">
                            {showApiKeys[integration.id] 
                              ? integration.config.apiKey 
                              : "••••••••••••••••••••••••••••••••"}
                          </code>
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-400 mt-2">
                        Tipo: {integration.type} | 
                        Criado em: {new Date(integration.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma integração configurada</p>
                    <p className="text-sm">Configure suas integrações na página de Integrações</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data" className="space-y-6">
            <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <Database className="w-5 h-5 mr-3 text-cyan-400" />
                  Gerenciamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-white font-medium mb-2">Exportar Dados</h4>
                    <p className="text-sm text-gray-400 mb-4">
                      Baixe uma cópia completa dos seus dados incluindo leads, conversas e arquivos.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={handleExportData}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Solicitar Exportação
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h4 className="text-red-400 font-medium mb-2">Zona de Perigo</h4>
                    <p className="text-sm text-gray-400 mb-4">
                      Uma vez que você excluir sua conta, não há como voltar atrás. Por favor, tenha certeza.
                    </p>
                    <Button 
                      variant="outline"
                      onClick={handleDeleteAccount}
                      className="border-red-500/50 text-red-400 hover:bg-red-500/20 hover:border-red-500"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Conta
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
