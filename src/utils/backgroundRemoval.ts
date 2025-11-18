import { pipeline, env } from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

interface RemovalOptions {
  sensitivity?: number;
  edgeSmoothing?: number;
  onProgress?: (progress: number) => void;
}

export const removeBackground = async (
  imageElement: HTMLImageElement, 
  options: RemovalOptions = {}
): Promise<Blob> => {
  const { sensitivity = 0.5, edgeSmoothing = 0.5, onProgress } = options;
  try {
    console.log('Iniciando processo de remoção de fundo...');
    onProgress?.(10);
    
    // Usando modelo RMBG especializado em remoção de fundo
    const segmenter = await pipeline(
      'image-segmentation', 
      'briaai/RMBG-1.4',
      { 
        device: 'webgpu',
      }
    );
    
    onProgress?.(30);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Não foi possível obter contexto do canvas');
    
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Imagem ${wasResized ? 'foi' : 'não foi'} redimensionada. Dimensões finais: ${canvas.width}x${canvas.height}`);
    
    onProgress?.(50);
    
    console.log('Processando com RMBG 1.4...');
    const result = await segmenter(canvas);
    
    onProgress?.(70);
    
    console.log('Resultado da segmentação:', result);
    
    // O resultado é um array, pegamos o primeiro elemento
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Resultado de segmentação inválido');
    }
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Não foi possível obter contexto do canvas de saída');
    
    // Desenha a imagem original
    outputCtx.drawImage(canvas, 0, 0);
    
    onProgress?.(85);
    
    // Aplica a máscara ao canal alpha
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const pixels = outputImageData.data;
    const mask = result[0].mask;
    
    // Redimensiona a máscara se necessário
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = outputCanvas.width;
    maskCanvas.height = outputCanvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    
    if (!maskCtx) throw new Error('Erro ao criar contexto da máscara');
    
    // Converte máscara para imagem e redimensiona
    const maskImageData = maskCtx.createImageData(mask.width, mask.height);
    for (let i = 0; i < mask.data.length; i++) {
      const value = mask.data[i] * 255;
      maskImageData.data[i * 4] = value;
      maskImageData.data[i * 4 + 1] = value;
      maskImageData.data[i * 4 + 2] = value;
      maskImageData.data[i * 4 + 3] = 255;
    }
    maskCtx.putImageData(maskImageData, 0, 0);
    
    // Redimensiona a máscara para o tamanho da imagem
    outputCtx.drawImage(maskCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
    const resizedMask = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Limpa o canvas e redesenha a imagem
    outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
    outputCtx.drawImage(canvas, 0, 0);
    
    // Aplica a máscara com sensibilidade e suavização
    const finalImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    
    // Primeiro passo: aplica sensibilidade
    for (let i = 0; i < pixels.length; i += 4) {
      let maskValue = resizedMask.data[i] / 255;
      
      // Ajusta sensibilidade (threshold adaptativo)
      maskValue = maskValue > (1 - sensitivity) ? 1 : maskValue < sensitivity ? 0 : maskValue;
      
      finalImageData.data[i + 3] = maskValue * 255;
    }
    
    // Segundo passo: suavização de bordas (box blur no canal alpha)
    if (edgeSmoothing > 0.1) {
      const smoothRadius = Math.ceil(edgeSmoothing * 3);
      const smoothedData = new Uint8ClampedArray(finalImageData.data);
      
      for (let y = 0; y < outputCanvas.height; y++) {
        for (let x = 0; x < outputCanvas.width; x++) {
          let sum = 0;
          let count = 0;
          
          // Box blur no canal alpha
          for (let dy = -smoothRadius; dy <= smoothRadius; dy++) {
            for (let dx = -smoothRadius; dx <= smoothRadius; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              
              if (nx >= 0 && nx < outputCanvas.width && ny >= 0 && ny < outputCanvas.height) {
                const idx = (ny * outputCanvas.width + nx) * 4 + 3;
                sum += finalImageData.data[idx];
                count++;
              }
            }
          }
          
          const idx = (y * outputCanvas.width + x) * 4 + 3;
          smoothedData[idx] = sum / count;
        }
      }
      
      // Aplica os dados suavizados
      for (let i = 3; i < finalImageData.data.length; i += 4) {
        finalImageData.data[i] = smoothedData[i];
      }
    }
    
    outputCtx.putImageData(finalImageData, 0, 0);
    console.log('Máscara aplicada com sucesso');
    
    onProgress?.(100);
    
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Blob final criado com sucesso');
            resolve(blob);
          } else {
            reject(new Error('Falha ao criar blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Erro ao remover fundo:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
