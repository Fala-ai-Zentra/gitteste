import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, Image, File } from "lucide-react";

interface FileUploadProps {
  onUploadComplete?: () => void;
  className?: string;
}

export default function FileUpload({ onUploadComplete, className }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
        const errorText = await response.text();
        throw new Error(errorText || 'Erro no upload');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setUploadProgress(0);
      onUploadComplete?.();
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

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    return File;
  };

  return (
    <Card className={`glass-card border-white/10 bg-white/5 backdrop-blur-xl ${className}`}>
      <CardContent className="p-6">
        <div
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            dragActive 
              ? 'border-purple-500 bg-purple-500/10' 
              : 'border-white/20 hover:border-purple-500/50 hover:bg-purple-500/5'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-purple-400" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Envie seus arquivos
          </h3>
          <p className="text-gray-300 mb-4">
            Arraste e solte ou clique para selecionar
          </p>
          <p className="text-sm text-gray-400 mb-4">
            PDFs, textos e imagens (máx. 10MB)
          </p>
          
          <Button 
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            disabled={uploadMutation.isPending}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploadMutation.isPending ? "Enviando..." : "Selecionar Arquivo"}
          </Button>
          
          {uploadMutation.isPending && (
            <div className="mt-4">
              <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
              <p className="text-sm text-gray-400 mt-2">
                Processando arquivo...
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
  );
}
