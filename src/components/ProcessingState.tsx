import { Loader2, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ProcessingStateProps {
  progress: number;
}

export const ProcessingState = ({ progress }: ProcessingStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-primary blur-2xl opacity-50 animate-pulse" />
        <div className="relative p-8 rounded-full bg-gradient-primary">
          <Sparkles className="w-16 h-16 text-primary-foreground animate-pulse" />
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-2xl font-semibold text-foreground">
          Processando com IA
        </h3>
        <p className="text-muted-foreground">
          Removendo o fundo da sua imagem...
        </p>
      </div>

      <div className="w-full max-w-xs space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-center text-sm text-muted-foreground">
          {progress}%
        </p>
      </div>
    </div>
  );
};
