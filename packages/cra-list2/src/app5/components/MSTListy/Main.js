/*eslint-disable*/

import React from 'react'
import {whenKey, withKeyEvent} from '../utils'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {observer} from 'mobx-react'
import {maybeOrNil, overProp, R, tapLog} from '../../little-ramda'
import {B, Box} from '../little-rebass'
import {
  darken,
  lighten,
  opacify,
  transparentize,
  modularScale,
} from 'polished'

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

function createDarkTheme() {
  const white = '#d3d3d3'
  // const black = '#000'
  const black = '#363636'

  const baseButton = {
    color: transparentize(0.5, white),
    cursor: 'pointer',
    outline: 'none',
  }

  const theme = {
    colorStyles: {
      root: {
        color: white,
        backgroundColor: black,
      },
      dimBorder: {
        borderColor: transparentize(0.9, white),
      },
      dim: {
        color: transparentize(0.5, white),
      },
    },
    textStyles: {
      bucketTitle: {
        fontSize: modularScale(0.5),
      },
    },
    buttons: {
      bucketLine: {},
      dim: {
        ...baseButton,
        '&:hover, &:focus': {
          backgroundColor: lighten(0.05, black),
        },
      },
      icon: {
        ...baseButton,
        lineHeight: 0,
        padding: 0,
        '&:hover, &:focus': {
          color: lighten(1, white),
          backgroundColor: lighten(0.05, black),
        },
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

const theme = createDarkTheme()
function ListyMain({store, domain}) {
  return (
    <B.Provider theme={theme}>
      <Box colors={'root'} minHeight={'100vh'} fontFamily={'mono'}>
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
