import React, {Component, Fragment} from 'react'
import {addTaskView} from '../stores'

class AddTaskBar extends Component {
  render() {
    return (
      <Fragment>
        <input
          type="text"
          value={addTaskView.name}
          onChange={addTaskView.onNameChange}
        />
      </Fragment>
    )
  }
}

AddTaskBar.propTypes = {}

export default AddTaskBar
