import React from 'react'
import {
  Button,
  CenterLayout,
  List,
  ListItem,
  RootContainer,
  Section,
  Title,
} from '../ui'
import {cn, isAnyHotKey, mrInjectAll, renderKeyedById} from '../utils'
import {ActiveRecord} from '../../mobx/ActiveRecord'
import {
  createObservableObject,
  mAutoRun,
} from '../../mobx/little-mobx'
import {_} from '../../utils'

function getActiveQuery({filters = []} = {}) {
  return {
    filter: _.allPass([
      _.propSatisfies(_.not, 'deleted'),
      ...filters,
    ]),
    sortComparators: [_.descend(_.prop('createdAt'))],
  }
}

const Notes = ActiveRecord({
  name: 'Note',
  fieldNames: ['text', 'deleted', 'parentId'],
  queries: {
    active: getActiveQuery({
      filters: [_.propSatisfies(_.isNil, 'parentId')],
    }),
  },
})

function AddEditMode({id = null, text = '', parentId = null} = {}) {
  return createObservableObject({
    props: {
      id,
      text,
      parentId,
      get name() {
        return _.isNil(id) ? 'add' : 'edit'
      },
    },
    actions: {
      onTextChange(e) {
        this.text = e.target.value
      },
      onBeforeChange() {
        Notes.upsert(_.pick(['id', 'text', 'parentId'], this))
      },
    },
    name: 'AddEditMode',
  })
}

function ListMode() {
  return createObservableObject({
    props: {
      get name() {
        return 'list'
      },
    },
    actions: {
      onBeforeChange() {},
    },
    name: 'ListMode',
  })
}

const view = (() => {
  const view = createObservableObject({
    props: {
      mode: ListMode(),
      get notesList() {
        return Notes.active
      },
      get modeNameEq() {
        return _.equals(this.mode.name)
      },
      children(note) {
        return Notes.findAll(
          getActiveQuery({filters: [_.propEq('parentId', note.id)]}),
        )
      },
      isAddModeForParentId(parentId) {
        return (
          this.modeNameEq('add') &&
          _.equals(this.mode.parentId, parentId)
        )
      },
    },
    actions: {
      onAdd() {
        beforeModeChange()
        this.mode = AddEditMode()
      },
      onAddChild(note) {
        beforeModeChange()
        this.mode = AddEditMode({parentId: note.id})
      },
      onEditNote(note) {
        beforeModeChange()
        this.mode = AddEditMode({text: note.text, id: note.id})
      },
      onTextChange(e) {
        this.mode.onTextChange(e)
      },
      onTextBlur() {
        this.save()
      },
      onEnter() {
        this.save()
      },
      save() {
        beforeModeChange()
        this.mode = ListMode()
      },
    },
    name: 'view',
  })
  mAutoRun(() => {}, {name: 'view state persistance'})

  return view

  function beforeModeChange() {
    // const {id, text} = view.modeProps
    // const modeEq = _.equals(view.mode)
    // if (modeEq('add') || modeEq('edit')) {
    //   Notes.upsert({id, text})
    // }
    view.mode.onBeforeChange()
  }
})()

function isEditingNote(note) {
  return _.equals(note.id, view.mode.id)
}

// const NoteInput = observer(function NoteInput({note}) {
//   return (
//     <input
//       autoFocus
//       className={cn('bw0 flex-auto ma0 pa1 lh-copy blue')}
//       placeholder={'Note text ...'}
//       value={note.text}
//       onChange={note.onTextChange}
//     />
//   )
// })
//
// const NoteText = observer(function NoteText({note}) {
//   return (
//     <Text className={cn('pa1 flex-auto', {'o-50': note.deleted})}>
//       {/*{`A:${shortenAID(note.actorId)}: ${note.displayText}`}*/}
//       {`${note.displayText}`}
//     </Text>
//   )
// })
//
// const Note = observer(function Note({note, focusComponentRef}) {
//   const NoteContent = note.isEditing ? NoteInput : NoteText
//   return (
//     <FocusChild shouldFocus={note.isSelected}>
//       <ListItem
//         ref={focusComponentRef}
//         className={cn('flex items-center lh-copy', {
//           'bg-lightest-blue': note.isSelected,
//         })}
//         tabIndex={note.isSelected ? 0 : null}
//       >
//         <Text>{`sidx: ${note.sortIdx}`}</Text>
//         <NoteContent note={note} />
//         <Text>
//           <TimeAgo date={note.createdAt} live={true} minPeriod={30} />
//         </Text>
//         <Text>
//           <TimeAgo
//             date={note.modifiedAt}
//             live={true}
//             minPeriod={30}
//           />
//         </Text>
//       </ListItem>
//     </FocusChild>
//   )
// })
//
// const ListToolbar = mrInjectAll(function ListToolbar({view}) {
//   return (
//     <Section className={cn('pl3')}>
//       <Button onClick={view.onAddNewNoteEvent}>ADD</Button>
//     </Section>
//   )
// })
//
// const NoteListShortcuts = mrInjectAll(
//   class NoteListShortcuts extends C {
//     componentDidMount() {
//       console.debug('NoteListShortcuts: componentDidMount')
//       window.addEventListener('keydown', this.onKeydown)
//     }
//
//     componentWillUnmount() {
//       console.debug('componentWillUnmount: componentWillUnmount')
//       window.removeEventListener('keydown', this.onKeydown)
//     }
//
//     onKeydown = e => {
//       console.debug('NoteListShortcuts.onKeydown', e)
//       const {view} = this.props
//       _.cond([
//         [isHotKey('ArrowUp'), wrapPD(view.gotoPrev)],
//         [isAnyHotKey(['ArrowDown']), wrapPD(view.gotoNext)],
//         [isAnyHotKey(['mod+ArrowDown']), wrapPD(view.moveDown)],
//         [isAnyHotKey(['mod+ArrowUp']), wrapPD(view.moveUp)],
//         [isHotKey('mod+shift+enter'), view.insertAbove],
//         [isAnyHotKey(['mod+enter', 'shift+enter']), view.insertBelow],
//         [isAnyHotKey(['enter']), view.onEnterKey],
//         [isHotKey('escape'), view.onEscapeKey],
//       ])(e)
//
//       if (e.target instanceof window.HTMLInputElement) {
//         return
//       }
//
//       _.cond([
//         [isAnyHotKey(['q']), wrapPD(view.onAddNewNoteEvent)],
//         [isAnyHotKey(['a']), wrapPD(view.insertBelow)],
//         [isAnyHotKey(['shift+a']), wrapPD(view.insertAbove)],
//         [
//           isAnyHotKey(['d', 'delete']),
//           wrapPD(view.onToggleDeleteSelectedEvent),
//         ],
//       ])(e)
//     }
//   },
// )
//
// const NoteList = mrInjectAll(function NoteList({view}) {
//   return (
//     <div>
//       <NoteListShortcuts />
//       <ListToolbar />
//       <Paper>
//         <List>
//           {renderKeyedById(Note, 'note', view.noteDisplayList)}
//         </List>
//       </Paper>
//     </div>
//   )
// })
//

const Note = mrInjectAll(function Note({note}) {
  if (isEditingNote(note)) {
    return <AddEditNote />
  }
  const children = view.children(note)
  return (
    <ListItem
      onDoubleClick={() => view.onEditNote(note)}
      className={cn('pointer flex flex-column hide-child lh-copy')}
      p={'pv2 pl3'}
    >
      <div className={cn('flex-auto flex items-center')}>
        <div className={cn('flex-auto mr2')}>
          {note.text || (
            <span className={cn('light-silver')}>Empty Text</span>
          )}
        </div>
        <Button
          onClick={() => view.onAddChild(note)}
          className={cn('child')}
        >
          +
        </Button>
        <Button
          onClick={() => note.setDeleted(true)}
          className={cn('child')}
        >
          x
        </Button>
      </div>
      {!_.isEmpty(children) && (
        <List>{renderKeyedById(Note, 'note', children)}</List>
      )}
    </ListItem>
  )
})

const AddEditNote = mrInjectAll(function Note() {
  return (
    <ListItem className={cn('flex')}>
      <input
        className={cn('bw0 flex-auto ma0 pa1 lh-copy blue')}
        autoFocus
        value={view.mode.text}
        onChange={view.onTextChange}
        onFocus={e => e.target.setSelectionRange(0, 9999)}
        onBlur={view.onTextBlur}
        onKeyDown={_.cond([
          [isAnyHotKey(['enter']), view.onEnter],
          // [isAnyHotKey['enter'], _.F],
        ])}
      />
    </ListItem>
  )
})

const ListToolbar = mrInjectAll(function ListToolbar() {
  return (
    <Section className={cn('pl3')}>
      <Button onClick={view.onAdd}>ADD</Button>
    </Section>
  )
})

const NoteList = mrInjectAll(function NoteList() {
  const childNotes = view.notesList
  const showEditNote = view.isAddModeForParentId(null)
  const showList = !_.isEmpty(childNotes) || showEditNote
  return (
    <div>
      {/*<NoteListShortcuts />*/}
      <ListToolbar />
      {showList && (
        <List>
          {showEditNote && <AddEditNote />}
          {renderKeyedById(Note, 'note', childNotes)}
        </List>
      )}
    </div>
  )
})

const AppHeader = mrInjectAll(function AppHeader() {
  return (
    <div className={'flex items-center pv3 shadow-1 bg-light-blue'}>
      <Title className={cn('flex-auto')}>Active Record Notes</Title>
    </div>
  )
})

const Main = mrInjectAll(function App() {
  return (
    <RootContainer>
      <CenterLayout>
        <AppHeader />
        <NoteList />
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
