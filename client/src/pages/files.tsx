import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Image, 
  File,
  Download,
  Trash2,
  Eye,
  RefreshCw
} from "lucide-react";

export default function Files() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: files, isLoading } = useQuery({
    queryKey: ["/api/files"],
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Erro no upload');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setUploadProgress(0);
      toast({
        title: "Upload realizado com sucesso",
        description: "Arquivo enviado e sendo processado pela IA",
      });
    },
    onError: (error: Error) => {
      setUploadProgress(0);
      toast({
        title: "Erro no upload",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = (file: File) => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain', 'image/jpeg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Apenas PDFs, arquivos de texto e imagens são aceitos",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType === 'application/pdf') return FileText;
    return File;
  };

  const getFileTypeLabel = (mimeType: string) => {
    switch (mimeType) {
      case 'application/pdf': return 'PDF';
      case 'text/plain': return 'TXT';
      case 'image/jpeg':
      case 'image/png': return 'IMG';
      default: return 'FILE';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "processed": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "processing": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "failed": return "bg-red-500/20 text-red-400 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "processed": return "Processado";
      case "processing": return "Processando";
      case "failed": return "Erro";
      default: return status;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="glass-morphism p-4 md:p-6 sticky top-0 z-20 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-white flex items-center">
            <FileText className="w-6 h-6 mr-3 text-purple-400" />
            Gerenciamento de Arquivos
          </h2>
          <Button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white border-0"
            disabled={uploadMutation.isPending}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadMutation.isPending ? "Enviando..." : "Upload"}
          </Button>
        </div>
      </header>

      <main className="p-4 md:p-6">
        {/* Upload Area */}
        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl mb-6">
          <CardContent className="p-8">
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${
                dragActive 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Envie seus arquivos
              </h3>
              <p className="text-gray-300 mb-4">
                Arraste e solte arquivos aqui ou clique para selecionar
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Suportamos PDFs, arquivos de texto e imagens (máx. 10MB)
              </p>
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
                disabled={uploadMutation.isPending}
              >
                <Upload className="w-4 h-4 mr-2" />
                Selecionar Arquivos
              </Button>
              
              {uploadMutation.isPending && (
                <div className="mt-6">
                  <Progress value={uploadProgress} className="w-full max-w-md mx-auto" />
                  <p className="text-sm text-gray-400 mt-2">
                    Enviando arquivo...
                  </p>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.txt,.jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFileUpload(file);
                }
              }}
            />
          </CardContent>
        </Card>

        {/* Files List */}
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
        ) : files?.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file: any) => {
              const FileIcon = getFileIcon(file.mimeType);
              
              return (
                <Card key={file.id} className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-4">
                          <FileIcon className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {file.originalName}
                          </h3>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      
                      <Badge className={`text-xs ${getStatusColor(file.status)} border`}>
                        {getStatusLabel(file.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-400 bg-white/10 px-2 py-1 rounded">
                        {getFileTypeLabel(file.mimeType)}
                      </span>
                      
                      <span className="text-xs text-gray-400">
                        {new Date(file.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {file.summary && (
                      <p className="text-sm text-gray-300 mb-4 line-clamp-3">
                        {file.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:bg-blue-500/20"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-400 hover:bg-green-500/20"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {file.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-400 hover:bg-yellow-500/20"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:bg-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Nenhum arquivo enviado
            </h3>
            <p className="text-gray-400 mb-6">
              Comece enviando seus primeiros arquivos para treinar a IA
            </p>
            <Button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600"
            >
              <Upload className="w-4 h-4 mr-2" />
              Enviar Primeiro Arquivo
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
