import React, { useEffect, useState } from 'react'

import getString from '../../lib/strings'
import copyIcon from '../../assets/images/copy.svg'
import styles from './Usage.module.css'


const Usage = () => {
  const [isValueCopied, setIsValueCopied] = useState(false)
  const usageValue = `https://http.cat/[${getString('USAGE_PARAM')}]`

  const copyValue = async () => {
    if (!isValueCopied) {
      await navigator.clipboard.writeText(usageValue)
      setIsValueCopied(true)
    }
  }

  useEffect(() => {
    if (isValueCopied) {
      setTimeout(() => {
        setIsValueCopied(false)
      }, 3000)
    }
  }, [isValueCopied])

  return (
    <section className={styles.container} aria-labelledby="usageTitle" >
      <h2 id="usageTitle" aria-level="2">{getString('USAGE_TITLE')}:</h2>
      <pre>
        {usageValue}
        {'clipboard' in navigator && (
          <button onClick={copyValue} title='Copy to clipboard'>
            {isValueCopied ? getString('COPIED') : <img src={copyIcon} alt={getString('COPY_ICON_ALT_TEXT')} aria-hidden />}
          </button>
        )}
      </pre>
      <p>
        <b>{getString('USAGE_NOTE_LABEL') + ': '}</b>{getString('USAGE_NOTE_TEXT') + ' '}<code>.jpg</code>.
      </p>
    </section>
  )
}

export default Usage
