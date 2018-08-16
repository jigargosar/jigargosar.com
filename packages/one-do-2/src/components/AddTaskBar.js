import React, {Component, Fragment} from 'react'
import {addTaskView} from '../stores'

import {TextField} from '@material-ui/core'
import {observable} from '../lib/mobx'

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

export default observable(AddTaskBar)
