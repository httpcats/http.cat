import React from 'react'

import styles from './Thumbnail.module.css'

const Thumbnail = ({ code, description }) => (
  <div className={styles.container}>
    <div
      className={styles.image}
      style={{ backgroundImage: `url(/images/${code}.jpg)` }}
    />
    <div className={styles.content}>
      <div className={styles.title}>{code}</div>
      <p>{description}</p>
    </div>
  </div>
)

export default Thumbnail
