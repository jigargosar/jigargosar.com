import {observer} from './little-react'
import React, {Component} from 'react'
import cn from 'classnames'

@observer
export class Btn extends Component {
  render({children, disabled = false, onClick, ...other} = this.props) {
    return (
      <div
        {...other}
        role={'button'}
        className={cn(
          'input-reset dib ph1 f5 normal pointer ttu',
          disabled ? 'gray' : 'blue',
        )}
        style={{userSelect: 'none'}}
        onClick={disabled ? null : onClick}
      >
        {children}
      </div>
    )
  }
}
