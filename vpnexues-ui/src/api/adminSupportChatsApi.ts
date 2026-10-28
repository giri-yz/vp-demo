import httpClient from './httpClient';
import type { ChatSessionDto, ChatMessageDto } from './supportChatApi';

export type { ChatSessionDto, ChatMessageDto };

export async function listSessions(status?: string): Promise<ChatSessionDto[]> {
  const { data } = await httpClient.get<ChatSessionDto[]>('/api/admin/support-chats', {
    params: status ? { status } : {},
  });
  return data;
}

export async function replyToSession(sessionId: string, body: string): Promise<ChatMessageDto> {
  const { data } = await httpClient.post<ChatMessageDto>(`/api/admin/support-chats/${sessionId}/reply`, {
    sender: 'ADMIN',
    body,
  });
  return data;
}

export async function updateSessionStatus(sessionId: string, status: string): Promise<ChatSessionDto> {
  const { data } = await httpClient.put<ChatSessionDto>(`/api/admin/support-chats/${sessionId}/status`, null, {
    params: { status },
  });
  return data;
}

export async function removeSession(sessionId: string): Promise<void> {
  await httpClient.delete(`/api/admin/support-chats/${sessionId}`);
}
