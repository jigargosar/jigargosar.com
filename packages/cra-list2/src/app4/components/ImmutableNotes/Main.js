import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {_} from '../../little-ramda'
import Baobab from 'baobab'
import {
  getDebugId,
  getText,
  getTextCursor,
  onNoteTextChangeEvent,
  selectChildren,
} from '../../ImmutableState/ImmutableNote'
import {state} from '../../ImmutableState/ImmutableNoteTree'

if (module.hot) {
  window.Baobab = Baobab
}

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
      <input
        className={cn('flex-auto', 'ma0 pa0 bw0 outline-0')}
        value={getText(this.note)}
        onChange={onNoteTextChangeEvent(this.note)}
      />
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
        <div
          className={cn(
            'flex-auto',
            'flex items-center',
            'pv2',
            'bb bw1 b--light-gray',
          )}
        >
          <div className={cn('f6 gray mr3')}>{getDebugId(note)}</div>
          <div className={cn('flex-auto', 'flex')}>
            <NoteTextInput note={note} />
          </div>
        </div>
      </div>
    )
  }
}

class NoteTree extends React.Component {
  renderChild = (noteCursor, idx) => (
    <F key={idx}>
      {<NoteTextLine note={noteCursor} />}
      {this.renderChildren(noteCursor)}
    </F>
  )

  renderChildren = noteCursor => (
    <div className={cn('ml3')}>
      {_.map(this.renderChild)(selectChildren(noteCursor))}
    </div>
  )

  render = () => (
    <F>
      <div className={cn('ma3 pa3 shadow-1 bg-white')}>
        {this.renderChild(state.tree, 0)}
      </div>
    </F>
  )
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
