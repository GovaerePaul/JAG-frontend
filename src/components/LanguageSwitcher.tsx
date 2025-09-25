'use client';

import { Button, Menu, MenuItem } from '@mui/material';
import { LanguageOutlined } from '@mui/icons-material';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { locales, type Locale } from '@/i18n/request';

const localeNames: Record<Locale, string> = {
  fr: 'Français',
  en: 'English'
};

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLocaleSwitch = (newLocale: Locale) => {
    router.push(pathname, { locale: newLocale });
    handleClose();
  };

  return (
    <>
      <Button
        onClick={handleClick}
        startIcon={<LanguageOutlined />}
        variant="outlined"
        size="small"
      >
        {localeNames[locale]}
      </Button>
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
            selected={loc === locale}
          >
            {localeNames[loc]}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
