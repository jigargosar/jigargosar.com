import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {Fr} from '../lib/little-react'
import cn from 'classnames'
import {store} from '../store'

class StoreJSON extends Component {
  ren() {
    return (
      <Fr>
        <h1 className={cn('ma3')}>Store JSON</h1>
        <div className={cn('ma3')}>
          <pre className={cn('pa3 bg-light-gray')}>
            <code className={cn('code')}>{store.toJSON}</code>
          </pre>
        </div>
      </Fr>
    )
  }
}

export default StoreJSON
