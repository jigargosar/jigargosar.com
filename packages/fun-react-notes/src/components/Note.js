import React, {Component} from 'react'
import {_contains, _forEachObjIndexed, _type} from '../little-ramda'
import {observer} from 'mobx-react'

class Note extends React.PureComponent {
  render() {
    const {note} = this.props
    return (
      <div>
        <Log comp={'Note'} {...note} />
        <small>{note.id} :</small>
        <span>{note.text}</span>
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
