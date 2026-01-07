'use client';

import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { LanguageOutlined } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { locales, type Locale } from '@/i18n/request';

const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English'
};

export default function LanguageSwitcher() {
  const [currentLocale, setCurrentLocale] = useState<Locale>('fr');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const open = Boolean(anchorEl);

  useEffect(() => {
    const pathSegments = pathname.split('/');
    const localeFromUrl = pathSegments[1];
    if (locales.includes(localeFromUrl as Locale)) {
      setCurrentLocale(localeFromUrl as Locale);
    }
  }, [pathname]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLocaleSwitch = (newLocale: Locale) => {
    const pathSegments = pathname.split('/');
    const currentLocaleInPath = pathSegments[1];
    
    if (locales.includes(currentLocaleInPath as Locale)) {
      pathSegments[1] = newLocale;
    } else {
      pathSegments.splice(1, 0, newLocale);
    }
    
    const newPath = pathSegments.join('/') || `/${newLocale}`;
    router.push(newPath);
    handleClose();
  };

  return (
    <>
      <Tooltip title={localeNames[currentLocale]}>
        <IconButton
          onClick={handleClick}
          aria-label="Change language"
          sx={{
            color: 'text.primary',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(254, 107, 139, 0.1)',
              color: '#FE6B8B',
              transform: 'translateY(-2px)',
            },
          }}
        >
          <LanguageOutlined />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {locales.map((loc) => (
          <MenuItem
            key={loc}
            onClick={() => handleLocaleSwitch(loc)}
            selected={loc === currentLocale}
          >
            {localeNames[loc]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
