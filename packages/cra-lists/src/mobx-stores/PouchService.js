import React from 'react'
import ReactDOM from 'react-dom'
import PouchDB from 'pouchdb-browser'
import ReactJson from 'react-json-view'
import PropTypes from 'prop-types'
import ow from 'ow'
import {PouchStore} from './PouchStore'

const assert = require('assert')

if (!module.hot || !module.hot.data) {
  require('pouchdb-all-dbs')(PouchDB)
}

export const PouchService = (function PouchService() {
  return {
    getAllDbNames() {
      return PouchDB.allDbs()
    },
    create(name, options = {}) {
      ow(name, ow.string.minLength(3))
      return PouchStore(new PouchDB(name, options), this)
    },
    exists(name) {
      return this.getAllDbNames().includes(name)
    },
    async destroy(name) {
      const allDbNames = await this.getAllDbNames()
      assert(allDbNames.includes(name))
      return new PouchDB(name).destroy()
    },
  }
})()

if (module.hot) {
  window.x = PouchService
  window.p = PouchService.create('foo')
  PouchService.getAllDbNames().then(console.log)
}

function RenderState({hide}) {
  if (hide) return null
  return (
    <div className={'bg-black-40 absolute top-0 left-0 w-100'}>
      <div className={'bg-white pa3 ma3 shadow-1'}>
        <ReactJson src={{PouchDbService: PouchService()}} />
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
