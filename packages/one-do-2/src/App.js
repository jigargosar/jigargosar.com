import React, {Component} from 'react'
import {observer} from './lib/little-react'
import AppFrame from './components/AppFrame'

@observer
class App extends Component {
  render() {
    return (
        <AppFrame />
    )
  }

  componentDidCatch(error, info) {
    console.log(info, error)
    return <div>Error</div>
  }
}

export default App
