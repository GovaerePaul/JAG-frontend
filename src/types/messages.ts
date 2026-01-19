export type MessageStatus = 'pending' | 'delivered' | 'read';

export interface Message {
  id: string;
  senderId: string | null;
  receiverId: string;
  eventTypeId: string;
  content: string;
  isAnonymous: boolean;
  status: MessageStatus;
  isReported: boolean;
  reportReason?: string;
  replyToId?: string;
  createdAt: string;
  deliveredAt?: string;
  readAt?: string;
}

export interface MessageSummary {
  id: string;
  senderId: string | null;
  receiverId: string;
  eventTypeId: string;
  isAnonymous: boolean;
  status: MessageStatus;
  isReported: boolean;
  createdAt: string;
}

export interface SendMessageData {
  receiverId: string;
  eventTypeId: string;
  content: string;
  isAnonymous: boolean;
  replyToId?: string;
}
