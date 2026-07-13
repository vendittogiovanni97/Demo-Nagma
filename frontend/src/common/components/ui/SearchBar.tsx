'use client';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '@/common/components/ui/Icon';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';

export interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
  className?: string;
  slotProps?: {
    input?: React.ComponentProps<typeof TextField>['slotProps'] extends { input?: infer T }
      ? T
      : Record<string, unknown>;
  };
}

export const SearchBar = ({
  value: controlledValue,
  onChange,
  onSubmit,
  placeholder,
  fullWidth = false,
  className,
  slotProps,
}: SearchBarProps) => {
  const { t } = useTranslation();
  const [internalValue, setInternalValue] = useState('');
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : internalValue;

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (!isControlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    if (!isControlled) setInternalValue('');
    onChange?.('');
    onSubmit?.('');
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      onSubmit?.(value);
    }
  };

  return (
    <TextField
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder ?? t('Cerca...')}
      fullWidth={fullWidth}
      size="small"
      className={className}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
               <Icon name="search" size={16} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClear} edge="end">
                <Icon name="close" size={16} />
              </IconButton>
            </InputAdornment>
          ) : null,
          ...slotProps?.input,
          className: (() => {
            const classNameString =
              (slotProps?.input as { className?: string } | undefined)?.className || '';
            return `${classNameString} ${classNameString.includes('table-searchbar') ? '' : 'table-searchbar'}`.trim();
          })(),
        },
      }}
    />
  );
};

export default SearchBar;
