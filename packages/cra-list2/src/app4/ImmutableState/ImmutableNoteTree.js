import {StorageItem} from '../services/storage'
import {initialNoteTree, preProcessNote} from './ImmutableNote'
import Baobab from 'baobab'
import {_} from '../little-ramda'

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

export function getRootNoteCursor() {
  return state.rootNoteCursor
}

export function getCurrentRootNoteCursor() {
  return state.tree.select(state.tree.get('rootNotePath'))
}

export function setCurrentRootNoteCursor(noteCursor) {
  state.tree.set('rootNotePath', noteCursor.path)
}

console.log(getCurrentRootNoteCursor().get())
