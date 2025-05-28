import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { apiRequest } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { 
  Bot, 
  Send, 
  Plus, 
  MessageSquare,
  User
} from "lucide-react";

export default function Chat() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const queryClient = useQueryClient();

  const { data: conversations } = useQuery({
    queryKey: ["/api/conversations"],
  });

  const { data: messages } = useQuery({
    queryKey: ["/api/conversations", selectedConversation, "messages"],
    enabled: !!selectedConversation,
  });

  const createConversationMutation = useMutation({
    mutationFn: async (title: string) => {
      const response = await apiRequest("POST", "/api/conversations", { title });
      return response.json();
    },
    onSuccess: (newConversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversation(newConversation.id);
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: number; content: string }) => {
      const response = await apiRequest("POST", `/api/conversations/${conversationId}/messages`, {
        role: "user",
        content,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", selectedConversation, "messages"] 
      });
      setMessageInput("");
    },
  });

  const handleNewConversation = () => {
    const title = `Nova Conversa ${new Date().toLocaleString()}`;
    createConversationMutation.mutate(title);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageInput,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="glass-morphism p-4 md:p-6 sticky top-0 z-20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <Bot className="w-6 h-6 mr-3 text-pink-400" />
            Chat com IA Contextual
          </h2>
          <Button 
            onClick={handleNewConversation}
            className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white border-0"
            disabled={createConversationMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Conversa
          </Button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Conversations Sidebar */}
        <div className="w-80 border-r border-white/10 glass-morphism p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Conversas</h3>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {conversations?.map((conversation: any) => (
                <Card 
                  key={conversation.id}
                  className={`glass-card cursor-pointer transition-all ${
                    selectedConversation === conversation.id 
                      ? 'bg-blue-500/20 border-blue-500/50' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-3 text-blue-400" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(conversation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="text-center py-8 text-gray-400">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma conversa ainda</p>
                  <p className="text-xs">Crie uma nova conversa para começar</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages?.map((message: any) => (
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
                      
                      <div className={`glass-card rounded-xl p-4 max-w-2xl ${
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
                        <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/20">
                          {user?.profileImageUrl ? (
                            <img 
                              src={user.profileImageUrl} 
                              alt="Usuário" 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )) || (
                    <div className="text-center py-12 text-gray-400">
                      <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Conversa iniciada</p>
                      <p className="text-sm">Envie uma mensagem para começar a conversar com a IA</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t border-white/10 p-6">
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
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Bot className="w-16 h-16 mx-auto mb-6 text-gray-400 opacity-50" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Selecione uma conversa
                </h3>
                <p className="text-gray-400 mb-6">
                  Escolha uma conversa existente ou crie uma nova para começar
                </p>
                <Button 
                  onClick={handleNewConversation}
                  className="bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white border-0"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Conversa
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
