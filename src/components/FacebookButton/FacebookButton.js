import React from 'react'

import facebookIcon from '../../assets/images/facebook.svg'
import styles from './FacebookButton.module.css'

const FacebookButton = ({ width, height}) => (
  <div className={styles.container}>
    <a
      href="https://www.facebook.com/httpcats"
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={facebookIcon}
        alt="Facebook logo"
        width={width}
        height={height}
      />
    </a>
  </div>
)

FacebookButton.defaultProps = {
  width: '50px',
  height: '50px'
}

export default FacebookButton
