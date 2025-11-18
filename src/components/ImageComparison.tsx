import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { ExportOptions, ExportFormat } from './ExportOptions';
import { blobToCanvas, exportImage } from '@/utils/imageExport';
import { useToast } from '@/hooks/use-toast';

interface ImageComparisonProps {
  originalUrl: string;
  processedUrl: string;
  processedBlob: Blob;
  onReset: () => void;
}

export const ImageComparison = ({ originalUrl, processedUrl, processedBlob, onReset }: ImageComparisonProps) => {
  const [showProcessed, setShowProcessed] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const canvas = await blobToCanvas(processedBlob);
      await exportImage(canvas, format, 'imagem-sem-fundo');
      
      toast({
        title: "Download iniciado!",
        description: `Imagem exportada em ${format.toUpperCase()} com alta qualidade.`,
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="relative rounded-2xl overflow-hidden shadow-glow bg-card">
        <div className="aspect-video relative bg-gradient-to-br from-muted to-accent/20">
          <img
            src={originalUrl}
            alt="Original"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              showProcessed ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <img
            src={processedUrl}
            alt="Processada"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              showProcessed ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant={showProcessed ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setShowProcessed(true)}
            className="shadow-lg"
          >
            Com IA
          </Button>
          <Button
            variant={!showProcessed ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setShowProcessed(false)}
            className="shadow-lg"
          >
            Original
          </Button>
        </div>
      </div>

      <div className="flex gap-3 justify-center flex-wrap">
        <ExportOptions onExport={handleExport} />
        
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="gap-2"
          disabled={isExporting}
        >
          <RotateCcw className="w-5 h-5" />
          Nova Imagem
        </Button>
      </div>
    </div>
  );
};
