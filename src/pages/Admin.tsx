import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Download, Image as ImageIcon, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ImageUpload {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
}

export default function Admin() {
  const [images, setImages] = useState<ImageUpload[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<ImageUpload | null>(null);
  const { signOut } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('image_uploads')
        .select('*')
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from('uploaded-images')
      .getPublicUrl(filePath);
    return data.publicUrl;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const downloadImage = (filePath: string, filename: string) => {
    const url = getImageUrl(filePath);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  const handleDeleteClick = (image: ImageUpload) => {
    setImageToDelete(image);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!imageToDelete) return;

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('uploaded-images')
        .remove([imageToDelete.file_path]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('image_uploads')
        .delete()
        .eq('id', imageToDelete.id);

      if (dbError) throw dbError;

      toast({
        title: 'Imagem deletada',
        description: 'A imagem foi removida com sucesso.',
      });

      // Reload images
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: 'Erro ao deletar',
        description: 'Não foi possível deletar a imagem.',
        variant: 'destructive',
      });
    } finally {
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-3xl">
                <ImageIcon className="w-8 h-8 text-primary" />
                Admin - Imagens Subidas
              </CardTitle>
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Total de imagens: {images.length}
            </p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Carregando imagens...</p>
          </div>
        ) : images.length === 0 ? (
          <Card className="animate-fade-in">
            <CardContent className="py-12 text-center">
              <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Nenhuma imagem foi subida ainda.
              </p>
            </CardContent>
          </Card>
        ) : (
          <ScrollArea className="h-[calc(100vh-280px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image, index) => (
                <Card
                  key={image.id}
                  className="animate-scale-in overflow-hidden"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="aspect-video relative overflow-hidden bg-muted">
                    <img
                      src={getImageUrl(image.file_path)}
                      alt={image.filename}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm mb-2 truncate" title={image.filename}>
                      {image.filename}
                    </h3>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      <p>Tamanho: {formatSize(image.file_size)}</p>
                      <p>
                        Subida: {formatDistanceToNow(new Date(image.uploaded_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => downloadImage(image.file_path, image.filename)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Baixar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(image)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja deletar a imagem "{imageToDelete?.filename}"? 
                Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm}>
                Deletar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
