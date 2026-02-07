import { redirect } from 'next/navigation';

import statuses from '@/lib/statuses';

export default function Random() {
  const statusCodes = Object.keys(statuses);
  const randomStatus = statusCodes[Math.floor(Math.random() * statusCodes.length)];
  
  redirect(`/status/${randomStatus}`);
}
