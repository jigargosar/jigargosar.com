import * as rc from 'recompose'
import {_, isNotNil, overProp} from '../../little-ramda'
import {cn, cnWith} from '../utils'
import React from 'react'
import PropTypes from 'prop-types'

export function Box(props) {
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
    className,
    Component,
    children,
    ...other
  } = props

  const cns = cn(
    {
      [`pt${p} pr${p} pb${p} pl${p}`]: isNotNil(p),
      [`pr${ph} pl${ph}`]: isNotNil(ph),
      [`pt${pv} pb${pv}`]: isNotNil(pv),

      [`mr${mh} ml${mh}`]: isNotNil(mh),
      [`mt${mv} mb${mv}`]: isNotNil(mv),
      [`mt${m} mr${m} mb${m} ml${m}`]: isNotNil(m),

      [`pt${pt}`]: isNotNil(pt),
      [`pr${pr}`]: isNotNil(pr),
      [`pb${pb}`]: isNotNil(pb),
      [`pl${pl}`]: isNotNil(pl),
      [`mt${mt}`]: isNotNil(mt),
      [`mr${mr}`]: isNotNil(mr),
      [`mb${mb}`]: isNotNil(mb),
      [`ml${ml}`]: isNotNil(ml),
      [`bw${bw}`]: isNotNil(bw),
    },
    className,
  )
  // if (Component === 'button') {
  //   console.log(`cns`, cns)
  // }

  return (
    <Component className={cns} {...other}>
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
  className: PropTypes.string,

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
