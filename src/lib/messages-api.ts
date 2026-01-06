'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-functions';
import { ApiResponse } from './types';

export type MessageStatus = 'pending' | 'delivered' | 'read';

// Full message with all fields (used for message detail page)
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

// Summary for message lists (optimized, without content and heavy fields)
export interface MessageSummary {
  id: string;
  senderId: string | null;
  receiverId: string;
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

async function callMessageFunction<TRequest, TResponse>(
  functionName: string,
  data?: TRequest,
  errorMessage?: string
): Promise<ApiResponse<TResponse>> {
  try {
    const fn = httpsCallable<TRequest, TResponse>(functions, functionName);
    const result = await fn(data as TRequest);
    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : errorMessage || `Failed to call ${functionName}`
    };
  }
}

export async function sendMessage(data: SendMessageData): Promise<ApiResponse<{ messageId: string }>> {
  const result = await callMessageFunction<SendMessageData, { success: boolean; messageId: string }>(
    'sendMessageFunction',
    data,
    'Failed to send message'
  );
  if (result.success && result.data) {
    return { success: true, data: { messageId: result.data.messageId } };
  }
  return result;
}

export async function getReceivedMessages(): Promise<ApiResponse<MessageSummary[]>> {
  return callMessageFunction<void, MessageSummary[]>('getReceivedMessagesFunction', undefined, 'Failed to get received messages');
}

export async function getSentMessages(): Promise<ApiResponse<MessageSummary[]>> {
  return callMessageFunction<void, MessageSummary[]>('getSentMessagesFunction', undefined, 'Failed to get sent messages');
}

export async function getMessage(messageId: string): Promise<ApiResponse<Message>> {
  return callMessageFunction<{ messageId: string }, Message>(
    'getMessageFunction',
    { messageId },
    'Failed to get message'
  );
}

export async function markMessageAsRead(messageId: string): Promise<ApiResponse<{ success: boolean }>> {
  return callMessageFunction<{ messageId: string }, { success: boolean }>(
    'markMessageAsReadFunction',
    { messageId },
    'Failed to mark message as read'
  );
}

export async function reportMessage(messageId: string, reason: string): Promise<ApiResponse<{ success: boolean }>> {
  return callMessageFunction<{ messageId: string; reason: string }, { success: boolean }>(
    'reportMessageFunction',
    { messageId, reason },
    'Failed to report message'
  );
}

export async function deleteMessage(messageId: string): Promise<ApiResponse<{ success: boolean }>> {
  return callMessageFunction<{ messageId: string }, { success: boolean }>(
    'deleteMessageFunction',
    { messageId },
    'Failed to delete message'
  );
}

