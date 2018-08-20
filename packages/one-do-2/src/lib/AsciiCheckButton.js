import {observer} from 'mobx-react'
import React, {Component} from 'react'
import cn from 'classnames'
import {buttonStyle} from './little-tachyons-style'
import {AsciiCheck} from './AsciiCheck'

@observer
export class AsciiCheckButton extends Component {
  render() {
    const {
      layout = 'ph3',
      checked = false,
      comp: ButtonComponent = 'button',
      ...other
    } = this.props
    return (
      <ButtonComponent className={cn(layout, buttonStyle)} {...other}>
        <AsciiCheck checked={checked} />
      </ButtonComponent>
    )
  }
}
