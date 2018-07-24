/*eslint-disable*/

import PropTypes from 'prop-types'
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

export const FlexRow = system({
  is: Box,
  display: 'flex',
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

export class AutoSize extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
  }

  get inputDOM() {
    return ReactDOM.findDOMNode(this)
  }

  componentDidMount() {
    autosize(this.inputDOM)
    // autosize.update(this.inputDOM)
  }

  componentDidUpdate() {
    autosize.update(this.inputDOM)
  }

  componentWillUnmount() {
    autosize.destroy(this.inputDOM)
  }

  render() {
    return this.props.children
  }
}

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
