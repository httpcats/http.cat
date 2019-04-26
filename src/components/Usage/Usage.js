import React from 'react'

import styles from './Usage.module.css'

const Usage = () => (
  <div className={styles.container}>
    <h2>Usage:</h2>
    <pre>https://http.cat/[status_code]</pre>
    <p>
      <b>Note:</b> If you need an extension at the end of the URL just add <code>.jpg</code>.
    </p>
  </div>
)

export default Usage
