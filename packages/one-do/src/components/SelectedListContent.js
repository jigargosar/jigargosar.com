import {compose} from 'ramda'
import {withStore, withStoreDN} from '../StoreContext'
import {withProps} from 'recompose'
import {TaskListContent} from './TaskListContent'

const SelectedListContent = compose(
  withStore,
  withProps(({store}) => ({list: store.selectedList})),
)(TaskListContent)

export default SelectedListContent
