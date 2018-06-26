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
  cn,
  F,
  isAnyHotKey,
  isHotKey,
  OC,
  renderKeyedById,
  WithState,
} from './utils'
import {R} from '../utils'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

class NoteInput extends OC {
  r({note}) {
    return (
      <input
        autoFocus
        className={cn('bw0 flex-auto ma0 pa1 lh-copy blue')}
        placeholder={'Note text ...'}
        value={note.form.text}
        onChange={note.onTextChange}
      />
    )
  }
}

class Note extends C {
  r({note}) {
    return (
      <ListItem className={cn('flex items-center lh-copy')}>
        <Text>{`${note.sortIdx}`}</Text>
        {!note.isEditing && (
          <Text
            className={cn(
              'pa1 flex-auto',
              {'o-50': note.deleted},
              {'blue bg-washed-yellow': note.isSelected},
            )}
          >
            {note.displayText}
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
    console.debug('NoteListShortcuts: componentDidMount')
    window.addEventListener('keydown', this.onKeydown)
  }
  componentWillUnmount() {
    console.debug('componentWillUnmount: componentWillUnmount')
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
      [isHotKey('mod+shift+enter'), this.view.insertAbove],
      [isHotKey('mod+enter'), this.view.insertBelow],
      [isAnyHotKey(['enter']), this.view.onEnterKey],
      [isHotKey('escape'), this.view.onEscapeKey],
    ])(e)

    if (e.target instanceof window.HTMLInputElement) return

    R.cond([
      [isHotKey('a'), wrapPD(this.view.onAddNewNoteEvent)],
      [isHotKey('delete'), this.view.onDeleteSelectionEvent],
    ])(e)
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
            {({view}) =>
              renderKeyedById(Note, 'note', view.noteDisplayList)
            }
          </WithState>
        </List>
      </F>
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
