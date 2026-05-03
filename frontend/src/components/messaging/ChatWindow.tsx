import { useState, useRef, useEffect } from 'react';
import {
  Box, TextInput, ActionIcon, Group, Paper, Stack, Text, Image as MantineImage,
  ScrollArea, Loader,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMessagingStore } from '../../store/messaging';
import { VoiceRecorder } from './VoiceRecorder';
import { WaveformDisplay } from './WaveformDisplay';
import { apiUpload } from '../../services/api';

interface ChatWindowProps {
  conversationId: string;
  otherUserName?: string;
}

export function ChatWindow({ conversationId, otherUserName }: ChatWindowProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messages = useMessagingStore((s) => s.messages);
  const isLoading = useMessagingStore((s) => s.isLoading);
  const sendMessage = useMessagingStore((s) => s.sendMessage);
  const sendImageMessage = useMessagingStore((s) => s.sendImageMessage);
  const sendVoiceMessage = useMessagingStore((s) => s.sendVoiceMessage);
  const typingUsers = useMessagingStore((s) => s.typingUsers);
  const emitTyping = useMessagingStore((s) => s.sendMessage);

  const typingList = typingUsers[conversationId] || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(conversationId, text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSending(true);
    try {
      await sendImageMessage(conversationId, file);
    } catch (err) {
      console.error('Failed to send image:', err);
    } finally {
      setSending(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleVoiceComplete = async (blob: Blob, durationSec: number) => {
    setSending(true);
    try {
      await sendVoiceMessage(conversationId, blob, durationSec);
    } catch (err) {
      console.error('Failed to send voice note:', err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <Stack h="100%" gap={0}>
      {otherUserName && (
        <Paper p="sm" style={{ borderBottom: '1px solid #1A1F2B' }}>
          <Text fw={600} size="sm">{otherUserName}</Text>
        </Paper>
      )}

      <ScrollArea style={{ flex: 1 }} p="md">
        {isLoading ? (
          <Loader size="sm" />
        ) : (
          <Stack gap="xs">
            {messages.map((msg) => (
              <Box
                key={msg.id}
                style={{
                  alignSelf: msg.sender_id === 'me' ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                }}
              >
                <Paper
                  p="sm"
                  radius="md"
                  style={{
                    backgroundColor: msg.sender_id === 'me' ? '#1971C2' : '#1A1F2B',
                    color: '#E1E4EA',
                  }}
                >
                  {msg.content_type === 'text' && (
                    <Text size="sm">{msg.text_content}</Text>
                  )}
                  {msg.content_type === 'image' && msg.file_url && (
                    <MantineImage
                      src={msg.file_url}
                      radius="sm"
                      style={{ maxHeight: 200 }}
                      alt="Shared image"
                    />
                  )}
                  {msg.content_type === 'voice_note' && (
                    <WaveformDisplay
                      waveform={msg.file_waveform || []}
                      audioUrl={msg.file_url || undefined}
                      durationSec={msg.file_duration_sec}
                    />
                  )}
                  <Text size="xs" c="dimmed" mt={4}>
                    {formatTime(msg.created_at)}
                  </Text>
                </Paper>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Stack>
        )}
      </ScrollArea>

      {typingList.length > 0 && (
        <Text size="xs" c="dimmed" px="md">{t('messaging.typing')}</Text>
      )}

      <Group p="sm" style={{ borderTop: '1px solid #1A1F2B' }} gap="xs">
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <ActionIcon
          variant="subtle"
          color="blue"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending}
        >
          📎
        </ActionIcon>

        <VoiceRecorder onRecordingComplete={handleVoiceComplete} disabled={sending} />

        <TextInput
          style={{ flex: 1 }}
          placeholder={t('messaging.typeMessage')}
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />

        <ActionIcon
          variant="filled"
          color="blue"
          onClick={handleSend}
          disabled={!text.trim() || sending}
        >
          ➤
        </ActionIcon>
      </Group>
    </Stack>
  );
}