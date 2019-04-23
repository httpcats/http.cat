import React from 'react'

import styles from './ThumbnailGrid.module.css'

const ThumbnailGrid = ({ children }) => {
  return (
    <ul className={styles.container}>
      {children.map(el => (
        <li className={styles.thumbnail}>{el}</li>
      ))}
    </ul>
  )
}

export default ThumbnailGrid
