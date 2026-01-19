'use client';

import { auth } from '@/lib/firebase';
import {
  getReceivedMessagesDirect,
  getSentMessagesDirect,
  getMessageDirect,
  markMessageAsReadDirect,
} from '@/lib/firestore-client';
import {
  sendMessage as sendMessageApi,
  reportMessage as reportMessageApi,
  deleteMessage as deleteMessageApi,
} from '@/lib/messages-api';
import type { ApiResponse } from '@/types/common';
import type { Message, MessageSummary, SendMessageData } from '@/types/messages';

export class MessagesRepository {
  async getReceivedMessages(): Promise<ApiResponse<MessageSummary[]>> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const messages = await getReceivedMessagesDirect(user.uid);
      return { success: true, data: messages as MessageSummary[] };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get received messages',
      };
    }
  }

  async getSentMessages(): Promise<ApiResponse<MessageSummary[]>> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const messages = await getSentMessagesDirect(user.uid);
      return { success: true, data: messages as MessageSummary[] };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get sent messages',
      };
    }
  }

  async getMessage(messageId: string): Promise<ApiResponse<Message>> {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const message = await getMessageDirect(messageId, user.uid);
      if (!message) {
        return { success: false, error: 'Message not found' };
      }

      return { success: true, data: message as Message };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get message',
      };
    }
  }

  async sendMessage(data: SendMessageData): Promise<ApiResponse<{ messageId: string }>> {
    return sendMessageApi(data);
  }

  async markMessageAsRead(messageId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      await markMessageAsReadDirect(messageId);
      return { success: true, data: { success: true } };
    } catch (error: unknown) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to mark message as read',
      };
    }
  }

  async reportMessage(messageId: string, reason: string): Promise<ApiResponse<{ success: boolean }>> {
    return reportMessageApi(messageId, reason);
  }

  async deleteMessage(messageId: string): Promise<ApiResponse<{ success: boolean }>> {
    return deleteMessageApi(messageId);
  }
}

export const messagesRepository = new MessagesRepository();
