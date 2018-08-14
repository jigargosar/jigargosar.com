import {compose} from 'ramda'
import TaskListContent from './TaskListContent'
import {setDisplayName, withProps} from '../lib/recompose'
import store from '../mst-models/store'
import {observer} from '../lib/little-react'

const SelectedListContent = compose(
  setDisplayName('SelectedListContent'),
  observer,
  withProps(() => ({list: store.selectedList})),
)(TaskListContent)

export default SelectedListContent
