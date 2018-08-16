import React, {Component, Fragment} from 'react'
import {observer, renderKeyedById} from '../lib/little-react'
import TaskListItem from './TaskListItem'
import {PropTypes} from '../lib/prop-types'

class TaskList extends Component {
  static propTypes = {
    tasks: PropTypes.array.isRequired,
  }

  render() {
    return (
      <Fragment>
        {renderKeyedById(TaskListItem, 'task', this.props.tasks)}
      </Fragment>
    )
  }
}

export default observer(TaskList)
