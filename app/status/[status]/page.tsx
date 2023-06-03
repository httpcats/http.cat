import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import statuses, { IStatus } from '@/lib/statuses';

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

export function generateMetadata({
  params,
}: {
  params: { status: string };
}): Metadata {
  const statusObj = statuses[params.status as keyof typeof statuses] as IStatus;

  return {
    title: `${statusObj.code} ${statusObj.message} | HTTP Cats`,
    openGraph: {
      title: `${statusObj.code} ${statusObj.message} | HTTP Cats`,
      images: [
        {
          url: `https://http.cat/${statusObj.code}.jpg`,
          alt: statusObj.message,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: `https://http.cat/status/${statusObj.code}`,
      title: `${statusObj.code} ${statusObj.message} | HTTP Cats`,
      images: [`https://http.cat/${statusObj.code}`],
    },
  };
}
