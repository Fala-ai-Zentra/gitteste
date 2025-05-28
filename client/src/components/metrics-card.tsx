import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  gradient: string;
  delay?: string;
}

export default function MetricsCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  gradient,
  delay = "0s"
}: MetricsCardProps) {
  return (
    <Card 
      className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:scale-105 transition-transform animate-float"
      style={{ animationDelay: delay }}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 bg-gradient-to-br ${gradient} rounded-xl`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-green-400 text-sm font-semibold bg-green-500/20 px-2 py-1 rounded-full">
            {change}
          </span>
        </div>
        
        <h3 className="text-2xl font-bold text-white mb-1">
          {value}
        </h3>
        
        <p className="text-gray-400 text-sm">
          {title}
        </p>
      </CardContent>
    </Card>
  );
}
