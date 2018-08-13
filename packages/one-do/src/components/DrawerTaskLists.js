import React, {Component, Fragment} from 'react'

import {compose} from 'ramda'
import {observer} from 'mobx-react'
import {withProps} from 'recompose'
import {computed} from 'mobx'

import AddListIcon from '@material-ui/icons/PlaylistAddRounded'

import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction/ListItemSecondaryAction'
import IconButton from '@material-ui/core/IconButton/IconButton'
import {tapSP} from '../lib/little-react'
import List from '@material-ui/core/List/List'
import ListSubheader from '@material-ui/core/ListSubheader/ListSubheader'
import cn from 'classnames'
import {fWord} from '../lib/fake'
import PropTypes from 'prop-types'
import ListItem from '@material-ui/core/ListItem/ListItem'
import ListItemText from '@material-ui/core/ListItemText/ListItemText'
import {pluralize} from '../lib/little-ramda'
import {DeleteIcon} from './Icons'

@observer
export class DrawerTaskLists extends Component {
  render() {
    const {store} = this.props
    return (
      <List
        subheader={
          <ListSubheader
            color="primary"
            className={cn('', 'flex items-center')}
          >
            <div className={cn('flex-auto')}>My Lists</div>
            <IconButton
              onClick={tapSP(() => store.addList({name: fWord()}))}
            >
              <AddListIcon />
            </IconButton>
          </ListSubheader>
        }
      >
        <AllTaskListItem store={store} />
        {store.lists.map(list => (
          <TaskListItem key={list.id} store={store} list={list} />
        ))}
      </List>
    )
  }
}

@observer
class DrawerTaskListItem extends Component {
  static defaultProps = {
    secondaryAction: null,
  }

  static propTypes = {
    isDirty: PropTypes.bool.isRequired,
    isSelected: PropTypes.bool.isRequired,
    name: PropTypes.string.isRequired,
    onClickSelect: PropTypes.func.isRequired,
    pendingCount: PropTypes.number.isRequired,
    secondaryAction: PropTypes.node,
  }

  render() {
    const {
      isSelected,
      pendingCount,
      isDirty,
      onClickSelect,
      secondaryAction,
      name,
    } = this.props
    return (
      <ListItem
        className={cn('ttu', {'bg-black-20': isSelected})}
        button
        onClick={onClickSelect}
      >
        <ListItemText
          primary={name}
          secondary={
            <Fragment>
              {`${pendingCount} ${pluralize('TASK', pendingCount)}`}
              <Fragment>{isDirty && '*'}</Fragment>
            </Fragment>
          }
        />
        {secondaryAction}
      </ListItem>
    )
  }
}

const AllTaskListItem = compose(
  observer,
  withProps(({store}) => ({
    name: 'All Tasks',
    isSelected: store.isAllListSelected,
    pendingCount: store.allListsPendingCount,
    isDirty: store.isDirty,
    onClickSelect: () => store.setIsAllListSelected(true),
  })),
)(DrawerTaskListItem)

const TaskListItem = compose(
  observer,
  withProps(({store, list}) => ({
    name: list.name,
    isSelected: computed(() => store.isListSelected(list)).get(),
    pendingCount: list.pendingCount,
    isDirty: list.isDirty,
    onClickSelect: () => store.setSelectedList(list),
    secondaryAction: (
      <ListItemSecondaryAction>
        <IconButton
          onClick={tapSP(() => store.deleteList(list))}
          disabled={!store.canDeleteList}
        >
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    ),
  })),
)(DrawerTaskListItem)

// @observer
// @withProps(({store, list}) => ({
//   isSelected: computed(() => store.isListSelected(list)).get(),
// }))
// @observer
// class TaskListItem extends Component {
//   render() {
//     const {store, list, isSelected} = this.props
//     const pendingCount = list.pendingTasks.length
//     return (
//       <ListItem
//         className={cn('ttu', {'bg-black-20': isSelected})}
//         button
//         onClick={() => store.setSelectedList(list)}
//       >
//         <ListItemText
//           primary={`${list.name}`}
//           secondary={
//             <Fragment>
//               {`${pendingCount} ${pluralize('TASK', pendingCount)}`}
//               <Fragment>{list.isDirty && '*'}</Fragment>
//             </Fragment>
//           }
//         />
//         <ListItemSecondaryAction>
//           <IconButton
//             onClick={wrapSP(() => store.deleteList(list))}
//             disabled={!store.canDeleteList}
//           >
//             <DeleteIcon />
//           </IconButton>
//         </ListItemSecondaryAction>
//       </ListItem>
//     )
//   }
// }
