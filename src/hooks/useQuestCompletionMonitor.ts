'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useQuests, invalidateQuestsCache } from './useQuests';
import { useLocale } from 'next-intl';
import { UserQuestStatus } from '@/lib/quests-api';

const STORAGE_KEY = 'quest_completion_shown';

interface QuestCompletion {
  questId: string;
  questName: string;
  points: number;
}

export function useQuestCompletionMonitor(
  onQuestCompleted: (completion: QuestCompletion) => void
) {
  const { user } = useAuth();
  const { quests, refetch } = useQuests();
  const locale = useLocale();
  const shownQuestIdsRef = useRef<Set<string>>(new Set());
  const previousCompletedIdsRef = useRef<Set<string>>(new Set());
  const onQuestCompletedRef = useRef(onQuestCompleted);

  useEffect(() => {
    onQuestCompletedRef.current = onQuestCompleted;
  }, [onQuestCompleted]);

  useEffect(() => {
    if (typeof window !== 'undefined' && user) {
      try {
        const stored = localStorage.getItem(`${STORAGE_KEY}_${user.uid}`);
        if (stored) {
          const shownIds = JSON.parse(stored) as string[];
          shownQuestIdsRef.current = new Set(shownIds);
        }
      } catch (error) {
        // Silent fail
      }
    }
  }, [user]);

  useEffect(() => {
    if (quests.length > 0 && user && previousCompletedIdsRef.current.size === 0) {
      const currentCompleted = new Set(
        quests.filter((q) => q.isCompleted).map((q) => q.quest.id)
      );
      previousCompletedIdsRef.current = currentCompleted;
    }
  }, [quests, user]);

  const markQuestAsShown = useCallback(
    (questId: string) => {
      if (!user) return;
      
      shownQuestIdsRef.current.add(questId);
      
      if (typeof window !== 'undefined') {
        try {
          const shownIds = Array.from(shownQuestIdsRef.current);
          localStorage.setItem(`${STORAGE_KEY}_${user.uid}`, JSON.stringify(shownIds));
        } catch (error) {
          // Silent fail
        }
      }
    },
    [user]
  );

  const checkForNewCompletions = useCallback(() => {
    if (!user || quests.length === 0) return;

    const currentCompleted = new Set(
      quests.filter((q) => q.isCompleted).map((q) => q.quest.id)
    );

    const newlyCompleted = quests.filter(
      (q) =>
        q.isCompleted &&
        !shownQuestIdsRef.current.has(q.quest.id) &&
        !previousCompletedIdsRef.current.has(q.quest.id)
    );

    if (newlyCompleted.length > 0) {
      newlyCompleted.forEach((questStatus: UserQuestStatus) => {
        const questName =
          questStatus.quest.name[locale] ||
          questStatus.quest.name['en'] ||
          questStatus.quest.id;

        markQuestAsShown(questStatus.quest.id);

        onQuestCompletedRef.current({
          questId: questStatus.quest.id,
          questName,
          points: questStatus.quest.pointsReward,
        });
      });
    }

    previousCompletedIdsRef.current = currentCompleted;
  }, [quests, user, locale, markQuestAsShown]);

  useEffect(() => {
    if (!user) return;

    const handleQuestCheck = async () => {
      await refetch();
    };

    window.addEventListener('questCacheInvalidated', handleQuestCheck);
    checkForNewCompletions();

    return () => {
      window.removeEventListener('questCacheInvalidated', handleQuestCheck);
    };
  }, [user, refetch, checkForNewCompletions]);

  useEffect(() => {
    if (quests.length > 0) {
      checkForNewCompletions();
    }
  }, [quests, checkForNewCompletions]);

  return { markQuestAsShown, checkForNewCompletions };
}

