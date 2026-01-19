export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GamificationStats {
  points: number;
  level: number;
  totalPointsEarned: number;
}

export interface UserStats extends GamificationStats {
  uid: string;
  email?: string;
  displayName?: string;
  createdAt?: string;
  lastSignIn?: string;
  isActive?: boolean;
  messagesSentCount: number;
  messagesReceivedCount: number;
}
