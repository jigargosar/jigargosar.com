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
  createTransformer,
  defineDelegatePropertyGetter,
  mAutoRun,
} from '../../mobx/little-mobx'
import {_} from '../../utils'
import FocusTrap from 'focus-trap-react'

// import a from 'nanoassert'

function getActiveQuery({filters = []} = {}) {
  return {
    filter: _.allPass([
      _.propSatisfies(_.not, 'deleted'),
      ...filters,
    ]),
    sortComparators: [_.descend(_.prop('createdAt'))],
  }
}

const fieldNames = ['text', 'deleted', 'parentId', 'collapsed']
const Notes = ActiveRecord({
  name: 'Note',
  fieldNames,
  // volatileFieldNames: ['collapsed'],
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
      name: 'list',
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
      get displayNoteTransformer() {
        const view = this
        return createTransformer(note => {
          const dn = createObservableObject({
            props: {
              get childNotes() {
                return view.findActiveNotesWithParentId(note.id)
              },
              get isCollapsed() {
                return _.defaultTo(false, note.collapsed)
              },
            },
            actions: {},
            name: `DisplayNote@${note.id}`,
          })
          _.forEach(
            defineDelegatePropertyGetter(_.__, note, dn),
            Notes.allFieldNames,
          )
          return dn
        })
      },
      get notesList() {
        return _.map(
          this.displayNoteTransformer,
          this.findActiveNotesWithParentId(null),
        )
      },
      modeNameEq(name) {
        return _.equals(this.mode.name, name)
      },
      findAll(options) {
        // return _.map(
        //   this.displayNoteTransformer,
        //   Notes.findAll(options),
        // )
        return Notes.findAll(options)
      },
      findActiveNotesWithParentId(parentId) {
        return this.findAll(
          getActiveQuery({
            filters: [_.propEq('parentId', parentId)],
          }),
        )
      },
      isAddModeForParentId(parentId) {
        return (
          this.modeNameEq('add') &&
          _.equals(this.mode.parentId, parentId)
        )
      },
      get isAddMode() {
        return this.modeNameEq('add')
      },
    },
    actions: {
      onToggleNoteCollapsed(note) {
        Notes.upsert({
          id: note.id,
          collapsed: !isNoteCollapsed(note),
        })
      },
      onDelete(note) {
        Notes.upsert({id: note.id, deleted: true})
      },
      onAdd() {
        view.mode.onBeforeChange()
        this.mode = AddEditMode()
      },
      onAddChild(note) {
        view.mode.onBeforeChange()
        this.mode = AddEditMode({parentId: note.id})
      },
      onEditNote(note) {
        view.mode.onBeforeChange()
        this.mode = AddEditMode(
          _.pick(['id', 'text', 'parentId'], note),
        )
      },
      onTextChange(e) {
        this.mode.onTextChange(e)
      },
      onTextBlur() {
        // this.save()
      },
      onEnter() {
        this.save()
      },
      save() {
        view.mode.onBeforeChange()
        this.mode = ListMode()
      },
    },
    name: 'view',
  })
  mAutoRun(() => {}, {name: 'view state persistence'})

  return view
})()

function isEditingNote(note) {
  return _.equals(note.id, view.mode.id)
}

function isNoteCollapsed(note) {
  return _.defaultTo(false, note.collapsed)
}

function getChildNotes(note) {
  // return   note.childNotes
  return view.findActiveNotesWithParentId(note.id)
}

const ChildNotes = mrInjectAll(function ChildNotes({note}) {
  const childNotes = getChildNotes(note)
  return (
    <div className={cn('flex items-start mt2')}>
      <List m={'mr3'} className={cn('flex-auto')}>
        {renderKeyedById(Note, 'note', childNotes)}
      </List>
    </div>
  )
})

function isLeafNote(note) {
  return _.isEmpty(getChildNotes(note))
}

function shouldHideChildNotes(note) {
  return isLeafNote(note) || isNoteCollapsed(note)
}

const Note = mrInjectAll(function Note({note}) {
  if (isEditingNote(note)) {
    return <AddEditNote />
  }
  return (
    <ListItem
      className={cn('pointer flex flex-column lh-copy')}
      p={'pv2 pl3'}
    >
      <div className={cn('flex-auto flex items-center hide-child ')}>
        <Button
          className={cn('code bw0')}
          disabled={!!isLeafNote(note)}
          onClick={() => view.onToggleNoteCollapsed(note)}
        >
          {note.collapsed ? `>` : `v`}
        </Button>

        <div className={cn('flex-auto mr2')}>
          {note.text || (
            <span className={cn('light-silver')}>Empty Text</span>
          )}
        </div>
        <div className={cn('child2')}>
          <Button onClick={() => view.onEditNote(note)}>e</Button>
          <Button onClick={() => view.onAddChild(note)}>+</Button>
          <Button onClick={() => view.onDelete(note)}>x</Button>
        </div>
      </div>
      {!shouldHideChildNotes(note) && <ChildNotes note={note} />}
    </ListItem>
  )
})

const AddEditNote = mrInjectAll(function Note() {
  return (
    <ListItem className={cn('flex')}>
      <FocusTrap
        className={cn('flex flex-auto')}
        focusTrapOptions={{escapeDeactivates: false}}
      >
        <input
          className={cn(
            'input-reset bw1 b--solid flex-auto ma0 pa1 lh-copy light-blue hover-blue outline-0',
          )}
          autoFocus
          value={view.mode.text}
          onChange={view.onTextChange}
          onFocus={e => e.target.setSelectionRange(0, 9999)}
          onBlur={view.onTextBlur}
          onKeyDown={_.cond([
            [isAnyHotKey(['enter']), view.onEnter],
            [isAnyHotKey(['escape']), view.onEnter],
            // [isAnyHotKey['enter'], _.F],
          ])}
        />
      </FocusTrap>
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
  const list = view.notesList
  // const showEditNote = view.isAddModeForParentId(null)
  const showEditNote = view.isAddMode
  const showList = !_.isEmpty(list) || showEditNote
  return (
    <div>
      {/*<NoteListShortcuts />*/}
      <ListToolbar />
      {showList && (
        <List>
          {showEditNote && <AddEditNote />}
          {renderKeyedById(Note, 'note', list)}
        </List>
      )}
    </div>
  )
})

const AppHeader = mrInjectAll(function AppHeader() {
  return (
    <div className={'flex items-center pv3 shadow-1 bg-light-blue'}>
      <Title
        className={cn('flex-auto')}
      >{`Active Record Notes: mode:${view.mode.name}`}</Title>
    </div>
  )
})

const Main = mrInjectAll(function App() {
  return (
    <RootContainer>
      <FocusTrap focusTrapOptions={{escapeDeactivates: false}}>
        <CenterLayout>
          <AppHeader />
          <NoteList />
        </CenterLayout>
      </FocusTrap>
    </RootContainer>
  )
})

export default Main
