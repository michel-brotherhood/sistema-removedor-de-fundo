import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { ExportOptions, ExportFormat } from './ExportOptions';
import { BackgroundSelector, BackgroundConfig } from './BackgroundSelector';
import { blobToCanvas, exportImage } from '@/utils/imageExport';
import { applyBackground } from '@/utils/applyBackground';
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
  const [backgroundConfig, setBackgroundConfig] = useState<BackgroundConfig>({ type: 'transparent' });
  const [previewUrl, setPreviewUrl] = useState(processedUrl);
  const { toast } = useToast();

  useEffect(() => {
    const updatePreview = async () => {
      try {
        const blobWithBg = await applyBackground(processedBlob, backgroundConfig);
        const newUrl = URL.createObjectURL(blobWithBg);
        setPreviewUrl(newUrl);
        
        return () => URL.revokeObjectURL(newUrl);
      } catch (error) {
        console.error('Erro ao aplicar fundo:', error);
      }
    };

    updatePreview();
  }, [backgroundConfig, processedBlob]);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    try {
      const blobWithBg = await applyBackground(processedBlob, backgroundConfig);
      const canvas = await blobToCanvas(blobWithBg);
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
    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            src={previewUrl}
            alt="Processada"
            className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
              showProcessed ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </div>
        
        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-2">
          <Button
            variant={showProcessed ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setShowProcessed(true)}
            className="shadow-lg text-xs sm:text-sm"
          >
            Com IA
          </Button>
          <Button
            variant={!showProcessed ? 'default' : 'secondary'}
            size="sm"
            onClick={() => setShowProcessed(false)}
            className="shadow-lg text-xs sm:text-sm"
          >
            Original
          </Button>
        </div>
      </div>

      <BackgroundSelector value={backgroundConfig} onChange={setBackgroundConfig} />

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
