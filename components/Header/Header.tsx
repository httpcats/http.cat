import Logo from '@/components/Logo';

type HeaderProps = {
  t?: { [key: string]: string };
};

const Header = ({ t }: { t: { [key: string]: string } }) => {
  return (
    <header className="flex">
      <a href="/" className="flex text-interactive no-underline">
        <div className="pt-4">
          <Logo width={80} height={55} color="#d0383e" />
        </div>
        <h1 className="ml-2 text-4xl font-bold my-6">{t.APP_TITLE}</h1>
      </a>
    </header>
  );
};

export default Header;
