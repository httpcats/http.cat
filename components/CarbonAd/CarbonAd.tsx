'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const CarbonAd = () => {
  const pathname = usePathname();

  useEffect(() => {
    const doesCarbonExist = document.querySelector('#carbonads');

    if (!!doesCarbonExist) {
      // @ts-ignore
      _carbonads.refresh();
      return;
    }

    const script = document.createElement('script');
    script.src = '//cdn.carbonads.com/carbon.js?serve=CESITKJN&placement=httpcat';
    script.id = '_carbonads_js';
    script.async = true;

    const carbonContainer = document.getElementById('carbon-container');

    if (carbonContainer) {
      carbonContainer.appendChild(script);
    }
  }, [pathname]);

  return <div id="carbon-container" />;
};

export default CarbonAd;
