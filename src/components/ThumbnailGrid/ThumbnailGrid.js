import React from 'react'

import styles from './ThumbnailGrid.module.css'

const ThumbnailGrid = ({ children }) => {
  return (
    <ul className={styles.container}>
      {children.map((el, idx) => (
        <li className={styles.thumbnail} key={idx}>{el}</li>
      ))}
    </ul>
  )
}

export default ThumbnailGrid
