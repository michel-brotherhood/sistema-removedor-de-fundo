import { useCallback, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
}

export const ImageUploader = ({ onImageSelect }: ImageUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onImageSelect(file);
    } else {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem válida.",
        variant: "destructive",
      });
    }
  }, [onImageSelect, toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  }, [onImageSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center
        min-h-[400px] rounded-2xl border-2 border-dashed
        transition-all duration-300 cursor-pointer
        bg-gradient-to-br from-accent/50 to-card
        hover:shadow-glow
        ${isDragging 
          ? 'border-primary bg-primary/5 scale-[1.02]' 
          : 'border-border hover:border-primary/50'
        }
      `}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      
      <div className="flex flex-col items-center gap-4 pointer-events-none">
        <div className="p-6 rounded-full bg-gradient-primary">
          <Upload className="w-12 h-12 text-primary-foreground" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-semibold text-foreground">
            Arraste sua imagem aqui
          </h3>
          <p className="text-muted-foreground">
            ou clique para selecionar do seu computador
          </p>
        </div>

        <div className="flex gap-2 text-xs text-muted-foreground">
          <span className="px-3 py-1 rounded-full bg-muted">JPG</span>
          <span className="px-3 py-1 rounded-full bg-muted">PNG</span>
          <span className="px-3 py-1 rounded-full bg-muted">WEBP</span>
        </div>
      </div>
    </div>
  );
};
