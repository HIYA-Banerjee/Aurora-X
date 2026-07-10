'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingOverlay } from '../components/ui/button';

export default function RootIndexRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return <LoadingOverlay visible={true} />;
}
