'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOrientation } from '@/hooks/use-orientation';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setIsCollapsed: (value: boolean) => void;
  shouldShowSidebar: boolean;
  shouldShowBottomNav: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();
  const orientation = useOrientation();

  // Never show both at the same time
  // Bottom nav: only in mobile portrait (< 768px)
  const shouldShowBottomNav = isMobile && orientation === 'portrait';

  // Sidebar: only in desktop or landscape tablet/mobile
  const shouldShowSidebar = !shouldShowBottomNav;

  useEffect(() => {
    setIsMounted(true);
    // Load from localStorage only for desktop
    if (!isMobile) {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setIsCollapsed(savedState === 'true');
      }
    }
  }, [isMobile]);

  // Auto-collapse in landscape tablet/mobile
  useEffect(() => {
    if (isMobile && orientation === 'landscape') {
      setIsCollapsed(true);
    }
  }, [isMobile, orientation]);

  const toggleSidebar = () => {
    // Don't allow toggle when bottom nav is showing
    if (shouldShowBottomNav) {
      return;
    }

    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (isMounted && !isMobile) {
      localStorage.setItem('sidebar-collapsed', String(newState));
    }
  };

  const value = {
    isCollapsed,
    toggleSidebar,
    setIsCollapsed,
    shouldShowSidebar,
    shouldShowBottomNav,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
