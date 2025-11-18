import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageComparison } from '@/components/ImageComparison';
import { ProcessingState } from '@/components/ProcessingState';
import { RefinementControls } from '@/components/RefinementControls';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ProcessingStage = 'upload' | 'refining' | 'processing' | 'complete';

const Index = () => {
  const [stage, setStage] = useState<ProcessingStage>('upload');
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [sensitivity, setSensitivity] = useState(0.5);
  const [edgeSmoothing, setEdgeSmoothing] = useState(0.5);
  const { toast } = useToast();

  const handleImageSelect = async (file: File) => {
    setCurrentFile(file);
    const originalUrl = URL.createObjectURL(file);
    setOriginalImageUrl(originalUrl);
    setStage('refining');
  };

  const handleProcess = async () => {
    if (!currentFile) return;
    
    try {
      setStage('processing');
      setProgress(0);

      const imageElement = await loadImage(currentFile);
      
      const blob = await removeBackground(imageElement, {
        sensitivity,
        edgeSmoothing,
        onProgress: (p) => setProgress(p),
      });

      setProcessedBlob(blob);
      const processedUrl = URL.createObjectURL(blob);
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
      setStage('refining');
    }
  };

  const handleReset = () => {
    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    setOriginalImageUrl('');
    setProcessedImageUrl('');
    setProcessedBlob(null);
    setCurrentFile(null);
    setProgress(0);
    setSensitivity(0.5);
    setEdgeSmoothing(0.5);
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
            
            {stage === 'refining' && (
              <div className="space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-soft bg-gradient-to-br from-muted to-accent/20">
                  <img
                    src={originalImageUrl}
                    alt="Preview"
                    className="w-full h-auto object-contain max-h-96"
                  />
                </div>
                
                <RefinementControls
                  sensitivity={sensitivity}
                  edgeSmoothing={edgeSmoothing}
                  onSensitivityChange={setSensitivity}
                  onEdgeSmoothingChange={setEdgeSmoothing}
                />
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleProcess}
                    size="lg"
                    className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft"
                  >
                    <Sparkles className="w-5 h-5" />
                    Processar com IA
                  </Button>
                  
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            
            {stage === 'processing' && (
              <ProcessingState progress={progress} />
            )}
            
            {stage === 'complete' && processedBlob && (
              <ImageComparison
                originalUrl={originalImageUrl}
                processedUrl={processedImageUrl}
                processedBlob={processedBlob}
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
