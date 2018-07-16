import {StorageItem} from '../services/storage'
import {initialNoteTree, preProcessNote} from './ImmutableNote'
import Baobab from 'baobab'
import {_} from '../little-ramda'

const storedState = StorageItem({
  name: 'NoteTreeState',
  getInitial: () => initialNoteTree,
  postLoad: _.over(_.lensProp('rootNote'))(preProcessNote),
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

export function getRootNoteCursor({rootNoteCursor}) {
  return rootNoteCursor
}
