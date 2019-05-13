import React from 'react'

import getString from '../../lib/strings'
import Logo from '../Logo'
import styles from './Header.module.css'

const Header = () => (
  <header className={styles.container}>
    <a href="/" className={styles.link}>
      <div className={styles.logo}>
        <Logo width="80" height="55" color="#d0383e" />
      </div>
    <h1 className={styles.title}>
      {getString('APP_TITLE')}
    </h1>
  </a>
  </header>
)

export default Header
