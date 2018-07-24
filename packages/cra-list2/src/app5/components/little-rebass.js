/*eslint-disable*/

import * as rebass from 'rebass'
import system from 'system-components'
import styled, {injectGlobal} from 'styled-components'
import React, {Component} from 'react'
import {
  color,
  flex,
  fontSize,
  fontWeight,
  lineHeight,
  space,
  width,
  display,
  fontFamily,
  border,
  textAlign,
  background,
  buttonStyle,
  alignContent,
  alignItems,
  colorStyle,
  textStyle,
  minHeight,
  borders,
  borderColor,
} from 'styled-system'

import TextAreaAutoSize from 'react-autosize-textarea'
// import TextArea from 'react-textarea-autosize'

import {omit, Tag} from 'clean-tag'

import {
  darken,
  lighten,
  opacify,
  transparentize,
  modularScale,
} from 'polished'
import {R, tapLog} from '../little-ramda'

/*eslint-enable, eslint-disable no-empty-pattern*/

export {textStyle, buttonStyle, colorStyle}
export {darken, lighten, opacify, transparentize, modularScale}

export {styled}
export const B = rebass
export const Flex = B.Flex
export const Box = system(
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
)

injectGlobal`
body{
  //background: #f1f1f1;
  //min-width: 300px;
  line-height: 1.1;
}
`

export const FlexRow = styled(Flex).attrs({
  alignItems: 'center',
})`
  ${colorStyle};
`
export const Text = styled(B.Text).attrs({})`
  ${colorStyle};
  white-space: pre-line;
`

export const StyledTextAreaAutoSize = styled.textarea`
  ${lineHeight};
  outline: none;
  ${display};
  ${flex};
  ${colorStyle};
  ${border};
  ${borders};
  ${space};
  //line-height: 1.25;
`

StyledTextAreaAutoSize.propTypes = {
  ...display.propTypes,
  ...flex.propTypes,
  ...colorStyle.propTypes,
  ...borders.propTypes,
  ...border.propTypes,
  ...space.propTypes,
  ...lineHeight.propTypes,
}

StyledTextAreaAutoSize.defaultProps = {
  display: 'block',
  flex: 1,
  colors: 'selected',
  border: 'none',
  rows: 1,
}

export class TextAreaAS extends Component {
  render() {
    return <StyledTextAreaAutoSize {...this.props} />
  }
}
// export class TextAreaAS extends Component {
//   render() {
//     console.log(`r().props`, r())
//     return (
//       <StyledTextAreaAutoSize
//         {...R.pick([
//           'id',
//           'rows',
//           'className',
//           'style',
//           'value',
//           'defaultValue',
//           'onBlur',
//           'onFocus',
//           'onChange',
//           'onKeyDown',
//           ...tapLog(Object.keys(TextAreaAutoSize.propTypes)),
//         ])(this.props)}
//       />
//     )
//   }
// }

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
