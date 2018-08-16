import React, {Component, Fragment} from 'react'
import {addTaskView} from '../stores'

import {TextField} from '@material-ui/core'
import {observer} from '../lib/little-react'

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

export default observer(AddTaskBar)
