import React from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (event) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <FormControl variant="outlined" size="small" sx={{ minWidth: 120, position: 'fixed', top: 16, right: 16, zIndex: 1000 }}>
      <InputLabel>Language</InputLabel>
      <Select
        value={i18n.language}
        onChange={handleLanguageChange}
        label="Language"
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="hi">हिंदी</MenuItem>
        <MenuItem value="pa">ਪੰਜਾਬੀ</MenuItem>
      </Select>
    </FormControl>
  );
};

export default LanguageSelector;
