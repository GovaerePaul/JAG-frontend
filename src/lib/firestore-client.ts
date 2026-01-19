'use client';

import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { MessageStatus, MessageSummary, Message } from '@/types/messages';
import type { UserRole, ReceivableUser } from '@/types/users';
import type { EventCategory, EventType } from '@/types/events';
import type { QuestCategory, QuestActionType, Quest, UserQuestStatus } from '@/types/quests';

// Re-export types for backward compatibility
export type { MessageStatus, MessageSummary, Message };
export type { UserRole, ReceivableUser };
export type { EventCategory, EventType };
export type { QuestCategory, QuestActionType, Quest, UserQuestStatus };

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  isActive: boolean;
  role: UserRole;
  points: number;
  level: number;
  totalPointsEarned: number;
  completedQuests?: string[];
  questProgress?: Record<string, number>;
}

interface EventTypeTranslation {
  name: string;
  description: string;
}

interface EventTypeDoc {
  id: string;
  translations: Record<string, EventTypeTranslation>;
  category: EventCategory;
  icon: string;
  isActive: boolean;
  createdAt: Timestamp;
}

// Helpers
function timestampToISO(timestamp: Timestamp | Date | undefined | null): string | undefined {
  if (!timestamp) return undefined;
  if (timestamp instanceof Date) return timestamp.toISOString();
  if (typeof timestamp.toDate === 'function') return timestamp.toDate().toISOString();
  return undefined;
}

function timestampToISORequired(timestamp: Timestamp | Date | undefined | null): string {
  const result = timestampToISO(timestamp);
  if (!result) throw new Error('Required timestamp is missing');
  return result;
}

// Messages
export async function getReceivedMessagesDirect(userId: string): Promise<MessageSummary[]> {
  const q = query(
    collection(db, 'messages'),
    where('receiverId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      senderId: data.isAnonymous ? null : data.senderId,
      receiverId: data.receiverId,
      eventTypeId: data.eventTypeId,
      isAnonymous: data.isAnonymous ?? false,
      status: data.status ?? 'pending',
      isReported: data.isReported ?? false,
      createdAt: timestampToISORequired(data.createdAt),
    };
  });
}

export async function getSentMessagesDirect(userId: string): Promise<MessageSummary[]> {
  const q = query(
    collection(db, 'messages'),
    where('senderId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      senderId: data.senderId,
      receiverId: data.receiverId,
      eventTypeId: data.eventTypeId,
      isAnonymous: data.isAnonymous ?? false,
      status: data.status ?? 'pending',
      isReported: data.isReported ?? false,
      createdAt: timestampToISORequired(data.createdAt),
    };
  });
}

export async function getMessageDirect(messageId: string, currentUserId: string): Promise<Message | null> {
  const docRef = doc(db, 'messages', messageId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();

  if (data.senderId !== currentUserId && data.receiverId !== currentUserId) {
    throw new Error('Permission denied: You cannot view this message');
  }

  const isReceiver = data.receiverId === currentUserId;
  const shouldHideSender = data.isAnonymous && isReceiver;

  return {
    id: docSnap.id,
    senderId: shouldHideSender ? null : data.senderId,
    receiverId: data.receiverId,
    eventTypeId: data.eventTypeId,
    content: data.content,
    isAnonymous: data.isAnonymous ?? false,
    status: data.status ?? 'pending',
    isReported: data.isReported ?? false,
    reportReason: data.reportReason,
    replyToId: data.replyToId,
    createdAt: timestampToISORequired(data.createdAt),
    deliveredAt: timestampToISO(data.deliveredAt),
    readAt: timestampToISO(data.readAt),
  };
}

export async function markMessageAsDeliveredDirect(messageId: string): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, {
    status: 'delivered',
    deliveredAt: serverTimestamp(),
  });
}

export async function markMessageAsReadDirect(messageId: string): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, {
    status: 'read',
    readAt: serverTimestamp(),
    deliveredAt: serverTimestamp(),
  });
}

// Users
export async function getReceivableUsersDirect(currentUserId: string): Promise<ReceivableUser[]> {
  const q = query(collection(db, 'users'), where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnap) => {
      const data = docSnap.data();
      return {
        uid: data.uid || docSnap.id,
        displayName: data.displayName || '',
        photoURL: data.photoURL || '',
        role: data.role as UserRole,
      };
    })
    .filter(
      (user) =>
        user.uid !== currentUserId &&
        (user.role === 'receiver' || user.role === 'both')
    );
}

export async function getUserProfileDirect(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();
  
  // Map location if it exists, converting Timestamp to string
  const location = data.location ? {
    city: data.location.city,
    region: data.location.region,
    country: data.location.country,
    lastUpdated: data.location.lastUpdated ? timestampToISO(data.location.lastUpdated) : undefined,
  } : undefined;

  return {
    uid: data.uid || docSnap.id,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    createdAt: data.createdAt ? (timestampToISO(data.createdAt) || new Date().toISOString()) : new Date().toISOString(),
    updatedAt: data.updatedAt ? (timestampToISO(data.updatedAt) || new Date().toISOString()) : new Date().toISOString(),
    isActive: data.isActive ?? true,
    role: data.role ?? 'both',
    points: data.points ?? 0,
    level: data.level ?? 1,
    totalPointsEarned: data.totalPointsEarned ?? 0,
    location: location,
    birthDate: data.birthDate ? timestampToISO(data.birthDate) : undefined,
    preferences: data.preferences,
    completedQuests: data.completedQuests,
    questProgress: data.questProgress,
  };
}

export async function getUserStatsDirect(userId: string): Promise<{
  points: number;
  level: number;
  totalPointsEarned: number;
  messagesSentCount: number;
  messagesReceivedCount: number;
} | null> {
  const profile = await getUserProfileDirect(userId);
  if (!profile) return null;

  const [sentSnapshot, receivedSnapshot] = await Promise.all([
    getDocs(query(collection(db, 'messages'), where('senderId', '==', userId))),
    getDocs(query(collection(db, 'messages'), where('receiverId', '==', userId))),
  ]);

  return {
    points: profile.points,
    level: profile.level,
    totalPointsEarned: profile.totalPointsEarned,
    messagesSentCount: sentSnapshot.size,
    messagesReceivedCount: receivedSnapshot.size,
  };
}

// Event Types
export async function getEventTypesDirect(locale: string = 'en'): Promise<EventType[]> {
  const q = query(collection(db, 'eventTypes'), where('isActive', '==', true));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as EventTypeDoc;
    const translation = data.translations?.[locale] || data.translations?.['en'] || { name: '', description: '' };

    return {
      id: data.id || docSnap.id,
      name: translation.name,
      description: translation.description,
      category: data.category,
      icon: data.icon,
      isActive: data.isActive,
      createdAt: timestampToISORequired(data.createdAt),
    };
  });
}

// Quests
export async function getAllQuestsDirect(): Promise<Quest[]> {
  const q = query(
    collection(db, 'quests'),
    where('isActive', '==', true),
    orderBy('order', 'asc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: data.id || docSnap.id,
      name: data.name,
      description: data.description,
      category: data.category,
      pointsReward: data.pointsReward,
      targetValue: data.targetValue,
      actionType: data.actionType,
      isActive: data.isActive,
      order: data.order ?? 0,
    };
  });
}

export async function getUserQuestsDirect(userId: string): Promise<UserQuestStatus[]> {
  const quests = await getAllQuestsDirect();
  const userProfile = await getUserProfileDirect(userId);

  if (!userProfile) return [];

  const completedQuests = userProfile.completedQuests || [];
  const questProgress = userProfile.questProgress || {};

  return quests.map((quest) => {
    const isCompleted = completedQuests.includes(quest.id);
    const progress = questProgress[quest.id] || 0;
    const progressPercent = Math.min(
      Math.round((progress / quest.targetValue) * 100),
      100
    );

    return { quest, isCompleted, progress, progressPercent };
  });
}
