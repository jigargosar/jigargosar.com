import React from 'react'
import ReactJSON from 'react-json-view'
import {PouchService} from '../mobx-stores/PouchService'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

const RA = require('ramda-adjunct')

export function RenderState({hide, src = null}) {
  if (hide) return null
  return (
    <div className={'bg-black-40 absolute top-0 left-0 w-100'}>
      <div className={'bg-white pa3 ma3 shadow-1'}>
        <ReactJSON src={src} />
      </div>
    </div>
  )
}

RenderState.proptypes = {
  hide: PropTypes.bool,
}

function getOrAppendElementById(id) {
  const el = document.getElementById(id)
  if (RA.isNotNil(el)) return el
  const div = document.createElement('div')
  div.id = id
  document.body.appendChild(div)
  return div
}

export function mountRenderState(
  src = {PouchDbService: PouchService},
) {
  ReactDOM.render(
    <RenderState src={src} />,
    getOrAppendElementById('render-state'),
  )
}

// mountRenderState()
