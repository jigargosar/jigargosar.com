import React from 'react'
import ReactDOM from 'react-dom'

import PouchDB from 'pouchdb-browser'
import PouchAllDBS from 'pouchdb-all-dbs'
import ReactJson from 'react-json-view'

PouchAllDBS(PouchDB)

export function PouchDBStore() {
  return {
    allDbs: PouchDB.allDbs,
  }
}

function RenderState() {
  return (
    <div className={'bg-black-40 absolute top-0 left-0 w-100'}>
      <div className={'bg-white pa3 ma3 shadow-1'}>
        <ReactJson src={{PouchDBStore: PouchDBStore()}} />
      </div>
    </div>
  )
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
  <RenderState />,
  getOrAppendElementById('render-state'),
)
