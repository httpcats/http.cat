import React from 'react'

import getString from '../../lib/strings'
import Logo from '../Logo'
import styles from './Header.module.css'

const Header = () => (
  <header className={styles.container}>
    <a href="/" className={styles.link} aria-labelledby="headerTitle" >
      <div className={styles.logo} tabIndex="-1" aria-hidden >
        <Logo width="80" height="55" color="#d0383e" />
      </div>
    <h1 id="headerTitle" className={styles.title} aria-level="1">
      {getString('APP_TITLE')}
    </h1>
  </a>
  </header>
)

export default Header
