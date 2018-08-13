import {observer} from './little-react'
import React, {Component} from 'react'
import cn from 'classnames'

@observer
export class Btn extends Component {
  render() {
    const {
      f = 5,
      children,
      disabled = false,
      onClick,
      ...other
    } = this.props
    return (
      <div
        {...other}
        role={'button'}
        className={cn(
          'flex items-center',
          `input-reset dib ph1 f${f} normal pointer ttu`,
          disabled ? 'gray' : 'blue',
        )}
        style={{userSelect: 'none' /*fontSize: 'inherit'*/}}
        onClick={disabled ? null : onClick}
      >
        {children}
      </div>
    )
  }
}
