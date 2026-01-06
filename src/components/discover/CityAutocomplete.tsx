'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
} from '@mui/material';
import { useTranslations } from 'next-intl';
import { searchCities, CitySuggestion } from '@/lib/users-api';

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

  // Debounce search
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
      } catch (err) {
        console.error('Error searching cities:', err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    setDebounceTimer(timer);
  }, [debounceTimer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Update input value when prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    onChange(newInputValue);
    debouncedSearch(newInputValue);
  };

  const handleChange = (event: any, newValue: CitySuggestion | null) => {
    if (newValue) {
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
      filterOptions={(x) => x} // Disable default filtering, we do it server-side
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

