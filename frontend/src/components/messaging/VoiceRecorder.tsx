import { useState, useRef, useCallback } from 'react';
import { ActionIcon, Group, Text, Box } from '@mantine/core';
import { useTranslation } from 'react-i18next';

interface VoiceRecorderProps {
  onRecordingComplete: (blob: Blob, durationSec: number) => void;
  disabled?: boolean;
}

export function VoiceRecorder({ onRecordingComplete, disabled }: VoiceRecorderProps) {
  const { t } = useTranslation();
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const dur = Math.round((Date.now() - startTimeRef.current) / 1000);
        onRecordingComplete(blob, dur);
        setIsRecording(false);
        setDuration(0);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setDuration(Math.round((Date.now() - startTimeRef.current) / 1000));
      }, 500);
    } catch {
      console.error('Microphone access denied');
    }
  }, [onRecordingComplete]);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
  }, []);

  const cancelRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    setDuration(0);
  }, []);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <Group gap="xs" style={{ backgroundColor: '#1A1F2B', borderRadius: 8, padding: '4px 8px' }}>
        <Box
          style={{
            width: 8, height: 8, borderRadius: '50%', backgroundColor: '#FA5252',
            animation: 'pulse 1s ease-in-out infinite',
          }}
        />
        <Text size="sm" c="dimmed">{formatDuration(duration)}</Text>
        <ActionIcon
          variant="subtle"
          color="red"
          size="sm"
          onClick={cancelRecording}
          aria-label={t('cancel')}
        >
          ✕
        </ActionIcon>
        <ActionIcon
          variant="filled"
          color="blue"
          size="sm"
          onClick={stopRecording}
          aria-label={t('messaging.sendVoice')}
        >
          ▶
        </ActionIcon>
      </Group>
    );
  }

  return (
    <ActionIcon
      variant="subtle"
      color="blue"
      disabled={disabled}
      onClick={startRecording}
      aria-label={t('messaging.recordVoice')}
    >
      🎤
    </ActionIcon>
  );
}