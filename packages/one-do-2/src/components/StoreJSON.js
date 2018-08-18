import React, {Component, Fragment} from 'react'
import cn from 'classnames'
import {rootStore} from '../stores'
import {observer} from '../lib/little-react'

@observer
class StoreJSON extends Component {
  render() {
    return (
      <Fragment>
        <h1 className={cn('ma3')}>Store JSON</h1>
        <div className={cn('ma3')}>
          <pre className={cn('pa3 bg-light-gray')}>
            <code className={cn('code')}>{rootStore.toPrettyJSON}</code>
          </pre>
        </div>
      </Fragment>
    )
  }
}

export default StoreJSON
