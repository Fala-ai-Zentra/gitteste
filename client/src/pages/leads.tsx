import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertLeadSchema } from "@shared/schema";
import { apiRequest } from "@/lib/api";
import { 
  Users, 
  Plus, 
  Search, 
  Star,
  Mail,
  Phone,
  Building,
  Calendar,
  TrendingUp,
  Edit,
  Trash2
} from "lucide-react";
import { z } from "zod";

const leadFormSchema = insertLeadSchema.extend({
  email: z.string().email("Email inválido"),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

export default function Leads() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: leads, isLoading } = useQuery({
    queryKey: ["/api/leads"],
  });

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      company: "",
      status: "new",
      source: "",
      notes: "",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const response = await apiRequest("POST", "/api/leads", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsDialogOpen(false);
      form.reset();
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LeadFormData> }) => {
      const response = await apiRequest("PATCH", `/api/leads/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      setIsDialogOpen(false);
      setEditingLead(null);
      form.reset();
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/leads/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
  });

  const onSubmit = (data: LeadFormData) => {
    if (editingLead) {
      updateLeadMutation.mutate({ id: editingLead.id, data });
    } else {
      createLeadMutation.mutate(data);
    }
  };

  const handleEdit = (lead: any) => {
    setEditingLead(lead);
    form.reset(lead);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este lead?")) {
      deleteLeadMutation.mutate(id);
    }
  };

  const filteredLeads = leads?.filter((lead: any) => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "contacted": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "qualified": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "converted": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "lost": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "new": return "Novo";
      case "contacted": return "Contatado";
      case "qualified": return "Qualificado";
      case "converted": return "Convertido";
      case "lost": return "Perdido";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="glass-morphism p-4 md:p-6 sticky top-0 z-20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <Users className="w-6 h-6 mr-3 text-green-400" />
            Gerenciamento de Leads
          </h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0"
                onClick={() => {
                  setEditingLead(null);
                  form.reset();
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Lead
              </Button>
            </DialogTrigger>
            
            <DialogContent className="glass-morphism border-white/20 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {editingLead ? "Editar Lead" : "Novo Lead"}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="glass-morphism border-white/20 text-white"
                              placeholder="Nome completo"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="email"
                              className="glass-morphism border-white/20 text-white"
                              placeholder="email@exemplo.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="glass-morphism border-white/20 text-white"
                              placeholder="(11) 99999-9999"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="glass-morphism border-white/20 text-white"
                              placeholder="Nome da empresa"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="glass-morphism border-white/20 text-white">
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="new">Novo</SelectItem>
                              <SelectItem value="contacted">Contatado</SelectItem>
                              <SelectItem value="qualified">Qualificado</SelectItem>
                              <SelectItem value="converted">Convertido</SelectItem>
                              <SelectItem value="lost">Perdido</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="source"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fonte</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              className="glass-morphism border-white/20 text-white"
                              placeholder="Website, social, referral..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="glass-morphism border-white/20 text-white"
                            placeholder="Informações adicionais sobre o lead..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      disabled={createLeadMutation.isPending || updateLeadMutation.isPending}
                    >
                      {editingLead ? "Atualizar" : "Criar"} Lead
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-4 md:p-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar leads..."
              className="pl-10 glass-morphism border-white/20 text-white placeholder-gray-400"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 glass-morphism border-white/20 text-white">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="new">Novo</SelectItem>
              <SelectItem value="contacted">Contatado</SelectItem>
              <SelectItem value="qualified">Qualificado</SelectItem>
              <SelectItem value="converted">Convertido</SelectItem>
              <SelectItem value="lost">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Leads Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="glass-card border-white/10 bg-white/5 backdrop-blur-xl animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-white/20 rounded mb-4"></div>
                  <div className="h-3 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded mb-4"></div>
                  <div className="h-6 bg-white/10 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredLeads?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((lead: any) => (
              <Card key={lead.id} className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-1">{lead.name}</h3>
                      <div className="flex items-center text-gray-300 text-sm mb-2">
                        <Mail className="w-4 h-4 mr-2" />
                        {lead.email}
                      </div>
                      {lead.phone && (
                        <div className="flex items-center text-gray-300 text-sm mb-2">
                          <Phone className="w-4 h-4 mr-2" />
                          {lead.phone}
                        </div>
                      )}
                      {lead.company && (
                        <div className="flex items-center text-gray-300 text-sm">
                          <Building className="w-4 h-4 mr-2" />
                          {lead.company}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400 font-medium">
                        {Math.round(lead.score || 0)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <Badge className={`${getStatusColor(lead.status)} border`}>
                      {getStatusLabel(lead.status)}
                    </Badge>
                    
                    {lead.source && (
                      <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                        {lead.source}
                      </span>
                    )}
                  </div>

                  {lead.notes && (
                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">
                      {lead.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </div>
                    
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(lead)}
                        className="text-blue-400 hover:bg-blue-500/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(lead.id)}
                        className="text-red-400 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || statusFilter !== "all" ? "Nenhum lead encontrado" : "Nenhum lead cadastrado"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || statusFilter !== "all" 
                ? "Tente ajustar os filtros de busca" 
                : "Comece criando seu primeiro lead para gerenciar seus contatos"
              }
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button 
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Lead
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
