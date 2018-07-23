/*eslint-disable*/

import React from 'react'
import {whenKey, withKeyEvent} from '../utils'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {observer} from 'mobx-react'
import {maybeOrNil, overProp, R, tapLog} from '../../little-ramda'
import {B, Box} from '../little-rebass'
import {darken, lighten} from 'polished'

/*eslint-enable, eslint-disable no-empty-pattern*/

/* eslint-disable no-func-assign*/

const KeyboardShortcuts = observer(
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
  },
)

function createTheme() {
  const white = '#fff'
  const black = '#000'
  const dark = {
    color: darken(0, white),
    backgroundColor: black,
  }

  function getDarkDim(amount) {
    return {color: darken(amount, white)}
  }

  const darkDim = getDarkDim(0.3)

  const theme = {
    colorStyles: {
      dark: {
        ...dark,
        ...R.compose(
          R.zipObj(R.range(1, 9)),
          R.map(R.compose(getDarkDim, R.divide(R.__, 10))),
        )(R.range(1, 9)),
      },
    },
    fonts: {
      sans:
        "-apple-system, BlinkMacSystemFont, 'avenir next', avenir, 'helvetica neue', helvetica, ubuntu, roboto, noto, 'segoe ui', arial, sans-serif",
      mono: 'Consolas, monaco, monospace',
    },
  }
  return theme
}

const theme = createTheme()
function ListyMain({store, domain}) {
  return (
    <B.Provider theme={theme}>
      <Box colors={'dark'}>
        <KeyboardShortcuts store={store} />
        {maybeOrNil(dashboard => <Dashboard dashboard={dashboard} />)(
          domain.currentDashboard,
        )}
        {/*<DomainPatches />*/}
        {/*<DebugStores />*/}
      </Box>
    </B.Provider>
  )
}

export default oInjectNamed('store', 'domain')(ListyMain)
