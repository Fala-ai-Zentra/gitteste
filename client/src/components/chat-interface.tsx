import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/api";
import { 
  Bot, 
  Send, 
  Plus,
  User
} from "lucide-react";

export default function ChatInterface() {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState("");
  const [activeConversation, setActiveConversation] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: messages } = useQuery({
    queryKey: ["/api/conversations", activeConversation, "messages"],
    enabled: !!activeConversation,
  });

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/conversations", {
        title: `Chat ${new Date().toLocaleTimeString()}`
      });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setActiveConversation(newConversation.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeConversation) {
        throw new Error("Nenhuma conversa ativa");
      }
      
      const response = await apiRequest("POST", `/api/conversations/${activeConversation}/messages`, {
        role: "user",
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", activeConversation, "messages"] 
      });
      setMessageInput("");
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    if (!activeConversation) {
      // Create new conversation first
      createConversationMutation.mutate();
      return;
    }
    
    sendMessageMutation.mutate(messageInput);
  };

  // Use the first conversation as active if none selected
  const firstConversation = conversations?.[0];
  const currentConversation = activeConversation || firstConversation?.id;

  // If we have a first conversation but no active one, set it
  if (firstConversation && !activeConversation) {
    setActiveConversation(firstConversation.id);
  }

  return (
    <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-white flex items-center">
            <Bot className="w-6 h-6 mr-3 text-pink-400" />
            Chat com IA Contextual
          </CardTitle>
          <Button 
            onClick={() => createConversationMutation.mutate()}
            size="sm"
            className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white border-0"
            disabled={createConversationMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-6 pt-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 mb-4 bg-black/20 rounded-xl p-4">
          <div className="space-y-4">
            {messages?.length ? (
              messages.map((message: any) => (
                <div 
                  key={message.id} 
                  className={`flex items-start space-x-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  <div className={`glass-card rounded-xl p-3 max-w-md ${
                    message.role === 'user' 
                      ? 'bg-blue-500/20 border-blue-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}>
                    <p className="text-sm text-white whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <span className="text-xs text-gray-400 mt-2 block">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </span>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 border-2 border-white/20">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-gray-600 text-white">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Olá! Como posso ajudar?</p>
                <p className="text-sm">
                  Analisei seus dados e estou pronto para responder suas perguntas sobre leads e CRM
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="flex space-x-3">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Digite sua mensagem..."
            className="flex-1 glass-morphism border-white/20 text-white placeholder-gray-400 focus:border-blue-500"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            onClick={handleSendMessage}
            className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white border-0"
            disabled={!messageInput.trim() || sendMessageMutation.isPending}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
