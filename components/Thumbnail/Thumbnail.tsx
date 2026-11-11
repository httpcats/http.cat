'use client';

import Link from 'next/link';
import Image from 'next/image';

type ThumbnailProps = {
  code: number;
  description: string;
  // position in the grid, to load the first row's images right away
  index: number;
  t: { [key: string]: string };
};

// The first row of the grid (three columns on desktop) is on screen when the
// page opens, and its first image is the page's Largest Contentful Paint, so
// those load eagerly. The rest stay lazy.
const EAGER_THUMBNAILS = 3;

const Thumbnail = ({ code, description, index, t }: ThumbnailProps) => {
  const hrefBase = t.LOCALE === 'ca' ? '/ca' : '';

  const saveScrollPosition = () => {
    sessionStorage.setItem('homeScrollPosition', window.scrollY.toString());
  };

  return (
    // The card's overflow-hidden clips the link's own focus ring, so the card
    // shows it instead, as a ring around itself (specs/0006).
    <div id={`${code}`} className="flex flex-col flex-grow h-full text-white overflow-hidden rounded shadow bg-[--interactive] has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-[color:var(--text-color)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[color:var(--bg-color)]">
      <Link
        href={`${hrefBase}/status/${code}`}
        onClick={saveScrollPosition}
        className="group text-white no-underline focus-visible:outline-none"
      >
        <div className="pt-[56.25%] relative overflow-hidden">
          <Image
            src={`/images/${code}.jpg`}
            alt=""
            loading={index < EAGER_THUMBNAILS ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : undefined}
            fill
            className="contrast-[70%] hover:contrast-100 group-focus-visible:contrast-100 transition duration-500 object-cover scale-[140%]"
          />
        </div>
        <div className="flex flex-col px-4 pt-4">
          <div className="text-[2rem] tracking-[2px] font-semibold uppercase">
            {code}
          </div>
          <p className="font-semibold">{description}</p>
        </div>
      </Link>
    </div>
  );
};

export default Thumbnail;
