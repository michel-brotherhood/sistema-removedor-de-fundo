import { History, Download, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { HistoryImage } from '@/hooks/useImageHistory';
import { useState } from 'react';

interface ImageHistoryProps {
  history: HistoryImage[];
  onDownload: (image: HistoryImage, format: 'png' | 'webp' | 'jpg') => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

export const ImageHistory = ({ history, onDownload, onRemove, onClear }: ImageHistoryProps) => {
  const [showClearDialog, setShowClearDialog] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="lg" className="gap-2">
            <History className="w-5 h-5" />
            <span className="hidden sm:inline">Histórico</span>
            {history.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
                {history.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Histórico de Imagens
            </SheetTitle>
            <SheetDescription>
              Últimas {history.length} de 10 imagens processadas
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {history.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="w-full gap-2"
                onClick={() => setShowClearDialog(true)}
              >
                <Trash2 className="w-4 h-4" />
                Limpar Histórico
              </Button>
            )}

            {history.length === 0 ? (
              <Card className="p-8 text-center">
                <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Nenhuma imagem processada ainda
                </p>
              </Card>
            ) : (
              <ScrollArea className="h-[calc(100vh-250px)]">
                <div className="space-y-3 pr-4">
                  {history.map((image) => (
                    <Card key={image.id} className="p-3 space-y-3">
                      <div className="flex gap-3">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-muted to-accent/20 flex-shrink-0">
                          <img
                            src={image.dataUrl}
                            alt={image.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-medium text-sm truncate text-foreground">
                            {image.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(image.timestamp)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatSize(image.size)}
                          </p>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          className="flex-shrink-0"
                          onClick={() => onRemove(image.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" className="flex-1 gap-2">
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onDownload(image, 'png')}>
                              PNG (Melhor qualidade)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDownload(image, 'webp')}>
                              WEBP (Alta qualidade)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onDownload(image, 'jpg')}>
                              JPG (Universal)
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar histórico?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todas as {history.length} imagens do
              histórico serão removidas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onClear();
                setShowClearDialog(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Limpar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
