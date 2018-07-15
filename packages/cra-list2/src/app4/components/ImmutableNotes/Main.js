import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {_} from '../../little-ramda'
import Baobab, {Cursor} from 'baobab'
import {nanoid} from '../../model/util'
import {StorageItem} from '../../services/storage'

if (module.hot) {
  window.Baobab = Baobab
}

function createNote({text = ''}) {
  return {id: `Note-${nanoid()}`, text, children: []}
}

function appendChild(child) {
  return function(note) {
    return _.assoc('children')(_.append(child, note.children))(note)
  }
}

// function getChildren({children}) {
//   return children
// }

function getWhenCursor(note) {
  return note instanceof Baobab || note instanceof Cursor
    ? note.get()
    : note
}

function getText(note) {
  const {text} = getWhenCursor(note)
  return text
}

// function getDisplayText(note) {
//   return `${getDebugId(note)} - ${getText(note)}`
// }

function getDebugId(note) {
  const {id} = getWhenCursor(note)
  const start = 5
  return id.slice(start, start + 3)
}

function selectChildren(note) {
  return note.select('children')
}

// function getTextCursor(note) {
//   return note.select('text')
// }

const appendTwoChildren = _.compose(
  appendChild(
    _.compose(
      appendChild(createNote({text: 'fourth grand child'})),
      appendChild(createNote({text: 'third grand child'})),
    )(createNote({text: 'second child'})),
  ),
  appendChild(
    _.compose(
      appendChild(createNote({text: 'second grand child'})),
      appendChild(createNote({text: 'first grand child'})),
    )(createNote({text: 'first child'})),
  ),
)

const initialRoot = _.compose(appendTwoChildren)(
  createNote({text: 'Tree Root'}),
)

class NoteTextLine extends React.Component {
  componentDidMount() {
    const {note} = this.props
    note.on('update', () => {
      this.forceUpdate()
    })
  }

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
          {/*{getText(note)}*/}
          <input
            value={getText(note)}
            onChange={e => {
              note.set('text', e.target.value)
            }}
          />
        </div>
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
    tree: new Baobab(storedState.load(), {asynchronous: false}),
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
