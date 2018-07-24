/*eslint-disable*/

import * as rebass from 'rebass'
import system from 'system-components'
import styled, {injectGlobal} from 'styled-components'
import React, {Component} from 'react'
import {
  border,
  borders,
  buttonStyle,
  colorStyle,
  display,
  flex,
  lineHeight,
  space,
  textStyle,
} from 'styled-system'

import {
  darken,
  lighten,
  modularScale,
  opacify,
  transparentize,
} from 'polished'
import * as ReactDOM from 'react-dom'
import autosize from 'autosize'
// import TextArea from 'react-textarea-autosize'

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

export const StyledTextArea = system({
  is: 'textarea',
  display: 'block',
  flex: 1,
  colors: 'selected',
  border: 'none',
  spacing: null,
})

export class TextAreaAS extends Component {
  inputRef = React.createRef()

  get inputDOM() {
    return ReactDOM.findDOMNode(this.inputRef.current)
  }

  componentDidMount() {
    autosize(this.inputDOM)
  }

  componentDidUpdate() {
    autosize.update(this.inputDOM)
  }

  componentWillUnmount() {
    autosize.destroy(this.inputDOM)
  }

  render() {
    return <StyledTextArea ref={this.inputRef} {...this.props} />
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
