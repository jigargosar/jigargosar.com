/*eslint-disable*/

import {Provider} from 'rebass'
import system from 'system-components'
import styled from 'styled-components'
import React from 'react'
import {buttonStyle, colorStyle, textStyle} from 'styled-system'

import {
  darken,
  lighten,
  modularScale,
  opacify,
  transparentize,
} from 'polished'
import {defaultProps} from './little-recompose'
// import TextArea from 'react-textarea-autosize'

/*eslint-enable, eslint-disable no-empty-pattern*/

export {textStyle, buttonStyle, colorStyle}
export {darken, lighten, opacify, transparentize, modularScale}

export {styled}
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

export const Flex = system({
  is: Box,
  display: 'flex',
})

export const FlexRow = system({
  is: Flex,
  flexDirection: 'row',
  alignItems: 'center',
})

export const TextArea = system({
  is: 'textarea',
  display: 'block',
  flex: 1,
  colors: 'selected',
  border: 'none',
  p: 0,
  lineHeight: 'inherit',
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

export function IconBtn({icon: Icon, iconSize, ...other}) {
  return (
    <Btn {...other}>
      <Icon fontSize={iconSize} />
    </Btn>
  )
}

IconBtn.defaultProps = {
  variant: 'icon',
  iconSize: 'default',
}

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
export const DarkThemeProvider = defaultProps({theme})(Provider)
