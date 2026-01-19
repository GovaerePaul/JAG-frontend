'use client';

import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase-functions';
import { ApiResponse } from '@/types/common';
import type { Message, MessageSummary, SendMessageData } from '@/types/messages';
import {
  getReceivedMessagesDirect,
  getSentMessagesDirect,
  getMessageDirect,
  markMessageAsReadDirect,
  markMessageAsDeliveredDirect,
} from './firestore-client';
import { auth } from './firebase';

// Re-export types for backward compatibility
export type { MessageStatus, Message, MessageSummary, SendMessageData } from '@/types/messages';

// Cloud Functions
export async function sendMessage(data: SendMessageData): Promise<ApiResponse<{ messageId: string }>> {
  try {
    const fn = httpsCallable<SendMessageData, { success: boolean; messageId: string }>(
      functions,
      'sendMessageFunction'
    );
    const result = await fn(data);
    return { success: true, data: { messageId: result.data.messageId } };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    };
  }
}

export async function reportMessage(messageId: string, reason: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const fn = httpsCallable<{ messageId: string; reason: string }, { success: boolean }>(
      functions,
      'reportMessageFunction'
    );
    const result = await fn({ messageId, reason });
    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to report message'
    };
  }
}

export async function deleteMessage(messageId: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const fn = httpsCallable<{ messageId: string }, { success: boolean }>(
      functions,
      'deleteMessageFunction'
    );
    const result = await fn({ messageId });
    return { success: true, data: result.data };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete message'
    };
  }
}

// Firestore Direct
export async function getReceivedMessages(): Promise<ApiResponse<MessageSummary[]>> {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'User not authenticated' };
    
    const messages = await getReceivedMessagesDirect(user.uid);
    return { success: true, data: messages as MessageSummary[] };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get received messages'
    };
  }
}

export async function getSentMessages(): Promise<ApiResponse<MessageSummary[]>> {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'User not authenticated' };
    
    const messages = await getSentMessagesDirect(user.uid);
    return { success: true, data: messages as MessageSummary[] };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get sent messages'
    };
  }
}

export async function getMessage(messageId: string): Promise<ApiResponse<Message>> {
  try {
    const user = auth.currentUser;
    if (!user) return { success: false, error: 'User not authenticated' };
    
    const message = await getMessageDirect(messageId, user.uid);
    if (!message) return { success: false, error: 'Message not found' };
    
    return { success: true, data: message as Message };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get message'
    };
  }
}

export async function markMessageAsRead(messageId: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    await markMessageAsReadDirect(messageId);
    return { success: true, data: { success: true } };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark message as read'
    };
  }
}

export async function markMessageAsDelivered(messageId: string): Promise<ApiResponse<{ success: boolean }>> {
  try {
    await markMessageAsDeliveredDirect(messageId);
    return { success: true, data: { success: true } };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark message as delivered'
    };
  }
}
