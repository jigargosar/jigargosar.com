import {observer} from 'mobx-react'
import React, {Component} from 'react'
import cn from 'classnames'

@observer
class Page extends Component {
  render() {
    return <div className={cn('pv3')} {...this.props} />
  }
}
