import React from 'react'
import AppFrame from './components/AppFrame'
import {Component} from './lib/little-mobx-react'

class App extends Component {
  state = {hasError: false}
  render() {
    if (this.state.hasError) {
      return this.renderError()
    }
    return <AppFrame />
  }

  componentDidCatch(error, info) {
    this.setState({hasError: true, error, info})
  }

  renderError() {
    return <div>Error Occurred</div>
  }
}

export default App
