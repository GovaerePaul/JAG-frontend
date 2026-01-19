export type QuestCategory = 'profile' | 'messages' | 'engagement';

export type QuestActionType = 
  | 'update_favorites' 
  | 'send_message' 
  | 'receive_message' 
  | 'update_location'
  | 'update_photo';

export interface Quest {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  category: QuestCategory;
  pointsReward: number;
  targetValue: number;
  actionType: QuestActionType;
  isActive: boolean;
  order: number;
}

export interface UserQuestStatus {
  quest: Quest;
  isCompleted: boolean;
  progress: number;
  progressPercent: number;
}
