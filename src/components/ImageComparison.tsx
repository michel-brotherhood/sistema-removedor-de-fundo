import { Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ImageComparisonProps {
  originalUrl: string;
  processedUrl: string;
  onReset: () => void;
}

export const ImageComparison = ({ originalUrl, processedUrl, onReset }: ImageComparisonProps) => {
  const [showProcessed, setShowProcessed] = useState(true);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = 'imagem-sem-fundo.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleDownload}
          size="lg"
          className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft"
        >
          <Download className="w-5 h-5" />
          Baixar Imagem
        </Button>
        
        <Button
          onClick={onReset}
          variant="outline"
          size="lg"
          className="gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          Nova Imagem
        </Button>
      </div>
    </div>
  );
};
