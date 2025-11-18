import { useState, useEffect } from 'react';

export interface HistoryImage {
  id: string;
  name: string;
  timestamp: number;
  dataUrl: string;
  size: number;
}

const HISTORY_KEY = 'bg-remover-history';
const MAX_HISTORY = 10;

export const useImageHistory = () => {
  const [history, setHistory] = useState<HistoryImage[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const addToHistory = async (blob: Blob, filename: string) => {
    try {
      // Converte blob para dataURL
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      return new Promise<void>((resolve, reject) => {
        reader.onload = () => {
          const dataUrl = reader.result as string;
          
          const newImage: HistoryImage = {
            id: Date.now().toString(),
            name: filename,
            timestamp: Date.now(),
            dataUrl,
            size: blob.size,
          };

          setHistory((prev) => {
            const updated = [newImage, ...prev].slice(0, MAX_HISTORY);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
            return updated;
          });
          
          resolve();
        };
        
        reader.onerror = reject;
      });
    } catch (error) {
      console.error('Erro ao adicionar ao histórico:', error);
    }
  };

  const removeFromHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((img) => img.id !== id);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  };

  const downloadFromHistory = (image: HistoryImage, format: 'png' | 'webp' | 'jpg') => {
    // Converte dataURL de volta para blob
    fetch(image.dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${image.name}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error('Erro ao baixar do histórico:', error);
      });
  };

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    downloadFromHistory,
  };
};
