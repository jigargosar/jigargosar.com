import {compose} from 'ramda'
import {withStoreProps} from '../StoreContext'
import TaskListContent from './TaskListContent'
import {setDisplayName} from '../lib/recompose'

const SelectedListContent = compose(
  setDisplayName('SelectedListContent'),
  withStoreProps(store => ({list: store.selectedList})),
)(TaskListContent)

export default SelectedListContent
