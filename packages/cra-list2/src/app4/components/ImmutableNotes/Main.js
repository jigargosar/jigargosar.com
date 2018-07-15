import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {F} from '../utils'
import {cn, mrInjectAll} from '../utils'
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

function getChildrenCursor(note) {
  return note.select('children').get()
}

function getTextCursor(note) {
  return note.select('text').get()
}

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
    root: root,
    tree: new Baobab(root),
  }
  renderText = note => {
    return (
      <div>
        <div className={cn('fl mr3')}>-</div>
        <div className={cn('mv2')}>{getText(note)}</div>
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
    const {root} = this.state
    return (
      <div className={cn('ma3')}>{this.renderChild(root, 0)}</div>
    )
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
