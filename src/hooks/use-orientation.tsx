'use client';

import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const [orientation, setOrientation] = useState<Orientation>('portrait');

  useEffect(() => {
    const handleOrientationChange = () => {
      if (window.matchMedia('(orientation: portrait)').matches) {
        setOrientation('portrait');
      } else {
        setOrientation('landscape');
      }
    };

    // Initial check
    handleOrientationChange();

    // Listen for orientation changes
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    mediaQuery.addEventListener('change', handleOrientationChange);

    return () => {
      mediaQuery.removeEventListener('change', handleOrientationChange);
    };
  }, []);

  return orientation;
}
