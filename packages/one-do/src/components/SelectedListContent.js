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

export const AddIcon = AddRounded
@observer
export class SelectedListContent extends Component {
  render() {
    return (
      <List
        disablePadding
        dense={false}
        className={cn('overflow-scroll pb5')}
      >
        <SelectedListContentHeader store={this.props.store} />
        <Tasks store={this.props.store} />
      </List>
    )
  }
}

@withStyles(theme => ({
  root: {
    color: theme.palette.secondary.main,
    padding: 0,
  },
}))
@observer
class SelectedListContentHeader extends Component {
  render() {
    const {store, classes} = this.props
    const list = store.selectedList
    return (
      <ListSubheader
        classes={{root: classes.root}}
        component={props => (
          <Button
            {...props}
            color={'secondary'}
            classes={{root: classes.root}}
            component={'div'}
          />
        )}
        className={'bg-white-80 flex pl2 pr1'}
        // onClick={wrapSP(() => store.editList(list))}
      >
        <div className={cn('flex-auto ttu')}>{list.name}</div>
        <IconButton color={'secondary'}>
          <AddIcon />
        </IconButton>
      </ListSubheader>
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

    return (
      <ListItem
        disableGutters
        className={cn('pv0')}
        button={!task.isDone}
        disabled={task.isDone}
        classes={{}}
        // disableRipple={task.isDone}
        onClick={task.isDone ? null : wrapSP(() => store.editTask(task))}
      >
        {/*<Checkbox*/}
        {/*onChange={e =>*/}
        {/*store.updateTask({isDone: e.target.checked}, task)*/}
        {/*}*/}
        {/*checked={task.isDone}*/}
        {/*onClick={wrapSP(F)}*/}
        {/*color={'default'}*/}
        {/*icon={<CheckBoxBlankIcon />}*/}
        {/*checkedIcon={<CheckBoxCheckedIcon />}*/}
        {/*/>*/}
        <IconButton
          onClick={wrapSP(() =>
            store.updateTask({isDone: !task.isDone}, task),
          )}
        >
          {task.isDone ? <CheckBoxCheckedIcon /> : <CheckBoxBlankIcon />}
        </IconButton>
        <ListItemText
          disableTypography
          className={cn('pl0 flex items-center')}
        >
          <div className={cn('flex-auto', {strike: task.isDone})}>
            {task.name}
          </div>
          <Typography
            component={'div'}
            variant={'headline'}
            color={'error'}
          >
            {task.isDirty && `*`}
          </Typography>
        </ListItemText>
        <ListItemSecondaryAction>
          {task.isDone && (
            <IconButton onClick={wrapSP(() => store.deleteTask(task))}>
              <DeleteIcon />
            </IconButton>
          )}
        </ListItemSecondaryAction>
      </ListItem>
    )
  }
}
