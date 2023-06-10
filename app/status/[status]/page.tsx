import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

import { getStatusInfo } from '@/lib/status-info';

import statuses from '@/lib/statuses';

export default async function Info({ params }: { params: { status: string } }) {
  const statusObj = statuses[params.status as unknown as keyof typeof statuses];
  const statusInfoHTML = await getStatusInfo(params.status);

  return (
    <main>
      <nav>
        <Link href="/" className="text-white">{`< Back to home`}</Link>
      </nav>

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
      <section className="flex justify-center">
        <div className="max-w-3xl">
          <h2>Description</h2>
          <div dangerouslySetInnerHTML={{ __html: statusInfoHTML }} />
        </div>
      </section>
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
  const statusObj = statuses[params.status as unknown as keyof typeof statuses];

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
