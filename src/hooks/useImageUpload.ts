import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useImageUpload = () => {
  const { toast } = useToast();

  const uploadImage = async (file: File) => {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('uploaded-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('image_uploads')
        .insert({
          filename: file.name,
          file_path: filePath,
          file_size: file.size,
        });

      if (dbError) throw dbError;

      return { success: true, filePath };
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Erro ao salvar imagem",
        description: "Não foi possível salvar a imagem no servidor.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return { uploadImage };
};
