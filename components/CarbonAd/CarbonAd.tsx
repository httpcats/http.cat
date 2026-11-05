'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// `placeholder` fills the ad's reserved space on phones until the ad loads,
// and stays if it never does (e.g. an ad blocker). See app/globals.css.
const CarbonAd = ({ placeholder }: { placeholder: string }) => {
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

  return (
    <div id="carbon-container">
      <div className="carbon-placeholder" aria-hidden="true">
        {placeholder}
      </div>
    </div>
  );
};

export default CarbonAd;
