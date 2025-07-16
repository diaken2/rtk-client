"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SupportOnlyContextType {
  isSupportOnly: boolean;
  setSupportOnly: (value: boolean) => void;
  resetSupportOnly: () => void;
}

const SupportOnlyContext = createContext<SupportOnlyContextType | undefined>(undefined);

export function SupportOnlyProvider({ children }: { children: React.ReactNode }) {
  const [isSupportOnly, setIsSupportOnly] = useState(false);

  // Загружаем состояние из localStorage при инициализации
  useEffect(() => {
    const savedState = localStorage.getItem('rt_support_only');
    if (savedState === 'true') {
      setIsSupportOnly(true);
    }
  }, []);

  // Сохраняем состояние в localStorage при изменении
  useEffect(() => {
    localStorage.setItem('rt_support_only', isSupportOnly.toString());
  }, [isSupportOnly]);

  const setSupportOnly = (value: boolean) => {
    setIsSupportOnly(value);
  };

  const resetSupportOnly = () => {
    setIsSupportOnly(false);
    localStorage.removeItem('rt_support_only');
  };

  return (
    <SupportOnlyContext.Provider value={{ isSupportOnly, setSupportOnly, resetSupportOnly }}>
      {children}
    </SupportOnlyContext.Provider>
  );
}

export function useSupportOnly() {
  const context = useContext(SupportOnlyContext);
  if (context === undefined) {
    throw new Error('useSupportOnly must be used within a SupportOnlyProvider');
  }
  return context;
} 