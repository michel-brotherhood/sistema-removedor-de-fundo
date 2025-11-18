import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageComparison } from '@/components/ImageComparison';
import { ProcessingState } from '@/components/ProcessingState';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';

type ProcessingStage = 'upload' | 'processing' | 'complete';

const Index = () => {
  const [stage, setStage] = useState<ProcessingStage>('upload');
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    try {
      setStage('processing');
      setProgress(0);

      const originalUrl = URL.createObjectURL(file);
      setOriginalImageUrl(originalUrl);

      const imageElement = await loadImage(file);
      
      const processedBlob = await removeBackground(imageElement, (p) => {
        setProgress(p);
      });

      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImageUrl(processedUrl);
      
      setStage('complete');
      
      toast({
        title: "Sucesso!",
        description: "Fundo removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: "Erro ao processar",
        description: "Não foi possível remover o fundo. Tente novamente.",
        variant: "destructive",
      });
      setStage('upload');
    }
  };

  const handleReset = () => {
    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    setOriginalImageUrl('');
    setProcessedImageUrl('');
    setProgress(0);
    setStage('upload');
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 text-accent-foreground border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Powered by AI</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Remova Fundos com IA
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tecnologia de ponta que remove fundos de imagens instantaneamente, 
            diretamente no seu navegador
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-card p-8 shadow-soft">
            {stage === 'upload' && (
              <ImageUploader onImageSelect={handleImageSelect} />
            )}
            
            {stage === 'processing' && (
              <ProcessingState progress={progress} />
            )}
            
            {stage === 'complete' && (
              <ImageComparison
                originalUrl={originalImageUrl}
                processedUrl={processedImageUrl}
                onReset={handleReset}
              />
            )}
          </div>
        </main>

        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>Processamento 100% no navegador • Suas imagens permanecem privadas</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
