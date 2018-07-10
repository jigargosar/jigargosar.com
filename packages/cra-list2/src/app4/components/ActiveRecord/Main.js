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

const Notes = ActiveRecord({
  name: 'Note',
  fieldNames: ['text', 'deleted', 'parentId', 'collapsed'],
  volatileFieldNames: ['collapsed'],
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
      get notesList() {
        return Notes.active
      },
      modeNameEq(name) {
        return _.equals(this.mode.name, name)
      },
      findActiveNotesWithParentId(parentId) {
        return Notes.findAll(
          getActiveQuery({filters: [_.propEq('parentId', parentId)]}),
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

const Note = mrInjectAll(function Note({note}) {
  if (isEditingNote(note)) {
    return <AddEditNote />
  }
  const childNotes = view.findActiveNotesWithParentId(note.id)
  const hasChildNotes = !_.isEmpty(childNotes)
  const isCollapsed = _.defaultTo(false, note.collapsed)

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
          onClick={() => view.onDelete(note)}
          className={cn('child')}
        >
          x
        </Button>
      </div>
      {hasChildNotes && (
        <div className={cn('flex items-start mt2')}>
          <Button className={cn('code')}>
            {isCollapsed ? `>` : `v`}
          </Button>
          <List m={'mr3'} className={cn('flex-auto')}>
            {renderKeyedById(Note, 'note', childNotes)}
          </List>
        </div>
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
          [isAnyHotKey(['escape']), view.onEnter],
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
      <CenterLayout>
        <AppHeader />
        <NoteList />
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
