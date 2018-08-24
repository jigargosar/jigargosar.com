import {whenKeyPD, whenKeySP, withKeyEvent} from './little-react'
import React, {Component} from 'react'
import cn from 'classnames'
import {identity} from './exports-ramda'
import {observer} from './mobx-react'

// language=JSX Harmony
/**
 * @render react
 * @name Btn
 * @example
 *
 * <Btn
 *  onClick={()=>console.log('clicked')}>
 *  Click Me
 * </Btn>
 *
 */

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
        onKeyDown={
          disabled
            ? null
            : withKeyEvent(
                //
                whenKeyPD('enter')(onClick),
                whenKeyPD('space')(identity),
              )
        }
        onKeyUp={
          disabled ? null : withKeyEvent(whenKeyPD('space')(onClick))
        }
        onClick={disabled ? null : onClick}
        tabIndex={disabled ? null : 0}
      >
        {children}
      </div>
    )
  }
}

@observer
export class BtnBehaviour extends Component {
  render() {
    const {disabled = false, onClick, ...other} = this.props
    return (
      <div
        role={'button'}
        onKeyDown={
          disabled ? null : withKeyEvent(whenKeySP('enter')(onClick))
        }
        onKeyUp={
          disabled ? null : withKeyEvent(whenKeySP('space')(onClick))
        }
        onClick={disabled ? null : onClick}
        tabIndex={disabled ? null : 0}
        {...other}
      />
    )
  }
}
