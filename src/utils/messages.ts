import { Message, MessageStatus } from '@/lib/messages-api';

export function getStatusColor(status: MessageStatus): 'success' | 'info' | 'warning' | 'default' {
  switch (status) {
    case 'read':
      return 'success';
    case 'delivered':
      return 'info';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
}

export function getStatusLabel(status: MessageStatus, t: (key: string) => string): string {
  switch (status) {
    case 'read':
      return t('status.read');
    case 'delivered':
      return t('status.delivered');
    case 'pending':
      return t('status.pending');
    default:
      return status;
  }
}

