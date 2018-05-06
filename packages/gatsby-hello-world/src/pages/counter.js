import React from 'react'

let counterJump = function() {
  return 10
}

class Counter extends React.Component {
  constructor() {
    super()
    this.state = {count: 0}
  }

  render() {
    return (
      <div>
        <h1>Counter</h1>
        <p>current count: {this.state.count}</p>
        <button
          onClick={() => this.setState({
            count: this.state.count + counterJump(),
          })}
        >plus
        </button>
        <button
          onClick={() => this.setState({
            count: this.state.count - counterJump(),
          })}
        >minus
        </button>
      </div>
    )
  }
}

export default Counter
