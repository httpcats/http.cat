'use client';

import { useEffect } from 'react';

const ScrollRestore = () => {
  useEffect(() => {
    const savedPosition = sessionStorage.getItem('homeScrollPosition');
    if (savedPosition) {
      window.scrollTo(0, parseInt(savedPosition, 10));
      sessionStorage.removeItem('homeScrollPosition');
    }
  }, []);

  return null;
};

export default ScrollRestore;
