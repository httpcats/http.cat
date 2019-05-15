import React from 'react'

import getString from '../../lib/strings'
import styles from './Usage.module.css'

const Usage = () => (
  <div className={styles.container}>
    <h2>{getString('USAGE_TITLE')}:</h2>
    <pre>https://http.cat/[{getString('USAGE_PARAM')}]</pre>
    <p>
      <b>{getString('USAGE_NOTE_LABEL')}:</b> {getString('USAGE_NOTE_TEXT')} <code>.jpg</code>.
    </p>
  </div>
)

export default Usage
