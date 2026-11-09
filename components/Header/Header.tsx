import Logo from '@/components/Logo';

type HeaderProps = {
  t: { [key: string]: string };
};

const Header = ({ t }: HeaderProps) => {
  const href = t.LOCALE === 'ca' ? '/ca' : '/';

  return (
    // The spacing is on the header, not inside the link, so the link's box (and
    // its focus ring) hugs the logo and title, with p-1 of room; -m-1 keeps
    // the layout as it was. See specs/0006-keyboard-navigation.
    <header className="flex py-4">
      <a href={href} className="flex items-start p-1 -m-1 text-interactive no-underline">
        <div className="flex">
          <Logo width={80} height={55} color="#d0383e" />
        </div>
        <h1 className="ml-2 text-4xl font-bold my-2">{t.APP_TITLE}</h1>
      </a>
    </header>
  );
};

export default Header;
