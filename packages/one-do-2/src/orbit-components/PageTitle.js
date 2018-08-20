import {observer} from 'mobx-react'
import React, {Component} from 'react'
import cn from 'classnames'

@observer
export class PageTitle extends Component {
  render() {
    return <div className={cn('pa3 f3')}>{this.props.children}</div>
  }
}
