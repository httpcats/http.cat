import React from 'react'

import Header from '../Header'
import Usage from '../Usage'
import Thumbnail from '../Thumbnail'
import ThumbnailGrid from '../ThumbnailGrid'
import statuses from '../../lib/statuses'

import styles from './App.module.css'

function App() {
  return (
    <div className={styles.container}>
      <Header />
      <Usage />
      <ThumbnailGrid>
        {Object.keys(statuses).map((code, key) => (
          <Thumbnail code={code} key={code} description={statuses[code].message} />
        ))}
      </ThumbnailGrid>
    </div>
  )
}

export default App
