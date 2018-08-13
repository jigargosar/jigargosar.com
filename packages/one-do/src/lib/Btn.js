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
          'link',
          'flex items-center',
          `input-reset dib mh1 f${f} normal ttu`,
          disabled ? 'gray' : 'blue pointer',
        )}
        style={{userSelect: 'none' /*fontSize: 'inherit'*/}}
        onClick={disabled ? null : onClick}
        tabIndex={disabled ? null : 0}
      >
        {children}
      </div>
    )
  }
}
