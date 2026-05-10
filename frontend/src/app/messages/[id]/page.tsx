'use client';

import { MessagesPage } from '../../../pages/MessagesPage';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MessagesConversation({ params }: Props) {
  const { id } = await params;
  return <MessagesPage conversationId={id} />;
}