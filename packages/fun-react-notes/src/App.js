import PropTypes from 'prop-types'
import React, {Component, Fragment} from 'react'
import {ArrayValue} from 'react-values'
import * as _ from 'ramda'

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
              {/*<Log {...notes} />*/}
              {_.map(renderNote)(notes.value)}
            </Fragment>
          )}
        </ArrayValue>
      </div>
    )
  }
}

export default App

function createNote(idx) {
  const id = `${idx}`
  return {
    id,
    text: `Note text ${id}`,
  }
}

function renderNote(note) {
  return <Note key={note.id} note={note} />
}

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
