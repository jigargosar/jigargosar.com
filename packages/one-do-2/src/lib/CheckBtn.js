import React from 'react'
import PropTypes from 'prop-types'
import {Btn} from './Btn'
import CheckBoxBlankIcon from '@material-ui/icons/CheckCircleOutlineRounded'
import CheckBoxCheckedIcon from '@material-ui/icons/CheckCircleRounded'
import {ifElse_} from './little-ramda'

const CheckBtn = ({checked, ...other}) => (
  <Btn {...other}>
    {ifElse_(checked, <CheckBoxCheckedIcon />, <CheckBoxBlankIcon />)}
  </Btn>
)
CheckBtn.propTypes = {
  checked: PropTypes.bool,
}

CheckBtn.defaultProps = {
  checked: false,
}

export default CheckBtn
