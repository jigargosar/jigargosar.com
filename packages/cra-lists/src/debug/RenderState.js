import {PouchService} from '../mobx-stores/PouchService'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
const RA = require('ramda-adjunct')

function RenderState({hide, src}) {
  if (hide) return null
  return (
    <div className={'bg-black-40 absolute top-0 left-0 w-100'}>
      <div className={'bg-white pa3 ma3 shadow-1'}>
        <ReactJson src={src} />
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

function mountRenderState() {
  ReactDOM.render(
    <RenderState src={{PouchDbService: PouchService}} />,
    getOrAppendElementById('render-state'),
  )
}

// mountRenderState()
