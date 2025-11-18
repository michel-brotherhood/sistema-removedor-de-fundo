import { BackgroundConfig } from '@/components/BackgroundSelector';

export const applyBackground = async (
  processedBlob: Blob,
  backgroundConfig: BackgroundConfig
): Promise<Blob> => {
  // Se for transparente, retorna o blob original
  if (backgroundConfig.type === 'transparent') {
    return processedBlob;
  }

  const img = await loadImageFromBlob(processedBlob);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Não foi possível obter contexto do canvas');

  // Aplica o fundo baseado no tipo
  switch (backgroundConfig.type) {
    case 'solid':
      ctx.fillStyle = backgroundConfig.color1 || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;

    case 'gradient':
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, backgroundConfig.color1 || '#667eea');
      gradient.addColorStop(1, backgroundConfig.color2 || '#764ba2');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      break;

    case 'image':
      if (backgroundConfig.imageUrl) {
        const bgImg = await loadImageFromUrl(backgroundConfig.imageUrl);
        ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      }
      break;
  }

  // Desenha a imagem processada por cima
  ctx.drawImage(img, 0, 0);

  // Converte canvas para blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Falha ao criar blob'));
        }
      },
      'image/png',
      1.0
    );
  });
};

const loadImageFromBlob = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};

const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};
