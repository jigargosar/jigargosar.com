/*eslint-disable*/

import React from 'react'
import {Dashboard} from './Dashboard'
import {oInjectNamed} from '../little-mobx-react'
import {maybeOrNil} from '../../little-ramda'
import {B, Box} from '../little-rebass'
import {lighten, modularScale, transparentize} from 'polished'
import FocusTrap from 'focus-trap-react'
import {defaultProps} from '../little-recompose'

/*eslint-enable, eslint-disable no-empty-pattern*/

/* eslint-disable no-func-assign*/

function createDarkTheme() {
  const white = '#d3d3d3'
  const black = '#2B2B2B'

  const baseButton = {
    cursor: 'pointer',
    outline: 'none',
  }

  const theme = {
    colorStyles: {
      root: {
        color: white,
        backgroundColor: black,
      },
      selected: {
        color: white,
        backgroundColor: '#214283',
        outline: 'none',
      },
      default: {
        color: white,
        outline: 'none',
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
        fontSize: modularScale(1.2, 0.8),
        lineHeight: 2,
      },
    },
    buttons: {
      bucketLine: {},
      default: {
        ...baseButton,
        '&:hover': {
          backgroundColor: lighten(0.05, black),
        },
        '&:focus': {
          backgroundColor: '#214283',
        },
      },
      selected: {
        ...baseButton,
        backgroundColor: '#214283',
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

const DarkThemeProvider = defaultProps({theme})(B.Provider)

function ListyMain({domain}) {
  return (
    <FocusTrap>
      <DarkThemeProvider>
        <Box colors={'root'} minHeight={'100vh'} fontFamily={'mono'}>
          {maybeOrNil(dashboard => (
            <Dashboard dashboard={dashboard} />
          ))(domain.currentDashboard)}
          {/*<DomainPatches />*/}
          {/*<DebugStores />*/}
        </Box>
      </DarkThemeProvider>
    </FocusTrap>
  )
}

export default oInjectNamed('store', 'domain')(ListyMain)
