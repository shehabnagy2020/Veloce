import { useRef, useEffect, useState } from 'react';
import { Box } from '@mantine/core';

interface WaveformDisplayProps {
  waveform: number[];
  audioUrl?: string;
  durationSec?: number;
}

export function WaveformDisplay({ waveform, audioUrl, durationSec }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveform.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const barWidth = Math.max(2, w / waveform.length - 1);
    const gap = 1;

    ctx.clearRect(0, 0, w, h);

    waveform.forEach((amplitude, i) => {
      const barHeight = Math.max(2, amplitude * h * 0.8);
      const x = i * (barWidth + gap);
      const y = (h - barHeight) / 2;

      const playedPortion = progress * waveform.length;
      if (i < playedPortion) {
        ctx.fillStyle = '#4DABF7';
      } else {
        ctx.fillStyle = '#868E96';
      }

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, 1);
      ctx.fill();
    });
  }, [waveform, progress]);

  const handlePlayPause = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current && durationSec) {
          setProgress(audioRef.current.currentTime / durationSec);
        }
      });
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDuration = (sec?: number) => {
    if (!sec) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      onClick={handlePlayPause}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        cursor: audioUrl ? 'pointer' : 'default',
        padding: '4px 0',
      }}
    >
      <Box style={{ fontSize: 16 }}>{isPlaying ? '⏸' : '▶'}</Box>
      <canvas
        ref={canvasRef}
        style={{ width: 120, height: 32, flexShrink: 0 }}
      />
      <Box style={{ fontSize: 12, color: '#868E96' }}>
        {formatDuration(durationSec)}
      </Box>
    </Box>
  );
}