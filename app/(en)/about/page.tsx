import AboutPage from '@/components/AboutPage';
import { aboutMetadata } from '@/lib/about';

// The about page, exported to out/about.html. See specs/0007-about-page.
export const generateMetadata = () => aboutMetadata('en');

export default function About() {
  return <AboutPage locale="en" />;
}
