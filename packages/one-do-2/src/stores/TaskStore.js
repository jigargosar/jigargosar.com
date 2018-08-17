import {action, computed, observable} from '../lib/mobx'
import {nanoid} from '../lib/nanoid'
import {fWord} from '../lib/fake'
import {autobind} from '../lib/autobind'
import {compose, map} from '../lib/ramda'
import {
  filterDeleted,
  findById,
  overProp,
  rejectDeleted,
} from '../lib/little-ramda'
import {taskView} from './index'
import {setObservableProps} from '../lib/little-mobx'

class Task {
  @observable id = `Task_${nanoid()}`
  @observable title = ''
  @observable isDone = false

  collection = null

  constructor(props = {}, {collection} = {}) {
    this.set(props)
    this.collection = collection
  }

  @action
  set(props) {
    setObservableProps(props, this)
  }

  @computed
  get isSelected() {
    return taskView.isTaskSelected(this)
  }

  @action.bound
  destroy() {
    if (this.collection) {
      this.collection.destroy(this)
    }
  }

  @action.bound
  toggleDone() {
    this.set({isDone: !this.isDone})
  }
}

@autobind
class TaskStore {
  @observable allTasks = []

  @computed
  get tasks() {
    return rejectDeleted(this.allTasks)
  }

  @computed
  get deletedTasks() {
    return filterDeleted(this.allTasks)
  }

  findById(id) {
    return findById(id)(this.allTasks)
  }

  @action
  addNewTask() {
    return this.addTask({title: fWord()})
  }

  @action
  addTask({title}) {
    const task = new Task({title})
    this.allTasks.unshift(task)
    return task
  }

  @action
  applySnapshot(snapshot) {
    const props = compose(
      overProp('allTasks')(map(props => new Task(props))),
    )(snapshot)
    setObservableProps(props, this)
  }
}

export default TaskStore
