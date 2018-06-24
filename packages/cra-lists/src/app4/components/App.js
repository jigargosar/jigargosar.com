// Foo

/*eslint-disable*/
import React from 'react'
import {
  Button,
  CenterLayout,
  List,
  ListItem,
  RootContainer,
  Section,
  Text,
  Title,
} from './ui'
import {
  C,
  F,
  injectAllStates,
  isAnyHotKey,
  isHotKey,
  O,
  observer,
  OC,
  RC,
  renderKeyedById,
  WithState,
} from './utils'
import {mJS} from '../mobx/utils'

const R = require('ramda')
const RA = require('ramda-adjunct')
const RX = require('ramda-extension')
const cn = RX.cx

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class NoteInput extends C {
  componentDidMount() {
    console.log(mJS(this.props.note.textSelection))
  }

  restoreSelection = e => {
    const {start, end} = this.props.note.textSelection
    e.target.selectionStart = start
    e.target.selectionEnd = end
  }

  r({note}) {
    return (
      <input
        autoFocus
        className={cn('bw0 flex-auto ma0 pa1 lh-copy blue')}
        placeholder={'Note text ...'}
        value={note.text}
        onChange={note.onTextChange}
        onSelect={note.onEditTextSelect}
        onFocus={this.restoreSelection}
      />
    )
  }
}

class Note extends C {
  r({note}) {
    return (
      <ListItem className={cn('flex items-center lh-copy')}>
        <Button onClick={note.onToggleDeleteEvent}>X</Button>
        <Text>{`${note.sortIdx}`}</Text>
        {!note.isEditing && (
          <Text
            className={cn(
              'pa1',
              {'o-50': note.deleted},
              {blue: note.isSelected},
            )}
          >
            {note.text}
          </Text>
        )}
        {note.isEditing && <NoteInput note={note} />}
      </ListItem>
    )
  }
}

function ListToolbar() {
  return (
    <WithState>
      {({view}) => (
        <Section className={cn('pl3')}>
          <Button onClick={view.onAddNewNoteEvent}>ADD</Button>
        </Section>
      )}
    </WithState>
  )
}

class NoteListShortcuts extends C {
  componentDidMount() {
    console.log('componentDidMount')
    window.addEventListener('keydown', this.onKeydown)
  }
  componentWillUnmount() {
    console.log('componentWillUnmount')
    window.removeEventListener('keydown', this.onKeydown)
  }

  render() {
    return (
      <WithState>
        {({view}) => {
          this.view = view
          return null
        }}
      </WithState>
    )
  }

  onKeydown = e => {
    console.debug('window.keydown', e)
    const wrapPD = fn => e => {
      e.preventDefault()
      fn(e)
    }
    R.cond([
      [isHotKey('ArrowUp'), wrapPD(this.view.gotoPrev)],
      [isAnyHotKey(['ArrowDown']), wrapPD(this.view.gotoNext)],
      [isAnyHotKey(['enter']), this.view.onEnterKey],
      [isHotKey('mod+enter'), this.view.insertBelow],
    ])(e)

    if (e.target instanceof window.HTMLInputElement) return

    if (R.equals('a', e.key)) {
      this.view.onAddNewNoteEvent(e)
    }
  }
}

class NoteList extends C {
  r() {
    return (
      <F>
        <NoteListShortcuts />
        <ListToolbar />
        <List>
          <WithState>
            {({view: {noteList}}) => {
              return renderKeyedById(Note, 'note', noteList)
            }}
          </WithState>
        </List>
      </F>
    )
  }
}

export class Auth extends C {
  r() {
    return (
      <WithState>
        {({auth0}) => (
          <Button onClick={() => auth0.login()}>Login</Button>
        )}
      </WithState>
    )
  }
}

class App extends C {
  r() {
    return (
      <RootContainer>
        <CenterLayout>
          <div className={'flex'}>
            <Title>Notes</Title>
            {/*<Auth />*/}
          </div>
          <NoteList />
        </CenterLayout>
      </RootContainer>
    )
  }
}

App.propTypes = {}

export default App
