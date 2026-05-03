import { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Button, Group, Text, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { getCarDimensions, CarDimensions } from '../../utils/carDimensions';

interface DrivewayFitProps {
  bodyType: string | null;
  onClose?: () => void;
}

interface Position {
  x: number;
  y: number;
}

export function DrivewayFit({ bodyType, onClose }: DrivewayFitProps) {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [position, setPosition] = useState<Position>({ x: 0.5, y: 0.5 });
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });

  const dims: CarDimensions = getCarDimensions(bodyType);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  }, []);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const maxW = 600;
    const maxH = 400;
    canvas.width = maxW;
    canvas.height = maxH;

    // Draw background image scaled to canvas
    const scale = Math.min(maxW / image.width, maxH / image.height);
    const imgW = image.width * scale;
    const imgH = image.height * scale;
    const imgX = (maxW - imgW) / 2;
    const imgY = (maxH - imgH) / 2;

    ctx.drawImage(image, imgX, imgY, imgW, imgH);

    // Draw car silhouette (simple rectangle representation)
    // Scale car dimensions relative to the image
    // Assume the image shows roughly a 6m x 4m area
    const pixelsPerMeter = Math.min(imgW, imgH) / 4;
    const carW = dims.width * pixelsPerMeter;
    const carL = dims.length * pixelsPerMeter;

    const carX = position.x * maxW - carW / 2;
    const carY = position.y * maxH - carL / 2;

    ctx.save();
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#4DABF7';
    ctx.strokeStyle = '#4DABF7';
    ctx.lineWidth = 2;

    // Rounded rectangle for car silhouette
    const r = 4;
    ctx.beginPath();
    ctx.roundRect(carX, carY, carW, carL, r);
    ctx.fill();
    ctx.globalAlpha = 0.8;
    ctx.stroke();

    ctx.restore();

    // Labels
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(`${dims.label}`, carX + carW / 2, carY + carL / 2 - 6);
    ctx.fillText(`${dims.length}m × ${dims.width}m`, carX + carW / 2, carY + carL / 2 + 10);
  }, [image, position, dims]);

  useEffect(() => {
    drawScene();
  }, [drawScene]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const canvas = canvasRef.current!;
    setPosition({
      x: Math.min(1, Math.max(0, (e.clientX - rect.left) / canvas.width)),
      y: Math.min(1, Math.max(0, (e.clientY - rect.top) / canvas.height)),
    });
  };

  const handleMouseUp = () => setDragging(false);

  if (!image) {
    return (
      <Stack align="center" gap="md">
        <Text c="dimmed">{t('driveway.uploadPrompt', 'Upload a photo of your parking space')}</Text>
        <label>
          <Button component="span" variant="filled" color="blue">
            {t('driveway.uploadPhoto', 'Upload Photo')}
          </Button>
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        </label>
        {onClose && <Button variant="subtle" onClick={onClose}>{t('common.cancel')}</Button>}
      </Stack>
    );
  }

  return (
    <Stack align="center" gap="md">
      <Text size="sm" c="dimmed">{t('driveway.dragCar', 'Drag the car silhouette to position it')}</Text>
      <canvas
        ref={canvasRef}
        style={{ cursor: dragging ? 'grabbing' : 'grab', borderRadius: 8, maxWidth: '100%' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <Group>
        <Button variant="subtle" size="xs" onClick={() => setImage(null)}>
          {t('driveway.newPhoto', 'New Photo')}
        </Button>
        {onClose && <Button variant="subtle" onClick={onClose}>{t('common.cancel')}</Button>}
      </Group>
    </Stack>
  );
}