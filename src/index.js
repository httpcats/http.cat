import React from 'react'
import { hydrate, render } from 'react-dom'

import App from './components/App'
import * as serviceWorker from './serviceWorker'
import './index.css'

const root = document.getElementById('root')

root.hasChildNodes() ? hydrate(<App />, root) : render(<App />, root)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
