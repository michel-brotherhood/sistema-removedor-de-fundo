import { ExportFormat } from '@/components/ExportOptions';

export const exportImage = async (
  canvas: HTMLCanvasElement,
  format: ExportFormat,
  filename: string
): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      let mimeType: string;
      let quality: number;
      let extension: string;

      switch (format) {
        case 'png':
          mimeType = 'image/png';
          quality = 1.0;
          extension = 'png';
          break;
        case 'webp':
          mimeType = 'image/webp';
          quality = 0.95;
          extension = 'webp';
          break;
        case 'jpg':
          // Para JPG, precisamos adicionar fundo branco
          const jpgCanvas = document.createElement('canvas');
          jpgCanvas.width = canvas.width;
          jpgCanvas.height = canvas.height;
          const jpgCtx = jpgCanvas.getContext('2d');
          
          if (!jpgCtx) {
            reject(new Error('Não foi possível criar contexto para JPG'));
            return;
          }
          
          // Preenche com branco
          jpgCtx.fillStyle = '#FFFFFF';
          jpgCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
          
          // Desenha a imagem por cima
          jpgCtx.drawImage(canvas, 0, 0);
          
          jpgCanvas.toBlob(
            (blob) => {
              if (blob) {
                downloadBlob(blob, `${filename}.jpg`);
                resolve();
              } else {
                reject(new Error('Falha ao criar blob JPG'));
              }
            },
            'image/jpeg',
            1.0
          );
          return;
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            downloadBlob(blob, `${filename}.${extension}`);
            resolve();
          } else {
            reject(new Error(`Falha ao criar blob ${format.toUpperCase()}`));
          }
        },
        mimeType,
        quality
      );
    } catch (error) {
      reject(error);
    }
  });
};

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Converte blob em canvas para permitir exportação em diferentes formatos
export const blobToCanvas = async (blob: Blob): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Não foi possível obter contexto do canvas'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(img.src);
      resolve(canvas);
    };
    img.onerror = () => {
      reject(new Error('Erro ao carregar imagem'));
    };
    img.src = URL.createObjectURL(blob);
  });
};
