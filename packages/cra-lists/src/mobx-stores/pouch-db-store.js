import React from 'react'
import ReactDOM from 'react-dom'
import PouchDB from 'pouchdb-browser'
import ReactJson from 'react-json-view'
import PropTypes from 'prop-types'

require('pouchdb-all-dbs')(PouchDB)

export function PouchDBStore() {
  return {
    get allDbs() {
      return PouchDB.allDbs()
    },
  }
}

function RenderState({hide}) {
  if (hide) return null
  return (
    <div className={'bg-black-40 absolute top-0 left-0 w-100'}>
      <div className={'bg-white pa3 ma3 shadow-1'}>
        <ReactJson src={{PouchDBStore: PouchDBStore()}} />
      </div>
    </div>
  )
}
RenderState.proptypes = {
  hide: PropTypes.bool,
}
const RA = require('ramda-adjunct')

function getOrAppendElementById(id) {
  const el = document.getElementById(id)
  if (RA.isNotNil(el)) return el
  const div = document.createElement('div')
  div.id = id
  document.body.appendChild(div)
  return div
}

ReactDOM.render(
  <RenderState hide />,
  getOrAppendElementById('render-state'),
)
