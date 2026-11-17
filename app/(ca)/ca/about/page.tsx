import AboutPage from '@/components/AboutPage';
import { aboutMetadata } from '@/lib/about';

// The about page in Catalan, exported to out/ca/about.html. See
// specs/0007-about-page.
export const generateMetadata = () => aboutMetadata('ca');

export default function About() {
  return <AboutPage locale="ca" />;
}
