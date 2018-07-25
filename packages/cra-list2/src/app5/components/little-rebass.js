/*eslint-disable*/

import React from 'react'
import system from 'system-components'
import {buttonStyle, colorStyle, textStyle} from 'styled-system'
import {ThemeProvider} from 'styled-components'

import {
  darken,
  lighten,
  modularScale,
  opacify,
  transparentize,
} from 'polished'
import {defaultProps} from './little-recompose'

/*eslint-enable, eslint-disable no-empty-pattern*/

export {system}
export {textStyle, buttonStyle, colorStyle}
export {darken, lighten, opacify, transparentize, modularScale}

export const Box = system(
  'space',
  'width',
  'fontFamily',
  'fontSize',
  'flex',
  'order',
  'alignSelf',
  'colorStyle',
  'minHeight',
  'border',
  'borderColor',
  'textStyle',
  'buttonStyle',
  'lineHeight',
)

export const dpFlex = {display: 'flex'}
export const dpFlexRow = {
  ...dpFlex,
  flexDirection: 'row',
  alignItems: 'center',
}

export const Flex = system({
  is: Box,
  ...dpFlex,
})

export const FlexRow = system({
  is: Box,
  ...dpFlexRow,
})
FlexRow.displayName = 'FlexRow'

export const TextArea = system({
  is: 'textarea',
  display: 'block',
  p: 0,
  border: 'none',
  lineHeight: 'inherit',
  css: {
    outline: 'none',
  },
  rows: 1,
})

export const Btn = system({
  is: 'button',
  bg: 'transparent',
  variant: 'default',
  colors: 'dim',
  border: 0,
  p: 1,
  textAlign: 'start',
  width: null,
  fontSize: null,
  lineHeight: null,
})

const defaultTheme = {
  breakpoints: ['32em', '40em', '52em', '64em'],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 72],
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
}

function createDarkTheme() {
  const white = '#d3d3d3'
  const black = '#2B2B2B'

  const baseButton = {
    cursor: 'pointer',
    outline: 'none',
  }

  const selectedBGColor = '#214283'
  const theme = {
    ...defaultTheme,
    colorStyles: {
      root: {
        color: white,
        backgroundColor: black,
      },
      selected: {
        color: white,
        backgroundColor: selectedBGColor,
      },
      dimBorder: {
        borderColor: transparentize(0.9, white),
      },
      dim: {
        color: transparentize(0.3, white),
      },
    },
    textStyles: {
      bucketTitle: {
        fontSize: modularScale(1.2, 0.8),
        lineHeight: 2,
      },
    },
    buttons: {
      default: {
        ...baseButton,
        '&:hover': {
          backgroundColor: lighten(0.05, black),
        },
        '&:focus': {
          backgroundColor: selectedBGColor,
        },
      },
      selected: {
        ...baseButton,
        backgroundColor: selectedBGColor,
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

export const DarkThemeProvider = defaultProps({
  theme: createDarkTheme(),
})(ThemeProvider)
export const preWrapCSS = {
  overflow: 'hidden',
  whiteSpace: 'pre-wrap',
  wordWrap: 'break-word',
}
