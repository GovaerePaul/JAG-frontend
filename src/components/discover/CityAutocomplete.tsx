'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { searchCities } from '@/lib/users-api';
import type { CitySuggestion } from '@/types/users';

interface CityAutocompleteProps {
  value: string;
  onChange: (city: string | null) => void;
  onSelect: (city: { city: string; region?: string; country?: string }) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

export default function CityAutocomplete({
  value,
  onChange,
  onSelect,
  disabled = false,
  error = false,
  helperText,
}: CityAutocompleteProps) {
  const t = useTranslations('discover.locationPermission');
  const [inputValue, setInputValue] = useState(value);
  const [options, setOptions] = useState<CitySuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedSearch = useCallback((searchQuery: string) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (!searchQuery || searchQuery.trim().length < 2) {
      setOptions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await searchCities(searchQuery.trim(), 10);
        if (response.success && response.data) {
          setOptions(response.data.cities || []);
        } else {
          setOptions([]);
        }
      } catch (_err) {
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    setDebounceTimer(timer);
  }, [debounceTimer]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (_event: React.SyntheticEvent, newInputValue: string) => {
    setInputValue(newInputValue);
    onChange(newInputValue);
    debouncedSearch(newInputValue);
  };

  const handleChange = (
    _event: React.SyntheticEvent,
    newValue: string | CitySuggestion | null
  ) => {
    if (typeof newValue === 'string') {
      onChange(newValue);
    } else if (newValue) {
      onChange(newValue.displayName);
      onSelect({
        city: newValue.city,
        region: newValue.region,
        country: newValue.country,
      });
    } else {
      onChange(null);
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return option.displayName;
      }}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      onChange={handleChange}
      disabled={disabled}
      loading={loading}
      filterOptions={(x) => x}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t('cityLabel')}
          placeholder={t('cityPlaceholder')}
          error={error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.city}>
          {option.displayName}
        </Box>
      )}
      noOptionsText={loading ? t('searching') : t('noCitiesFound')}
    />
  );
}

