import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {_} from '../../little-ramda'
import Baobab from 'baobab'
import {StorageItem} from '../../services/storage'
import * as PropTypes from 'prop-types'
import {
  getDebugId,
  getText,
  getTextCursor,
  initialRoot,
  onNoteTextChangeEvent,
  selectChildren,
} from '../../ImmutableState/ImmutableNote'

if (module.hot) {
  window.Baobab = Baobab
}

function NoteDebugId(props) {
  return <div className={cn('f6 gray mr3')}>{props.debugId}</div>
}

NoteDebugId.propTypes = {debugId: PropTypes.any}

class NoteTextInput extends React.Component {
  get note() {
    return this.props.note
  }
  componentDidMount() {
    const textCursor = getTextCursor(this.note)
    textCursor.on('update', () => this.forceUpdate())
  }

  render() {
    return (
      <div
        className={cn(
          'flex-auto',
          'flex items-center',
          'pv2',
          'bb bw1 b--light-gray',
        )}
      >
        <NoteDebugId debugId={getDebugId(this.note)} />
        <div className={cn('flex-auto', 'flex')}>
          <input
            className={cn('flex-auto', 'ma0 pa0 bw0 outline-0')}
            value={getText(this.note)}
            onChange={onNoteTextChangeEvent(this.note)}
          />
        </div>
      </div>
    )
  }
}

class NoteTextLine extends React.Component {
  // componentDidMount() {
  //   const {note} = this.props
  //   const textCursor = note.select('text')
  //   textCursor.on('update', () => this.forceUpdate())
  // }

  render() {
    const {note} = this.props
    return (
      <div className={cn('code flex items-center')}>
        <div className={cn('mr3')}>-</div>

        <NoteTextInput note={note} />
      </div>
    )
  }
}
const storedState = StorageItem({
  name: 'NoteTreeState',
  getInitial: () => initialRoot,
})

class NoteTree extends React.Component {
  state = {
    // tree: new Baobab(storedState.load(), {asynchronous: false}),
    tree: new Baobab(initialRoot, {asynchronous: false}),
  }
  componentDidMount() {
    this.state.tree.on('update', () => {
      storedState.save(this.tree.serialize())
    })
  }

  renderChild = (noteCursor, idx) => {
    return (
      <F key={idx}>
        {<NoteTextLine note={noteCursor} />}
        {this.renderChildren(noteCursor)}
      </F>
    )
  }

  renderChildren = noteCursor => {
    return (
      <div className={cn('ml3')}>
        {_.map(this.renderChild)(selectChildren(noteCursor))}
      </div>
    )
  }

  render() {
    return (
      <F>
        <div className={cn('ma3 pa3 shadow-1 bg-white')}>
          {this.renderChild(this.tree, 0)}
        </div>
      </F>
    )
  }

  get tree() {
    return this.state.tree
  }
}

const Main = mrInjectAll(function Main() {
  return (
    <TypographyDefaults className={cn('mb4')}>
      <AppHeaderBar>
        <Title className={cn('flex-auto')}>
          {`Immutable Note Outliner`}
        </Title>
      </AppHeaderBar>
      <CenterLayout>
        <NoteTree />
      </CenterLayout>
    </TypographyDefaults>
  )
})

export default Main
