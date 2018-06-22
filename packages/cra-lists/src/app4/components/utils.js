// Foo

/*eslint-disable*/
import React from 'react'
import {observer} from 'mobx-react'

const R = require('ramda')
const RA = require('ramda-adjunct')

/*eslint-enable*/

/*eslint-disable no-empty-pattern*/

export const RC = React.Component
export const F = React.Fragment

export function renderKeyedById(Component, propName, idList) {
  return R.map(value => (
    <Component key={value.id} {...{[propName]: value}} />
  ))(idList)
}

export const ro = observer
