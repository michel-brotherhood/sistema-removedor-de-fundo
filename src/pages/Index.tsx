import { useState } from 'react';
import { ImageUploader } from '@/components/ImageUploader';
import { ImageComparison } from '@/components/ImageComparison';
import { ProcessingState } from '@/components/ProcessingState';
import { RefinementControls } from '@/components/RefinementControls';
import { BatchImageProcessor, ProcessedImage } from '@/components/BatchImageProcessor';
import { ImageHistory } from '@/components/ImageHistory';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { blobToCanvas, exportImage } from '@/utils/imageExport';
import { ExportFormat } from '@/components/ExportOptions';
import { useToast } from '@/hooks/use-toast';
import { useImageHistory } from '@/hooks/useImageHistory';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type ProcessingStage = 'upload' | 'refining' | 'processing' | 'complete';
type ProcessingMode = 'single' | 'batch';

const Index = () => {
  const [mode, setMode] = useState<ProcessingMode>('single');
  const [stage, setStage] = useState<ProcessingStage>('upload');
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [processedImageUrl, setProcessedImageUrl] = useState<string>('');
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [sensitivity, setSensitivity] = useState(0.5);
  const [edgeSmoothing, setEdgeSmoothing] = useState(0.5);
  const [batchImages, setBatchImages] = useState<ProcessedImage[]>([]);
  const [previewImage, setPreviewImage] = useState<ProcessedImage | null>(null);
  const [originalImageId, setOriginalImageId] = useState<string | null>(null);
  const { toast } = useToast();
  const { history, addToHistory, removeFromHistory, clearHistory, downloadFromHistory } = useImageHistory();
  const { uploadImage, uploadProcessedImage } = useImageUpload();

  const handleImageSelect = async (files: File[]) => {
    if (mode === 'single') {
      // Upload original image and store its ID
      const result = await uploadImage(files[0]);
      if (result.success && result.id) {
        setOriginalImageId(result.id);
      }
      
      setCurrentFile(files[0]);
      const originalUrl = URL.createObjectURL(files[0]);
      setOriginalImageUrl(originalUrl);
      setStage('refining');
    } else {
      // Modo batch - upload all original images
      const newImages: ProcessedImage[] = [];
      for (const file of files) {
        const result = await uploadImage(file);
        newImages.push({
          id: result.id || Math.random().toString(36),
          originalFile: file,
          originalUrl: URL.createObjectURL(file),
          progress: 0,
          status: 'pending' as const,
        });
      }
      setBatchImages(prev => [...prev, ...newImages]);
      setStage('refining');
    }
  };

  const handleProcess = async () => {
    if (mode === 'single') {
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
        
        // Upload processed image to storage
        if (originalImageId) {
          const filename = currentFile.name.replace(/\.[^/.]+$/, '') + '-processed.png';
          await uploadProcessedImage(blob, filename, originalImageId);
        }
        
        // Adiciona ao histórico local
        const filename = currentFile.name.replace(/\.[^/.]+$/, '') || 'imagem';
        await addToHistory(blob, filename);
        
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
    } else {
      // Modo batch
      setStage('processing');
      
      const processImage = async (image: ProcessedImage) => {
        try {
          setBatchImages(prev =>
            prev.map(img =>
              img.id === image.id ? { ...img, status: 'processing' as const } : img
            )
          );

          const imageElement = await loadImage(image.originalFile);
          
          const blob = await removeBackground(imageElement, {
            sensitivity,
            edgeSmoothing,
            onProgress: (p) => {
              setBatchImages(prev =>
                prev.map(img =>
                  img.id === image.id ? { ...img, progress: p } : img
                )
              );
            },
          });

          const processedUrl = URL.createObjectURL(blob);
          
          // Upload processed image to storage
          const filename = image.originalFile.name.replace(/\.[^/.]+$/, '') + '-processed.png';
          await uploadProcessedImage(blob, filename, image.id);
          
          // Adiciona ao histórico local
          await addToHistory(blob, filename);
          
          setBatchImages(prev =>
            prev.map(img =>
              img.id === image.id
                ? { ...img, processedUrl, processedBlob: blob, status: 'complete' as const, progress: 100 }
                : img
            )
          );
        } catch (error) {
          console.error('Erro ao processar imagem:', error);
          setBatchImages(prev =>
            prev.map(img =>
              img.id === image.id
                ? { ...img, status: 'error' as const, error: 'Falha no processamento' }
                : img
            )
          );
        }
      };

      // Processa todas as imagens em paralelo
      await Promise.all(batchImages.map(processImage));
      
      setStage('complete');
      toast({
        title: "Processamento Concluído!",
        description: `${batchImages.length} imagens processadas.`,
      });
    }
  };

  const handleReset = () => {
    if (originalImageUrl) URL.revokeObjectURL(originalImageUrl);
    if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    batchImages.forEach(img => {
      URL.revokeObjectURL(img.originalUrl);
      if (img.processedUrl) URL.revokeObjectURL(img.processedUrl);
    });
    setOriginalImageUrl('');
    setProcessedImageUrl('');
    setProcessedBlob(null);
    setCurrentFile(null);
    setProgress(0);
    setSensitivity(0.5);
    setEdgeSmoothing(0.5);
    setBatchImages([]);
    setStage('upload');
  };

  const handleRemoveImage = (id: string) => {
    setBatchImages(prev => {
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.originalUrl);
        if (removed.processedUrl) URL.revokeObjectURL(removed.processedUrl);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const handleExportAll = async (format: ExportFormat) => {
    for (const image of batchImages) {
      if (image.processedBlob) {
        try {
          const canvas = await blobToCanvas(image.processedBlob);
          const filename = image.originalFile.name.replace(/\.[^/.]+$/, '');
          await exportImage(canvas, format, filename);
        } catch (error) {
          console.error(`Erro ao exportar ${image.originalFile.name}:`, error);
        }
      }
    }
    
    toast({
      title: "Download Concluído!",
      description: `${batchImages.length} imagens exportadas em ${format.toUpperCase()}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-bg">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <header className="text-center mb-8 sm:mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-accent/50 text-accent-foreground border border-primary/20">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs sm:text-sm font-medium">Powered by AI</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent px-4">
            Remova Fundos com IA
          </h1>
          
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Tecnologia de ponta que remove fundos de imagens instantaneamente, 
            diretamente no seu navegador
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="rounded-2xl sm:rounded-3xl bg-card p-4 sm:p-8 shadow-soft">
            {stage === 'upload' && (
              <Tabs value={mode} onValueChange={(v) => setMode(v as ProcessingMode)} className="space-y-4">
                <TabsList className="grid grid-cols-2 w-full max-w-md mx-auto">
                  <TabsTrigger value="single" className="gap-2">
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">Uma Imagem</span>
                    <span className="sm:hidden">Single</span>
                  </TabsTrigger>
                  <TabsTrigger value="batch" className="gap-2">
                    <Layers className="w-4 h-4" />
                    <span className="hidden sm:inline">Múltiplas</span>
                    <span className="sm:hidden">Batch</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="single">
                  <ImageUploader onImageSelect={handleImageSelect} multiple={false} />
                </TabsContent>
                
                <TabsContent value="batch">
                  <ImageUploader onImageSelect={handleImageSelect} multiple={true} />
                </TabsContent>
              </Tabs>
            )}
            
            {stage === 'refining' && mode === 'single' && (
              <div className="space-y-4 sm:space-y-6">
                <div className="relative rounded-2xl overflow-hidden shadow-soft bg-gradient-to-br from-muted to-accent/20">
                  <img
                    src={originalImageUrl}
                    alt="Preview"
                    className="w-full h-auto object-contain max-h-64 sm:max-h-96"
                  />
                </div>
                
                <RefinementControls
                  sensitivity={sensitivity}
                  edgeSmoothing={edgeSmoothing}
                  onSensitivityChange={setSensitivity}
                  onEdgeSmoothingChange={setEdgeSmoothing}
                />
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleProcess}
                    size="lg"
                    className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft w-full sm:w-auto"
                  >
                    <Sparkles className="w-5 h-5" />
                    Processar com IA
                  </Button>
                  
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            
            {stage === 'refining' && mode === 'batch' && (
              <div className="space-y-4 sm:space-y-6">
                <BatchImageProcessor
                  images={batchImages}
                  onRemoveImage={handleRemoveImage}
                  onPreviewImage={setPreviewImage}
                  onExportAll={handleExportAll}
                />
                
                <RefinementControls
                  sensitivity={sensitivity}
                  edgeSmoothing={edgeSmoothing}
                  onSensitivityChange={setSensitivity}
                  onEdgeSmoothingChange={setEdgeSmoothing}
                />
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleProcess}
                    size="lg"
                    disabled={batchImages.length === 0}
                    className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft w-full sm:w-auto"
                  >
                    <Sparkles className="w-5 h-5" />
                    Processar {batchImages.length} Imagens
                  </Button>
                  
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
            
            {stage === 'processing' && mode === 'single' && (
              <ProcessingState progress={progress} />
            )}
            
            {stage === 'processing' && mode === 'batch' && (
              <BatchImageProcessor
                images={batchImages}
                onRemoveImage={handleRemoveImage}
                onPreviewImage={setPreviewImage}
                onExportAll={handleExportAll}
              />
            )}
            
            {stage === 'complete' && mode === 'single' && processedBlob && (
              <ImageComparison
                originalUrl={originalImageUrl}
                processedUrl={processedImageUrl}
                processedBlob={processedBlob}
                onReset={handleReset}
              />
            )}
            
            {stage === 'complete' && mode === 'batch' && (
              <BatchImageProcessor
                images={batchImages}
                onRemoveImage={handleRemoveImage}
                onPreviewImage={setPreviewImage}
                onExportAll={handleExportAll}
              />
            )}
          </div>
        </main>

        <footer className="mt-8 sm:mt-16 text-center space-y-4 px-4">
          <div className="flex justify-center">
            <ImageHistory
              history={history}
              onDownload={downloadFromHistory}
              onRemove={removeFromHistory}
              onClear={clearHistory}
            />
          </div>
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Processamento 100% no navegador • Suas imagens permanecem privadas
            </p>
            <p className="text-xs text-muted-foreground">
              Desenvolvido por Michel
            </p>
          </div>
        </footer>
      </div>
      
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Preview</DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-muted to-accent/20">
                <img
                  src={previewImage.processedUrl || previewImage.originalUrl}
                  alt={previewImage.originalFile.name}
                  className="w-full h-auto object-contain max-h-[60vh]"
                />
              </div>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => setPreviewImage(null)}
                  variant="outline"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
