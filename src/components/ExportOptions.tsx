import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ExportFormat = 'png' | 'webp' | 'jpg';

interface ExportOptionsProps {
  onExport: (format: ExportFormat) => void;
}

export const ExportOptions = ({ onExport }: ExportOptionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          className="gap-2 bg-gradient-primary hover:opacity-90 transition-opacity shadow-soft"
        >
          <Download className="w-5 h-5" />
          Baixar Imagem
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Escolha o formato</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onExport('png')} className="cursor-pointer">
          <div className="flex flex-col gap-1">
            <span className="font-medium">PNG</span>
            <span className="text-xs text-muted-foreground">
              Melhor qualidade • Fundo transparente
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('webp')} className="cursor-pointer">
          <div className="flex flex-col gap-1">
            <span className="font-medium">WEBP (95%)</span>
            <span className="text-xs text-muted-foreground">
              Alta qualidade • Arquivo menor
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onExport('jpg')} className="cursor-pointer">
          <div className="flex flex-col gap-1">
            <span className="font-medium">JPG</span>
            <span className="text-xs text-muted-foreground">
              Compatibilidade universal • Fundo branco
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
