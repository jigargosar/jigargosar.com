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
import React, {Component} from 'react'
import {cn, cn2, PropTypes} from './utils'
import {_, overProp} from '../little-ramda'

injectGlobal`
body{
  background: #f1f1f1;
  min-width: 300px;
}
`

export const Box = styled(Tag)`
${space}
${width}
${fontSize}
${color} 
${fontWeight}
${lineHeight}
${flex}
`

export const BaseStyle = styled(Box).attrs({
  className: _.compose(cn2('sans-serif'), _.prop('className')),
})``

BaseStyle.defaultProps = {
  fontSize: [3, 2, 1, 0],
  lineHeight: 0,
}

export class StyleRoot extends Component {
  static defaultProps = {
    theme: {
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
    },
  }

  static propTypes = {
    children: PropTypes.any,
    theme: PropTypes.object,
  }

  render() {
    const {theme, children, ...other} = this.props
    return (
      <ThemeProvider theme={theme}>
        <BaseStyle {...other}>{children}</BaseStyle>
      </ThemeProvider>
    )
  }
}
