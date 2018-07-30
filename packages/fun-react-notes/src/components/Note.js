import React, {Component} from 'react'
import {observer} from 'mobx-preact'
import {AutoSize} from './lib/AutoSize'
import {whenKey, withKeyEvent} from './utils'
import root from '../models'

@observer
class Note extends Component {
  render({note} = this.props) {
    return (
      <div>
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

export default Note
