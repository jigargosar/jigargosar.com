import React, {Component} from 'react'
import {observer} from 'mobx-preact'
import {AutoSize} from './lib/AutoSize'
import {whenKey, withKeyEvent} from './utils'
import root from '../models'

class Note extends Component {
  render() {
    const {note} = this.props
    return (
      <div>
        {/*<Log comp={'Note'} {...note} />*/}

        {/*<div>{note.text}</div>*/}
        <AutoSize>
          <textarea
            style={{display: 'block', width: '100%'}}
            rows={1}
            value={note.text}
            onChange={e => note.update({text: e.target.value})}
            onKeyDown={withKeyEvent(whenKey('mod+enter')(root.addNote))}
          />
        </AutoSize>
      </div>
    )
  }
}

export default observer(Note)

// class Log extends Component {
//   render() {
//     console.groupCollapsed('Props', this.props)
//     _forEachObjIndexed((v, k) => {
//       console.log('Log', k, v)
//       if (_contains(_type(v))(['Object', 'Array'])) {
//         console.table(v)
//       }
//     })(this.props)
//     console.groupEnd('end')
//     return null
//   }
// }
