import styled, {injectGlobal, ThemeProvider} from 'styled-components'
import {
  color,
  flex,
  fontSize,
  fontWeight,
  lineHeight,
  space,
  width,
} from 'styled-system'

import Tag from 'clean-tag'
import {componentFromProp, defaultProps} from './recompose-utils'
import React from 'react'

injectGlobal`
body{
  background: #f1f1f1;
  min-width: 300px;
}
`

const theme = {
  fontSizes: [12, 14, 16, 24, 32, 48, 64, 96, 128],
  lineHeights: [1, 1.25, 1.5],
  space: [
    // margin and padding
    0,
    4,
    8,
    16,
    32,
    64,
    128,
    256,
  ],
  colors: {
    blue: '#07c',
    red: '#e10',
  },
}

export const Box = styled(Tag)`
${space}
${width}
${fontSize}
${color} 
${fontWeight}
${lineHeight}
${flex}
`

export const DefaultThemeProvider = defaultProps({
  comp: ThemeProvider,
  theme,
})(componentFromProp('comp'))

export const BaseStyle = styled(Box).attrs({
  className: 'sans-serif ',
})``

BaseStyle.defaultProps = {
  fontSize: [3, 2, 1, 0],
  lineHeight: 0,
}

export function StyleRoot({children}) {
  return (
    <DefaultThemeProvider>
      <BaseStyle>{children}</BaseStyle>
    </DefaultThemeProvider>
  )
}
