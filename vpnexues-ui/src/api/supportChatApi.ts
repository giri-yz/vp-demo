import httpClient from './httpClient';

export interface ChatMessageDto {
  id: string;
  sender: 'VISITOR' | 'BOT' | 'ADMIN';
  body: string;
  createdAt: string;
}

export interface ChatSessionDto {
  id: string;
  visitorName: string;
  visitorEmail: string | null;
  countryCode: string | null;
  subject: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  createdAt: string;
  closedAt: string | null;
  messages: ChatMessageDto[];
}

export interface CreateChatSessionInput {
  visitorName: string;
  visitorEmail?: string;
  countryCode?: string;
  subject?: string;
}

export async function createChatSession(input: CreateChatSessionInput): Promise<ChatSessionDto> {
  const { data } = await httpClient.post<ChatSessionDto>('/api/support-chats', input);
  return data;
}

export async function postChatMessage(
  sessionId: string,
  sender: 'VISITOR' | 'BOT',
  body: string,
): Promise<ChatMessageDto> {
  const { data } = await httpClient.post<ChatMessageDto>(`/api/support-chats/${sessionId}/messages`, {
    sender,
    body,
  });
  return data;
}

export async function getChatSession(sessionId: string): Promise<ChatSessionDto> {
  const { data } = await httpClient.get<ChatSessionDto>(`/api/support-chats/${sessionId}`);
  return data;
}

export async function updateChatContact(
  sessionId: string,
  visitorName: string,
  visitorEmail: string,
): Promise<ChatSessionDto> {
  const { data } = await httpClient.put<ChatSessionDto>(`/api/support-chats/${sessionId}/contact`, {
    visitorName,
    visitorEmail,
  });
  return data;
}

export async function notifyChatAdmins(sessionId: string): Promise<void> {
  await httpClient.post(`/api/support-chats/${sessionId}/notify`);
}
