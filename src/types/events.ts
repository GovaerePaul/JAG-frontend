export type EventCategory = 'joyful' | 'sad' | 'neutral';

export interface EventType {
  id: string;
  name: string;
  description: string;
  category: EventCategory;
  icon: string;
  isActive: boolean;
  createdAt: string;
}
