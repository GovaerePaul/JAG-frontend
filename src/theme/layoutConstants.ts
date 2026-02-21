/**
 * Layout constants for responsive display switching.
 * Single source of truth for mobile/desktop breakpoint and display values.
 */

export const LAYOUT_BREAKPOINT = 'md' as const;

export const DISPLAY_MOBILE_ONLY = {
  xs: 'flex' as const,
  [LAYOUT_BREAKPOINT]: 'none' as const,
};

export const DISPLAY_DESKTOP_ONLY = {
  xs: 'none' as const,
  [LAYOUT_BREAKPOINT]: 'flex' as const,
};

export const DISPLAY_MOBILE_BLOCK = {
  xs: 'block' as const,
  [LAYOUT_BREAKPOINT]: 'none' as const,
};

export const DISPLAY_DESKTOP_BLOCK = {
  xs: 'none' as const,
  [LAYOUT_BREAKPOINT]: 'block' as const,
};

export const BOTTOM_NAV_HEIGHT = 56;
