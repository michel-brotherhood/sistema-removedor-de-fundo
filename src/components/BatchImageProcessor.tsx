import { useState } from 'react';
import { X, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExportFormat } from './ExportOptions';

export interface ProcessedImage {
  id: string;
  originalFile: File;
  originalUrl: string;
  processedUrl?: string;
  processedBlob?: Blob;
  progress: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error?: string;
}

interface BatchImageProcessorProps {
  images: ProcessedImage[];
  onRemoveImage: (id: string) => void;
  onPreviewImage: (image: ProcessedImage) => void;
  onExportAll: (format: ExportFormat) => void;
}

export const BatchImageProcessor = ({
  images,
  onRemoveImage,
  onPreviewImage,
  onExportAll,
}: BatchImageProcessorProps) => {
  const completedCount = images.filter(img => img.status === 'complete').length;
  const totalProgress = images.length > 0 
    ? Math.round(images.reduce((sum, img) => sum + img.progress, 0) / images.length)
    : 0;

  return (
    <div className="space-y-4">
      <Card className="p-4 sm:p-6 space-y-4 bg-card/80 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold text-foreground">
              Processamento em Lote
            </h3>
            <p className="text-sm text-muted-foreground">
              {completedCount} de {images.length} concluídas
            </p>
          </div>
          
          {completedCount === images.length && images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => onExportAll('png')}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                PNG
              </Button>
              <Button
                onClick={() => onExportAll('webp')}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                WEBP
              </Button>
              <Button
                onClick={() => onExportAll('jpg')}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                JPG
              </Button>
            </div>
          )}
        </div>

        <Progress value={totalProgress} className="h-2" />
      </Card>

      <ScrollArea className="h-[400px] sm:h-[500px] rounded-lg border border-border bg-card/50">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4">
          {images.map((image) => (
            <Card key={image.id} className="relative overflow-hidden group">
              <div className="aspect-square bg-gradient-to-br from-muted to-accent/20 relative">
                <img
                  src={image.processedUrl || image.originalUrl}
                  alt={image.originalFile.name}
                  className="w-full h-full object-contain"
                />
                
                {image.status === 'processing' && (
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                    <Progress value={image.progress} className="w-3/4 mb-2" />
                    <p className="text-xs text-muted-foreground">{image.progress}%</p>
                  </div>
                )}

                {image.status === 'error' && (
                  <div className="absolute inset-0 bg-destructive/10 backdrop-blur-sm flex items-center justify-center">
                    <p className="text-xs text-destructive text-center px-4">Erro ao processar</p>
                  </div>
                )}

                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  {image.status === 'complete' && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => onPreviewImage(image)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => onRemoveImage(image.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-2 sm:p-3">
                <p className="text-xs truncate text-foreground">
                  {image.originalFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {(image.originalFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
