import React from 'react'

import styles from './Thumbnail.module.css'

const Thumbnail = ({ code, description }) => (
  <div className={styles.container}>
    <a href={`/${code}`} aria-labelledby="thumbnailDescription">
      <div
        className={styles.image} aria-hidden
        style={{ backgroundImage: `url(/images/${code}.jpg)` }}
      />
      <div id="thumbnailDescription" className={styles.content}>
        <div className={styles.title}>{code}</div>
        <p>{description}</p>
      </div>
    </a>
  </div>
)

export default Thumbnail
