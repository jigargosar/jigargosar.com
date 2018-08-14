import {compose} from 'ramda'
import {withStore} from '../StoreContext'
import {withProps} from 'recompose'
import TaskListContent from './TaskListContent'
import {setDisplayName} from '../lib/recompose'

const SelectedListContent = compose(
  setDisplayName('SelectedListContent'),
  withStore,
  withProps(({store}) => ({list: store.selectedList})),
)(TaskListContent)

export default SelectedListContent
