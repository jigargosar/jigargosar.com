import React from 'react'
import {CenterLayout, Title, TypographyDefaults} from '../ui'
import {F} from '../utils'
import {cn, mrInjectAll} from '../utils'
import {AppHeaderBar} from '../mobx/AppHeaderBar'
import {_, mapIndexed} from '../../little-ramda'

function createNote({text = ''}) {
  return {text, children: []}
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

class NoteTree extends React.Component {
  state = {
    root: _.compose(appendTwoChildren)(
      createNote({text: 'Tree Root'}),
    ),
  }
  renderText = note => {
    return <div>{getText(note)}</div>
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
      <div className={cn('ma3')}>
        {this.renderText(root)}
        {this.renderChildren(root)}
      </div>
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
