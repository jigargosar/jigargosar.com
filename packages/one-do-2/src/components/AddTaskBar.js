import React, {Component, Fragment} from 'react'
import {addTaskView} from '../stores'

class AddTaskBar extends Component {
  render() {
    return (
      <Fragment>
        <input
          type="text"
          value={addTaskView.title}
          onChange={addTaskView.onTitleChange}
        />
      </Fragment>
    )
  }
}

AddTaskBar.propTypes = {}

export default AddTaskBar
