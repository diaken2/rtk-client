'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CityContextType {
  city: string;
  setCity: (city: string) => void;
}

const CityContext = createContext<CityContextType | undefined>(undefined);

function getCityFromCookie() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(/(?:^|; )user-city=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : '';
}

export const CityProvider = ({ children }: { children: ReactNode }) => {
  const [city, setCity] = useState('');

  useEffect(() => {
    setCity(getCityFromCookie());
  }, []);

  // При смене города обновляем cookie
  const updateCity = (newCity: string) => {
    setCity(newCity);
    document.cookie = `user-city=${encodeURIComponent(newCity)}; path=/; max-age=31536000`;
  };

  return (
    <CityContext.Provider value={{ city, setCity: updateCity }}>
      {children}
    </CityContext.Provider>
  );
};

export function useCity() {
  const context = useContext(CityContext);
  if (!context) {
    throw new Error('useCity must be used within a CityProvider');
  }
  return context;
} 