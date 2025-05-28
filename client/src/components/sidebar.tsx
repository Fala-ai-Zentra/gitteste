import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  LayoutDashboard,
  Bot,
  Users,
  FileText,
  Settings,
  Plug,
  Sparkles,
  Menu,
  X,
  LogOut,
  User
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const menuItems = [
    {
      path: "/",
      label: "Dashboard",
      icon: LayoutDashboard,
      color: "text-blue-400",
      hoverColor: "hover:bg-blue-500/20"
    },
    {
      path: "/chat",
      label: "Chat IA",
      icon: Bot,
      color: "text-pink-400",
      hoverColor: "hover:bg-pink-500/20"
    },
    {
      path: "/leads",
      label: "Leads",
      icon: Users,
      color: "text-green-400",
      hoverColor: "hover:bg-green-500/20"
    },
    {
      path: "/files",
      label: "Arquivos",
      icon: FileText,
      color: "text-purple-400",
      hoverColor: "hover:bg-purple-500/20"
    },
    {
      path: "/integrations",
      label: "Integrações",
      icon: Plug,
      color: "text-orange-400",
      hoverColor: "hover:bg-orange-500/20"
    },
    {
      path: "/settings",
      label: "Configurações",
      icon: Settings,
      color: "text-yellow-400",
      hoverColor: "hover:bg-yellow-500/20"
    }
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden glass-morphism"
        onClick={onToggle}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 glass-morphism p-6 transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl flex items-center justify-center mr-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold premium-gradient-text">
              Eidos Connect
            </h1>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location === item.path;
                const Icon = item.icon;
                
                return (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <a className={`flex items-center p-3 rounded-xl glass-card transition-all group ${
                        isActive 
                          ? 'bg-white/20 border-white/30' 
                          : `${item.hoverColor} border-white/10`
                      }`}>
                        <Icon className={`w-5 h-5 mr-3 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="text-white font-medium">{item.label}</span>
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center">
              <Avatar className="w-12 h-12 border-2 border-white/20">
                <AvatarImage src={user?.profileImageUrl || undefined} />
                <AvatarFallback className="bg-gray-600 text-white">
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 ml-3">
                <p className="font-semibold text-white text-sm">
                  {user?.firstName || user?.email?.split('@')[0] || 'Usuário'}
                </p>
                <p className="text-xs text-gray-400">
                  {user?.plan || 'Premium'}
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                className="text-gray-400 hover:text-white hover:bg-white/10 p-2"
                title="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
