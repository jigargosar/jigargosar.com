import React, {Component} from 'react'
import {observer} from 'mobx-react'
import {wrapSP} from '../lib/little-react'
import CheckBoxBlankIcon from '@material-ui/icons/CheckCircleOutlineRounded'
import CheckBoxCheckedIcon from '@material-ui/icons/CheckCircleRounded'
import AddRounded from '@material-ui/icons/AddRounded'

import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader'
import cn from 'classnames'
import List from '@material-ui/core/List/List'
import ListItem from '@material-ui/core/ListItem/ListItem'
import Checkbox from '@material-ui/core/Checkbox/Checkbox'

import ListItemText from '@material-ui/core/ListItemText/ListItemText'
import Typography from '@material-ui/core/Typography/Typography'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton/IconButton'
import {DeleteIcon} from './Icons'
import ButtonBase from '@material-ui/core/ButtonBase/ButtonBase'
import {F} from '../lib/ramda'
import {withStyles} from '../lib/material-ui'
import Button from '@material-ui/core/es/Button/Button'
import {fWord} from '../lib/fake'
import {Btn} from '../lib/tachyons-components'

export const AddIcon = AddRounded
@observer
export class TaskListContent extends Component {
  render() {
    return (
      <div className={cn('overflow-scroll pb5')}>
        <Header store={this.props.store} />
        <Tasks store={this.props.store} />
      </div>
    )
  }
}

@observer
class Header extends Component {
  render() {
    const {store} = this.props
    const list = store.selectedList
    return (
      <div
        className={'bg-white-80 flex pa2'}
        onClick={wrapSP(() => store.editList(list))}
      >
        <div className={cn('flex-auto ttu')}>{list.name}</div>
        <Btn onClick={wrapSP(() => store.addTask({name: fWord()}, list))}>
          <AddIcon />
        </Btn>
      </div>
    )
  }
}

@observer
class Tasks extends Component {
  render() {
    const {store} = this.props
    return store.tasks.map(task => (
      <TaskItem key={task.id} task={task} store={store} />
    ))
  }
}

@observer
class TaskItem extends Component {
  render() {
    const {task, store} = this.props
    const isDone = task.isDone
    return (
      <div
        className={cn('pv0', {pointer: !isDone})}
        onClick={isDone ? null : wrapSP(() => store.editTask(task))}
      >
        <Btn
          onClick={wrapSP(() => store.updateTask({isDone: !isDone}, task))}
        >
          {isDone ? <CheckBoxCheckedIcon /> : <CheckBoxBlankIcon />}
        </Btn>
        <div className={cn('flex-auto', {strike: isDone})}>
          {task.name}
        </div>
        <div>{task.isDirty && `*`}</div>

        {isDone && (
          <Btn onClick={wrapSP(() => store.deleteTask(task))}>
            <DeleteIcon />
          </Btn>
        )}
      </div>
    )
  }
}
