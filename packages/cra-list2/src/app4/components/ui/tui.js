import * as rc from 'recompose'
import {_, overProp} from '../../little-ramda'
import {cn, cnWith} from '../utils'
import React from 'react'
import PropTypes from 'prop-types'

const toStrUnlessNil = _.unless(_.isNil)(String)
const concatKeyVal = _.compose(
  _.map(_.join('')),
  _.toPairs,
  _.reject(_.isNil),
)

const numPropsNames = [
  'p',
  'ph',
  'pv',
  'pt',
  'pr',
  'pb',
  'pl',
  'm',
  'mh',
  'mv',
  'mt',
  'mr',
  'mb',
  'ml',
  'bw',
]

const numPropsToStrUnlessNil = _.compose(
  _.map(toStrUnlessNil),
  _.pickAll(numPropsNames),
)

export function Box(props) {
  let {className, Component, children, ...other} = props
  const {
    p,
    ph,
    pv,
    pt,
    pr,
    pb,
    pl,
    m,
    mh,
    mv,
    mt,
    mr,
    mb,
    ml,
    bw,
  } = numPropsToStrUnlessNil(other)

  const padObj = {
    pt: pt || pv || p,
    pr: pr || ph || p,
    pb: pb || pv || p,
    pl: pl || ph || p,
  }

  const marginObj = {
    mt: mt || mv || m,
    mr: mr || mh || m,
    mb: mb || mv || m,
    ml: ml || mh || m,
  }

  const cns = cn(
    concatKeyVal(padObj),
    concatKeyVal(marginObj),
    {
      [`bw${bw}`]: bw,
    },
    className,
  )

  return (
    <Component className={cns} {..._.omit(numPropsNames)(other)}>
      {children}
    </Component>
  )
}

export const zeroTo6 = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  0,
  1,
  2,
  3,
  4,
  5,
  6,
]

Box.propTypes = {
  p: PropTypes.oneOf(zeroTo6),
  ph: PropTypes.oneOf(zeroTo6),
  pv: PropTypes.oneOf(zeroTo6),
  pt: PropTypes.oneOf(zeroTo6),
  pr: PropTypes.oneOf(zeroTo6),
  pb: PropTypes.oneOf(zeroTo6),
  pl: PropTypes.oneOf(zeroTo6),
  m: PropTypes.oneOf(zeroTo6),

  mh: PropTypes.oneOf(zeroTo6),
  mv: PropTypes.oneOf(zeroTo6),
  mt: PropTypes.oneOf(zeroTo6),
  mr: PropTypes.oneOf(zeroTo6),
  mb: PropTypes.oneOf(zeroTo6),
  ml: PropTypes.oneOf(zeroTo6),

  className: PropTypes.string,

  Component: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]),
  bw: PropTypes.oneOf(zeroTo6),
}

Box.defaultProps = {
  className: '',
  Component: 'div',
}

function prependOverClassName(...classNames) {
  return overProp('className')(cnWith(...classNames))
}

export function withClassNames(...classNames) {
  return rc.withProps(prependOverClassName(...classNames))
}

export const Row = withClassNames('flex items-center')(Box)

Row.propTypes = Box.propTypes

export const Btn = _.compose(
  rc.defaultProps({
    href: '/',
    m: 0,
    p: 0,
    Component: 'button',
  }),
  withClassNames(
    'input-reset button-reset bw0 link pointer tl bg-transparent',
  ),
)(Row)

Btn.propTypes = {
  ...Row.propTypes,
  href: PropTypes.string,
}
