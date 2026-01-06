'use client';

import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions';
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const functions = getFunctions(app);

// Connect to emulator in development
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

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

export interface SendMessageData {
  receiverId: string;
  eventTypeId: string;
  content: string;
  isAnonymous: boolean;
  replyToId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Send a message to another user
 */
export async function sendMessage(data: SendMessageData): Promise<ApiResponse<{ messageId: string }>> {
  try {
    const sendMessageFn = httpsCallable<SendMessageData, { success: boolean; messageId: string }>(
      functions,
      'sendMessageFunction'
    );
    const result = await sendMessageFn(data);

    return {
      success: true,
      data: { messageId: result.data.messageId }
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    };
  }
}

/**
 * Get messages received by the current user
 */
export async function getReceivedMessages(): Promise<ApiResponse<Message[]>> {
  try {
    const getReceivedMessagesFn = httpsCallable<void, Message[]>(functions, 'getReceivedMessagesFunction');
    const result = await getReceivedMessagesFn();

    return {
      success: true,
      data: result.data
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get received messages'
    };
  }
}

/**
 * Get messages sent by the current user
 */
export async function getSentMessages(): Promise<ApiResponse<Message[]>> {
  try {
    const getSentMessagesFn = httpsCallable<void, Message[]>(functions, 'getSentMessagesFunction');
    const result = await getSentMessagesFn();

    return {
      success: true,
      data: result.data
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get sent messages'
    };
  }
}

/**
 * Mark a message as read
 */
export async function markMessageAsRead(messageId: string): Promise<ApiResponse<void>> {
  try {
    const markAsReadFn = httpsCallable<{ messageId: string }, { success: boolean }>(
      functions,
      'markMessageAsReadFunction'
    );
    await markAsReadFn({ messageId });

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to mark message as read'
    };
  }
}

/**
 * Report a message
 */
export async function reportMessage(messageId: string, reason: string): Promise<ApiResponse<void>> {
  try {
    const reportFn = httpsCallable<{ messageId: string; reason: string }, { success: boolean }>(
      functions,
      'reportMessageFunction'
    );
    await reportFn({ messageId, reason });

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to report message'
    };
  }
}

/**
 * Delete a message (only sender can delete)
 */
export async function deleteMessage(messageId: string): Promise<ApiResponse<void>> {
  try {
    const deleteFn = httpsCallable<{ messageId: string }, { success: boolean }>(
      functions,
      'deleteMessageFunction'
    );
    await deleteFn({ messageId });

    return { success: true };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete message'
    };
  }
}

