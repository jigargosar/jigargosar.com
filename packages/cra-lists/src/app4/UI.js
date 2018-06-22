// Foo

/*eslint-disable*/
import React, {Component as RC} from 'react'
import cn from 'classnames'
import {container, nh} from './class-names'
import {M} from '../StateContext'

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export const Button = function({className, children, ...rest}) {
  return (
    <button
      className={cn(
        'input-reset dib f5 link blue mh1 mv0',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
