import React from 'react'
import {Btn} from './Btn'
import cn from 'classnames'
import PropTypes from 'prop-types'

export function IconBtn({label, Icon, ...other}) {
  return (
    <Btn {...other}>
      <div className={cn('flex flex-column items-center')}>
        <Icon />
        <div className={cn('f6')}>{label}</div>
      </div>
    </Btn>
  )
}

IconBtn.propTypes = {
  label: PropTypes.any,
  Icon: PropTypes.any,
}
