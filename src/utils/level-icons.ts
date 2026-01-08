export function getBasePath(): string {
  return process.env.NEXT_PUBLIC_BASE_PATH || '';
}

export function getLevelIconPath(level: number): string {
  const levelTier = Math.min(Math.floor(level / 10) * 10, 90);
  const basePath = getBasePath();
  return `${basePath}/level-icons/level-${levelTier}.svg`;
}

export function getLogoPath(): string {
  const basePath = getBasePath();
  return `${basePath}/logo.svg`;
}

