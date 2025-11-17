'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <div className="bg-destructive/10 mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <AlertCircle className="text-destructive h-8 w-8" />
      </div>
      <h2 className="text-foreground mb-2 text-2xl font-bold">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        {error.message || 'An unexpected error occurred'}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => (window.location.href = '/')}>
          Go Home
        </Button>
        <Button onClick={reset}>Try Again</Button>
      </div>
    </div>
  );
}
