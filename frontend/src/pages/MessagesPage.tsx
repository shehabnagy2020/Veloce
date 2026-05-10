'use client';

import { useEffect } from 'react';
import { Box, Group, Paper, ScrollArea, Stack, Text, Badge, UnstyledButton } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useMessagingStore } from '../store/messaging';
import { ChatWindow } from '../components/messaging/ChatWindow';

export function MessagesPage({ conversationId }: { conversationId?: string }) {
  const { t } = useTranslation();
  const conversations = useMessagingStore((s) => s.conversations);
  const activeConversationId = useMessagingStore((s) => s.activeConversationId);
  const isLoading = useMessagingStore((s) => s.isLoading);
  const fetchConversations = useMessagingStore((s) => s.fetchConversations);
  const openConversation = useMessagingStore((s) => s.openConversation);
  const initSocketListeners = useMessagingStore((s) => s.initSocketListeners);

  useEffect(() => {
    fetchConversations();
    const cleanup = initSocketListeners();
    return cleanup;
  }, []);

  // Open the specific conversation if provided via URL params
  useEffect(() => {
    if (conversationId) {
      openConversation(conversationId);
    }
  }, [conversationId]);

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  return (
    <Group h="calc(100vh - 130px)" gap={0} align="stretch" style={{ backgroundColor: '#0B0E14' }}>
      <Stack
        style={{ width: 320, borderRight: '1px solid #1A1F2B', backgroundColor: '#0B0E14' }}
        gap={0}
        visibleFrom="sm"
      >
        <Paper p="md" style={{ borderBottom: '1px solid #1A1F2B' }}>
          <Text fw={700} size="lg">{t('messaging.title')}</Text>
        </Paper>

        <ScrollArea style={{ flex: 1 }}>
          {conversations.length === 0 && !isLoading && (
            <Text c="dimmed" ta="center" p="lg" size="sm">
              {t('messaging.noConversations')}
            </Text>
          )}
          {conversations.map((conv) => (
            <UnstyledButton
              key={conv.id}
              onClick={() => openConversation(conv.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: conv.id === activeConversationId ? '#1A1F2B' : 'transparent',
                borderBottom: '1px solid #1A1F2B',
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Box style={{ flex: 1, overflow: 'hidden' }}>
                  <Text size="sm" fw={600} truncate>{conv.other_user_name || t('messaging.unknownUser')}</Text>
                  <Text size="xs" c="dimmed" truncate>
                    {conv.last_message || ''}
                  </Text>
                </Box>
                {conv.unread_count > 0 && (
                  <Badge size="sm" color="blue" variant="filled">
                    {conv.unread_count}
                  </Badge>
                )}
              </Group>
            </UnstyledButton>
          ))}
        </ScrollArea>
      </Stack>

      <Box style={{ flex: 1, backgroundColor: '#0B0E14' }}>
        {activeConversationId && activeConv ? (
          <ChatWindow
            conversationId={activeConversationId}
            otherUserName={activeConv.other_user_name}
          />
        ) : (
          <Stack align="center" justify="center" h="100%">
            <Text c="dimmed" size="lg">{t('messaging.selectConversation')}</Text>
          </Stack>
        )}
      </Box>
    </Group>
  );
}

export default MessagesPage;
