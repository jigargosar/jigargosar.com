import PropTypes from 'prop-types'
import React, {Component, Fragment} from 'react'
import {ArrayValue} from 'react-values'
import * as _ from 'ramda'

function createNote(idx) {
  const id = `${idx}`
  return {
    id,
    text: `Note text ${id}`,
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <header>
          <h1>Fun React Notes</h1>
        </header>
        <ArrayValue defaultValue={_.times(createNote)(5)}>
          {notes => (
            <Fragment>
              <Log notes={notes.value} />
              <Log {...notes} />
            </Fragment>
          )}
        </ArrayValue>
      </div>
    )
  }
}

export default App

class Log extends Component {
  static defaultProps = {
    children: null,
  }

  static propTypes = {
    children: PropTypes.any,
  }

  render() {
    _.forEachObjIndexed((v, k) => {
      console.log('Log', k, v)
      if (_.contains(_.type(v))(['Object', 'Array'])) {
        console.table(v)
      }
    })(this.props)
    return this.props.children
  }
}
