import React, {Component, Fragment} from 'react'
import {addTaskView} from '../stores'

import {TextField} from '@material-ui/core'

class AddTaskBar extends Component {
  render() {
    return (
      <Fragment>
        <TextField
          value={addTaskView.title}
          onChange={addTaskView.onTitleChange}
        />
      </Fragment>
    )
  }
}

AddTaskBar.propTypes = {}

export default AddTaskBar
