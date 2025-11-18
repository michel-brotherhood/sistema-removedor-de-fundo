import { Settings2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface RefinementControlsProps {
  sensitivity: number;
  edgeSmoothing: number;
  onSensitivityChange: (value: number) => void;
  onEdgeSmoothingChange: (value: number) => void;
}

export const RefinementControls = ({
  sensitivity,
  edgeSmoothing,
  onSensitivityChange,
  onEdgeSmoothingChange,
}: RefinementControlsProps) => {
  return (
    <Card className="p-6 space-y-6 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 text-foreground">
        <Settings2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Refinamento</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="sensitivity" className="text-sm">
              Sensibilidade da Detecção
            </Label>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {Math.round(sensitivity * 100)}%
            </span>
          </div>
          <Slider
            id="sensitivity"
            min={0}
            max={1}
            step={0.05}
            value={[sensitivity]}
            onValueChange={(values) => onSensitivityChange(values[0])}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Ajusta a precisão da detecção do objeto principal
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="smoothing" className="text-sm">
              Suavização das Bordas
            </Label>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              {Math.round(edgeSmoothing * 100)}%
            </span>
          </div>
          <Slider
            id="smoothing"
            min={0}
            max={1}
            step={0.05}
            value={[edgeSmoothing]}
            onValueChange={(values) => onEdgeSmoothingChange(values[0])}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Suaviza as bordas para um resultado mais natural
          </p>
        </div>
      </div>
    </Card>
  );
};
