import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {cn, F, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {_, mapIndexed} from '../../little-ramda'
import Baobab from 'baobab'
import {nanoid} from '../../model/util'

function createNote({text = ''}) {
  return {id: `Note-${nanoid()}`, text, children: []}
}

function appendChild(child) {
  return function(note) {
    return _.assoc('children')(_.append(child, note.children))(note)
  }
}

function getChildren({children}) {
  return children
}

function getText({text}) {
  return text
}

// function getDisplayText(note) {
//   return `${getDebugId(note)} - ${getText(note)}`
// }

function getDebugId({id}) {
  const start = 5
  return id.slice(start, start + 3)
}

// function getChildrenCursor(note) {
//   return note.select('children')
// }
//
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

const root = _.compose(appendTwoChildren)(
  createNote({text: 'Tree Root'}),
)

class NoteTree extends React.Component {
  state = {
    root,
    tree: new Baobab(root),
  }
  renderText = note => {
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
          {getText(note)}
        </div>
      </div>
    )
  }

  renderChild = (note, idx) => {
    return (
      <F key={idx}>
        {this.renderText(note)}
        {this.renderChildren(note)}
      </F>
    )
  }

  renderChildren = note => {
    return (
      <div className={cn('ml3')}>
        {mapIndexed(this.renderChild)(getChildren(note))}
      </div>
    )
  }

  render() {
    return (
      <F>
        <div className={cn('ma3 pa3 shadow-1 bg-white')}>
          {this.renderChild(this.tree.get(), 0)}
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
