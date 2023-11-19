import Link from 'next/link';
import Image from 'next/image';

type ThumbnailProps = {
  code: number;
  description: string;
};

const Thumbnail = ({ code, description }: ThumbnailProps) => (
  <div className="flex flex-col flex-grow text-white overflow-hidden rounded shadow bg-[--interactive]">
    <Link href={`/status/${code}`} className='text-white no-underline'>
      <div className='pt-[56.25%] relative overflow-hidden'>
        <Image
          src={`/images/${code}.jpg`}
          alt=""
          loading='lazy'
          fill
          className="contrast-75 hover:contrast-100 transition duration-500 object-cover scale-[160%] md:scale-[200%] lg:scale-[160%]"
        />
      </div>
      <div className="flex flex-col px-4 pt-4">
        <div className="text-3xl font-semibold uppercase">{code}</div>
        <p className='text-base font-semibold'>{description}</p>
      </div>
    </Link>
  </div>
);

export default Thumbnail;
