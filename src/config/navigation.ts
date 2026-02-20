import type { SvgIconComponent } from '@mui/icons-material';
import Home from '@mui/icons-material/Home';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import Explore from '@mui/icons-material/Explore';
import Inbox from '@mui/icons-material/Inbox';
import Person from '@mui/icons-material/Person';

export interface NavItem {
  id: string;
  path: string;
  icon: SvgIconComponent;
  labelKey: string;
  showBadge?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', path: '/', icon: Home, labelKey: 'nav.home' },
  { id: 'quests', path: '/quests', icon: EmojiEvents, labelKey: 'nav.quests' },
  { id: 'discover', path: '/discover', icon: Explore, labelKey: 'nav.discover' },
  {
    id: 'messages',
    path: '/messages/received',
    icon: Inbox,
    labelKey: 'nav.messages',
    showBadge: true,
  },
  { id: 'profile', path: '/profile', icon: Person, labelKey: 'nav.profile' },
];
