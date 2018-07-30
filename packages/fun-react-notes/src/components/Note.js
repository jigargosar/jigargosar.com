import React, {Component} from 'react'
import {_contains, _forEachObjIndexed, _type} from '../little-ramda'
import {observer} from 'mobx-react'
import {AutoSize} from './lib/AutoSize'

class Note extends Component {
  render() {
    const {note} = this.props
    return (
      <div>
        <Log comp={'Note'} {...note} />

        {/*<div>{note.text}</div>*/}
        <AutoSize>
          <textarea
            style={{display: 'block', width: '100%'}}
            rows={1}
            value={note.text}
            onChange={e => note.update({text: e.target.value})}
          />
        </AutoSize>
      </div>
    )
  }
}

export default observer(Note)

class Log extends Component {
  render() {
    console.groupCollapsed('Props', this.props)
    _forEachObjIndexed((v, k) => {
      console.log('Log', k, v)
      if (_contains(_type(v))(['Object', 'Array'])) {
        console.table(v)
      }
    })(this.props)
    console.groupEnd('end')
    return null
  }
}
