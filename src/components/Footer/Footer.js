import React from 'react'

import FacebookButton from '../FacebookButton'
import GithubButton from '../GithubButton'
import TwitterButton from '../TwitterButton'
import getString from '../../lib/strings'
import styles from './Footer.module.css'

const Footer = () => (
  <footer className={styles.container}>
    <div className={styles.social}>
      <FacebookButton />
      <GithubButton />
      <TwitterButton />
    </div>

    <nav>
      <a href="/?lang=cat">{getString('LANGUAGE_LINK_TEXT')}</a>
    </nav>

    <p>{getString('DEVELOPED_BY')} <a href="https://twitter.com/rogeriopvl">@rogeriopvl</a></p>
    <p>{getString('IMAGES_BY')} Tomomi Imura (<a href="https://twitter.com/girlie_mac">@girlie_mac</a>)</p>

    <p>Check out <a href='https://www.abstractapi.com'>Abstract API</a>, the home for modern, developer-friendly  tools like the <a href='https://www.abstractapi.com/ip-geolocation-api'>IP Geolocation API</a>, <a href='https://www.abstractapi.com/vat-validation-rates-api'>VAT Validation & Rates API</a>, <a href='https://www.abstractapi.com/holidays-api'>Public Holiday API</a>, and more.</p>
  </footer>
)

export default Footer
