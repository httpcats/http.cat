import Image from 'next/image';
import Link from 'next/link';

import statuses, { IStatus } from '@/lib/statuses';

export const metadata = {};

export default function Info({ params }: { params: { status: string } }) {
  const statusObj = statuses[params.status as keyof typeof statuses] as IStatus;

  return (
    <main>
      <Link href="/" className="text-white">{`< Back to home`}</Link>
      <h1 className="text-center my-12">
        {statusObj.code} {statusObj.message}
      </h1>
      <div className="text-center">
        <Image
          src={`/images/${statusObj.code.toString()}.jpg`}
          alt={statusObj.message}
          width={750}
          height={600}
          className="w-full h-full max-w-3xl"
        />
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(statuses).map((status) => ({ status }));
}
