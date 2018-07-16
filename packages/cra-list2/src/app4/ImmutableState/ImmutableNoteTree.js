import {StorageItem} from '../services/storage'
import {
  initialNoteTree,
  maybeGetParentNote,
  preProcessNote,
} from './ImmutableNote'
import Baobab from 'baobab'
import {_, S} from '../little-ramda'

const storedState = StorageItem({
  name: 'NoteTreeState',
  getInitial: () => initialNoteTree,
  postLoad: _.compose(
    _.mergeWith(_.defaultTo, {rootNotePath: ['rootNote']}),
    _.over(_.lensProp('rootNote'))(preProcessNote),
  ),
})

// const initialTree = initialRoot
const initialTree = storedState.load()

const baobabTree = new Baobab(initialTree, {asynchronous: false})

export const state = {
  tree: baobabTree,
  rootNoteCursor: baobabTree.select('rootNote'),
}

state.tree.on('update', () => {
  storedState.save(state.tree.serialize())
})

export function getRootNotePathCursor() {
  return state.tree.select('rootNotePath')
}

export function getCurrentRootNoteCursor() {
  return state.tree.select(getRootNotePathCursor().get())
}

export function setCurrentRootNote(noteCursor) {
  state.tree.set('rootNotePath', noteCursor.path)
}

export function setCurrentRootNoteOneLevelUp() {
  if (isCurrentRootNoteAtTop()) {
    return
  }
  S.map(parent => {
    state.tree.set('rootNotePath', parent.path)
    return ''
  })(maybeGetParentNote(getCurrentRootNoteCursor()))
}

console.log(getCurrentRootNoteCursor().get())

function isCurrentRootNoteAtTop() {
  return _.equals(state.tree.get('rootNotePath'), ['rootNote'])
}
