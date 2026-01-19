'use client';

import type { EventType } from '@/types/events';
import { Box, Typography } from '@mui/material';

interface EventTypeDisplayProps {
  eventTypeId: string;
  eventTypes: EventType[];
  variant?: 'body1' | 'body2' | 'caption';
  iconSize?: string;
}

export default function EventTypeDisplay({
  eventTypeId,
  eventTypes,
  variant = 'body1',
  iconSize = '1.5rem',
}: EventTypeDisplayProps) {
  const eventType = eventTypes.find((et) => et.id === eventTypeId);

  if (!eventType) {
    return <Typography variant={variant}>{eventTypeId}</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {eventType.icon && (
        <Typography variant={variant} component="span" sx={{ fontSize: iconSize }}>
          {eventType.icon}
        </Typography>
      )}
      <Typography variant={variant} sx={{ fontWeight: variant === 'body1' ? 'medium' : 'normal' }}>
        {eventType.name}
      </Typography>
    </Box>
  );
}
