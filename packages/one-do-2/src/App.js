import React, {Component} from 'react'
import AppFrame from './orbit-components/AppFrame'
import {observer} from './lib/little-react'

@observer
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

  // noinspection JSMethodCanBeStatic
  renderError() {
    return <div>Error Occurred</div>
  }
}

export default App
