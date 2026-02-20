'use client';

import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { MessageSummary, Message } from '@/types/messages';
import type { UserRole, ReceivableUser } from '@/types/users';
import type { EventCategory, EventType } from '@/types/events';
import type { Quest, UserQuestStatus } from '@/types/quests';
import type { UserProfile } from '@/types/auth';
import type { UserStats } from '@/types/common';

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

function mapMessageDoc(docSnap: QueryDocumentSnapshot<DocumentData>): MessageSummary {
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
}

const MESSAGES_PAGE_SIZE = 20;

export interface PaginatedMessages {
  messages: MessageSummary[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

export async function getReceivedMessagesDirect(
  userId: string,
  afterDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<PaginatedMessages> {
  const messagesRef = collection(db, 'messages');
  const q = afterDoc
    ? query(
      messagesRef,
      where('receiverId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(MESSAGES_PAGE_SIZE),
      startAfter(afterDoc)
    )
    : query(
      messagesRef,
      where('receiverId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(MESSAGES_PAGE_SIZE)
    );
  const snapshot = await getDocs(q);

  const messages = snapshot.docs.map(mapMessageDoc);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return {
    messages,
    lastDoc,
    hasMore: snapshot.docs.length === MESSAGES_PAGE_SIZE,
  };
}

export async function getSentMessagesDirect(
  userId: string,
  afterDoc?: QueryDocumentSnapshot<DocumentData> | null
): Promise<PaginatedMessages> {
  const messagesRef = collection(db, 'messages');
  const q = afterDoc
    ? query(
      messagesRef,
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(MESSAGES_PAGE_SIZE),
      startAfter(afterDoc)
    )
    : query(
      messagesRef,
      where('senderId', '==', userId),
      orderBy('createdAt', 'desc'),
      firestoreLimit(MESSAGES_PAGE_SIZE)
    );
  const snapshot = await getDocs(q);

  const messages = snapshot.docs.map(mapMessageDoc);
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return {
    messages,
    lastDoc,
    hasMore: snapshot.docs.length === MESSAGES_PAGE_SIZE,
  };
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

export async function markMessageAsReadDirect(messageId: string): Promise<void> {
  const docRef = doc(db, 'messages', messageId);
  await updateDoc(docRef, {
    status: 'read',
    readAt: serverTimestamp(),
    deliveredAt: serverTimestamp(),
  });
}

export async function getReceivableUsersDirect(currentUserId: string): Promise<ReceivableUser[]> {
  const q = query(
    collection(db, 'users'),
    where('isActive', '==', true),
    where('role', 'in', ['receiver', 'both']),
    firestoreLimit(50)
  );
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
    .filter((user) => user.uid !== currentUserId);
}

export async function getUserProfileDirect(userId: string): Promise<UserProfile | null> {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) return null;

  const data = docSnap.data();

  const location = data.location ? {
    city: data.location.city,
    region: data.location.region,
    country: data.location.country,
    latitude: data.location.latitude,
    longitude: data.location.longitude,
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
    messagesSentCount: data.messagesSentCount ?? 0,
    messagesReceivedCount: data.messagesReceivedCount ?? 0,
  };
}

export async function getUserStatsDirect(userId: string): Promise<UserStats | null> {
  const profile = await getUserProfileDirect(userId);
  if (!profile) return null;

  return {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    createdAt: profile.createdAt,
    isActive: profile.isActive,
    points: profile.points ?? 0,
    level: profile.level ?? 1,
    totalPointsEarned: profile.totalPointsEarned ?? 0,
    messagesSentCount: profile.messagesSentCount ?? 0,
    messagesReceivedCount: profile.messagesReceivedCount ?? 0,
  };
}

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

async function getAllQuestsDirect(): Promise<Quest[]> {
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
