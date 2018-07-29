import React, {Component} from 'react'

class App extends Component {
  state = {
    title: 'Welcome to React',
    content: `To get started, edit <code>src/App.js</code> and save to reload.`,
    counter: 0,
  }

  inc = () => {
    this.setState({
      counter: this.state.counter + 1,
    })
  }

  render() {
    return (
      <div>
        <header>
          <h1>{this.state.title}</h1>
        </header>
        <p>{this.state.counter}</p>
        <button onClick={this.inc}>inc</button>
      </div>
    )
  }
}

export default App
