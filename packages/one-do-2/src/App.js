import React from 'react'
import AppFrame from './components/AppFrame'
import {Component} from './lib/little-mobx-react'

class App extends Component {
  render() {
    return <AppFrame />
  }

  componentDidCatch(error, info) {
    console.log(info, error)
    return <div>Error</div>
  }
}

export default App
