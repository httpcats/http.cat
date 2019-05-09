import React from 'react'

import FacebookButton from '../FacebookButton'
import GithubButton from '../GithubButton'
import TwitterButton from '../TwitterButton'
import styles from './Footer.module.css'

const Footer = () => (
  <div className={styles.container}>
    <div className={styles.social}>
      <FacebookButton />
      <GithubButton />
      <TwitterButton />
    </div>
    <p>Developed by <a href="https://twitter.com/rogeriopvl">@rogeriopvl</a></p>
    <p>Images by Tomomi Imura (<a href="https://twitter.com/girlie_mac">@girlie_mac</a>)</p>
  </div>
)

export default Footer
