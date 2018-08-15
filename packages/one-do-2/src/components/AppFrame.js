import React from 'react'
import {Component} from '../lib/little-mobx-react'
import {storeAsJSON} from '../store'
import {cn, Fr} from '../lib/little-react'

class AppFrame extends Component {
  ren() {
    return (
      <Fr>
        <h1 className={cn('ma3')}>Store JSON</h1>
        <div className={cn('ma3')}>
          <pre className={cn('pa3 bg-light-gray')}>
            <code className={cn('code')}>{storeAsJSON()}</code>
          </pre>
        </div>
      </Fr>
    )
  }
}

export default AppFrame
