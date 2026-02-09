'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import statuses from '@/lib/statuses';

export default function Random() {
  const router = useRouter();

  useEffect(() => {
    const statusCodes = Object.keys(statuses);
    const randomStatus = statusCodes[Math.floor(Math.random() * statusCodes.length)];

    router.replace(`/status/${randomStatus}`);
  }, [router]);

  return null;
}
