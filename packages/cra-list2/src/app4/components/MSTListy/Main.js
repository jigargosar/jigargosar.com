/* eslint-disable no-func-assign*/
import React from 'react'
import {StyleRoot} from '../Styled'
import {whenKey, withKeyEvent} from '../utils'
import {Dashboard} from './Dashboard'
import {oInject} from './utils'
import {_} from '../../little-ramda'

class KeyboardShortcuts extends React.Component {
  componentDidMount() {
    window.addEventListener('keydown', this.onKeyDown)
  }

  componentWillUnmount() {
    window.removeEventListener('keydown', this.onKeyDown)
  }

  onKeyDown = e => {
    const store = this.props.store
    return withKeyEvent(
      whenKey('d')(store.onDeleteSelected),
      whenKey('down')(store.onSelectNext),
      whenKey('up')(store.onSelectPrev),
    )(e)
  }
  render() {
    return null
  }
}

function ListyMain({store}) {
  return (
    <StyleRoot>
      <KeyboardShortcuts store={store} />
      <Dashboard dashboard={store} />
    </StyleRoot>
  )
}

export default oInject(_.identity)(ListyMain)
