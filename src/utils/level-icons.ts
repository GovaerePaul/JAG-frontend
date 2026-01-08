export function getLevelIconPath(level: number): string {
  const levelTier = Math.min(Math.floor(level / 10) * 10, 90);
  return `/level-icons/level-${levelTier}.svg`;
}

