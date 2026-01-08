'use client';

import { Box } from '@mui/material';
import Image from 'next/image';
import { getLevelIconPath } from '@/utils/level-icons';

interface LevelIconProps {
  level: number;
  size?: number;
}

export default function LevelIcon({ level, size = 40 }: LevelIconProps) {
  const iconPath = getLevelIconPath(level);

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        src={iconPath}
        alt={`Level ${level} icon`}
        width={size}
        height={size}
        style={{
          objectFit: 'contain',
        }}
      />
    </Box>
  );
}

