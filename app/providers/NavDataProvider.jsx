// app/providers/NavDataProvider.jsx
'use client';
import React, { createContext, useContext } from 'react';

const NavDataCtx = createContext(null);

export function NavDataProvider({ value, children }) {
  return <NavDataCtx.Provider value={value}>{children}</NavDataCtx.Provider>;
}

export function useNavData() {
  const ctx = useContext(NavDataCtx);
  if (!ctx) throw new Error('useNavData must be used within <NavDataProvider>');
  return ctx; // { nav, locale }
}
