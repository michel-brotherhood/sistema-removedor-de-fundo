import { useState } from 'react';
import { Palette, Upload, Droplet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type BackgroundType = 'transparent' | 'solid' | 'gradient' | 'image';

export interface BackgroundConfig {
  type: BackgroundType;
  color1?: string;
  color2?: string;
  imageUrl?: string;
}

interface BackgroundSelectorProps {
  value: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
}

const PRESET_COLORS = [
  '#FFFFFF', '#000000', '#F3F4F6', '#E5E7EB',
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899'
];

const PRESET_GRADIENTS = [
  { colors: ['#667eea', '#764ba2'], name: 'Purple Dream' },
  { colors: ['#f093fb', '#f5576c'], name: 'Pink Sunset' },
  { colors: ['#4facfe', '#00f2fe'], name: 'Ocean Blue' },
  { colors: ['#43e97b', '#38f9d7'], name: 'Fresh Mint' },
  { colors: ['#fa709a', '#fee140'], name: 'Warm Flame' },
  { colors: ['#30cfd0', '#330867'], name: 'Deep Sea' },
];

export const BackgroundSelector = ({ value, onChange }: BackgroundSelectorProps) => {
  const [customColor1, setCustomColor1] = useState(value.color1 || '#FFFFFF');
  const [customColor2, setCustomColor2] = useState(value.color2 || '#000000');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange({ type: 'image', imageUrl: url });
    }
  };

  return (
    <Card className="p-4 sm:p-6 space-y-4 bg-card/80 backdrop-blur-sm border-border/50">
      <div className="flex items-center gap-2 text-foreground">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Fundo Personalizado</h3>
      </div>

      <Tabs 
        value={value.type} 
        onValueChange={(type) => onChange({ type: type as BackgroundType })}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 w-full">
          <TabsTrigger value="transparent" className="text-xs sm:text-sm">Transparente</TabsTrigger>
          <TabsTrigger value="solid" className="text-xs sm:text-sm">Cor</TabsTrigger>
          <TabsTrigger value="gradient" className="text-xs sm:text-sm">Gradiente</TabsTrigger>
          <TabsTrigger value="image" className="text-xs sm:text-sm">Imagem</TabsTrigger>
        </TabsList>

        <TabsContent value="transparent" className="mt-4">
          <p className="text-sm text-muted-foreground text-center py-4">
            Fundo transparente (padrão para PNG)
          </p>
        </TabsContent>

        <TabsContent value="solid" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Cores Predefinidas</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onChange({ type: 'solid', color1: color })}
                  className={`w-full aspect-square rounded-lg border-2 transition-all hover:scale-110 ${
                    value.color1 === color ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-color">Cor Personalizada</Label>
            <div className="flex gap-2">
              <Input
                id="custom-color"
                type="color"
                value={customColor1}
                onChange={(e) => setCustomColor1(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Button
                onClick={() => onChange({ type: 'solid', color1: customColor1 })}
                variant="outline"
                className="flex-1"
              >
                Aplicar Cor
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gradient" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label>Gradientes Predefinidos</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESET_GRADIENTS.map((gradient) => (
                <button
                  key={gradient.name}
                  onClick={() => onChange({ 
                    type: 'gradient', 
                    color1: gradient.colors[0], 
                    color2: gradient.colors[1] 
                  })}
                  className={`h-16 rounded-lg border-2 transition-all hover:scale-105 ${
                    value.color1 === gradient.colors[0] && value.color2 === gradient.colors[1]
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-border'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${gradient.colors[0]}, ${gradient.colors[1]})`
                  }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gradiente Personalizado</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="color"
                value={customColor1}
                onChange={(e) => setCustomColor1(e.target.value)}
                className="w-full sm:w-20 h-10 cursor-pointer"
              />
              <Input
                type="color"
                value={customColor2}
                onChange={(e) => setCustomColor2(e.target.value)}
                className="w-full sm:w-20 h-10 cursor-pointer"
              />
              <Button
                onClick={() => onChange({ type: 'gradient', color1: customColor1, color2: customColor2 })}
                variant="outline"
                className="flex-1"
              >
                Aplicar Gradiente
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="image" className="mt-4">
          <div className="space-y-4">
            <Label htmlFor="bg-image" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
                <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                <p className="text-sm text-center text-muted-foreground">
                  Clique para selecionar uma imagem de fundo
                </p>
              </div>
            </Label>
            <Input
              id="bg-image"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            
            {value.imageUrl && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img src={value.imageUrl} alt="Fundo" className="w-full h-32 object-cover" />
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};
