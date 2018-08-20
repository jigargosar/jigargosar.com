import {observer} from 'mobx-react'
import React, {Component} from 'react'
import cn from 'classnames'

@observer
export class AsciiCheck extends Component {
  render() {
    const {checked} = this.props
    return <div className={cn('code')}>{checked ? `[x]` : `[ ]`}</div>
  }
}
