import React from 'react'

import twitterIcon from '../../assets/images/twitter.svg'

const TwitterButton = ({ width, height}) => (
  <div>
    <a
      href="https://twitter.com/rogeriopvl"
      target="_blank"
      rel="noopener noreferrer"
      title="http.cat dev twitter"
    >
      <img
        src={twitterIcon}
        alt="Twitter logo"
        width={width}
        height={height}
      />
    </a>
  </div>
)

TwitterButton.defaultProps = {
  width: '50px',
  height: '50px'
}

export default TwitterButton
