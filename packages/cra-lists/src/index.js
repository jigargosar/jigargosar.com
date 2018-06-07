import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import registerServiceWorker from './registerServiceWorker'
import {Provider} from 'mobx-react'
import {rootStore} from './stores/rootStore'

ReactDOM.render(
  <Provider root={rootStore}>
    <App />
  </Provider>,
  document.getElementById('root'),
)
registerServiceWorker()
