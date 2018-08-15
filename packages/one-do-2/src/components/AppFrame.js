import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {store} from '../store'
import {cn, Fr} from '../lib/little-react'

class StoreJSON extends Component {
  ren() {
    return (
      <Fr>
        <h1 className={cn('ma3')}>Store JSON</h1>
        <div className={cn('ma3')}>
          <pre className={cn('pa3 bg-light-gray')}>
            <code className={cn('code')}>{store.asJSON}</code>
          </pre>
        </div>
      </Fr>
    )
  }
}

class AppFrame extends Component {
  ren() {
    return <StoreJSON />
  }
}

export default AppFrame
