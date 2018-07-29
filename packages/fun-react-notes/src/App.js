import React, {Component} from 'react'

class App extends Component {
  state = {
    title: 'Welcome to React',
    content: `To get started, edit <code>src/App.js</code> and save to reload.`,
  }

  render() {
    return (
      <div>
        <header>
          <h1>{this.state.title}</h1>
        </header>
        <p>{this.state.content}</p>
      </div>
    )
  }
}

export default App
