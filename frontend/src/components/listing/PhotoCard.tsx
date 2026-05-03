import { Stack, Text, Group, Button, Image } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRef, useState, useCallback } from 'react';
import { compressImage } from '../../utils/imageCompression';

export interface CapturedPhoto {
  file: File;
  preview: string;
  type: 'front' | 'side' | 'interior';
}

interface PhotoCardProps {
  photos: CapturedPhoto[];
  onPhotosChange: (photos: CapturedPhoto[]) => void;
}

export function PhotoCard({ photos, onPhotosChange }: PhotoCardProps) {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [activeType, setActiveType] = useState<'front' | 'side' | 'interior'>('front');
  const [showGhostFrame, setShowGhostFrame] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      setStream(mediaStream);
      setShowGhostFrame(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      // Fallback to file input
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setShowGhostFrame(false);
    }
  }, [stream]);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const compressed = await compressImage(new File([blob], `photo_${activeType}.jpg`, { type: 'image/jpeg' }));
      const preview = URL.createObjectURL(compressed);
      onPhotosChange([...photos, { file: compressed, preview, type: activeType }]);
      stopCamera();
    }, 'image/jpeg', 0.9);
  }, [videoRef, canvasRef, activeType, photos, onPhotosChange, stopCamera]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file);
    const preview = URL.createObjectURL(compressed);
    onPhotosChange([...photos, { file: compressed, preview, type: activeType }]);
  };

  const ghostFrameSVG = (type: string) => {
    const labels: Record<string, string> = { front: 'FRONT', side: 'SIDE', interior: 'INTERIOR' };
    return (
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none', zIndex: 10,
      }}>
        <div style={{
          width: '70%', height: '55%', border: '2px dashed rgba(77, 171, 247, 0.6)',
          borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(77, 171, 247, 0.05)',
        }}>
          <Text c="blue" size="xl" fw={700}>{labels[type]} {t('listing.ghostFrame')}</Text>
        </div>
      </div>
    );
  };

  return (
    <Stack gap="md">
      <Text size="lg" fw={700} c="white">{t('listing.photoStep')}</Text>
      <Group gap="sm">
        {(['front', 'side', 'interior'] as const).map((type) => (
          <Button
            key={type}
            variant={activeType === type ? 'filled' : 'outline'}
            color="blue"
            size="sm"
            onClick={() => setActiveType(type)}
          >
            {t(`listing.photo${type.charAt(0).toUpperCase() + type.slice(1)}`)}
          </Button>
        ))}
      </Group>

      <div style={{ position: 'relative', width: '100%', minHeight: 300, backgroundColor: '#0B0E14', borderRadius: 8, overflow: 'hidden' }}>
        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', display: stream ? 'block' : 'none' }} />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        {showGhostFrame && ghostFrameSVG(activeType)}

        {!stream && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300 }}>
            <Button onClick={startCamera} mb="sm">Open Camera</Button>
            <label>
              <Button component="span" variant="outline" color="gray">Upload Photo</Button>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
          </div>
        )}
        {stream && (
          <Group justify="center" mt="sm">
            <Button onClick={capturePhoto}>Capture</Button>
            <Button variant="outline" color="gray" onClick={stopCamera}>Cancel</Button>
          </Group>
        )}
      </div>

      {photos.length > 0 && (
        <Group gap="sm" mt="md">
          {photos.map((photo, i) => (
            <Image key={i} src={photo.preview} h={80} w={80} radius="sm" alt={photo.type} />
          ))}
        </Group>
      )}
    </Stack>
  );
}