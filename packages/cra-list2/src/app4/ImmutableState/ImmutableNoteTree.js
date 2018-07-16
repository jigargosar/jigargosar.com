import {StorageItem} from '../services/storage'
import {initialNoteTree, preProcessNote} from './ImmutableNote'
import Baobab from 'baobab'

const storedState = StorageItem({
  name: 'NoteTreeState',
  getInitial: () => initialNoteTree,
  postLoad: tree => preProcessNote(tree),
})

// const initialTree = initialRoot
const initialTree = storedState.load()

const baobabTree = new Baobab(initialTree, {asynchronous: false})

export const state = {
  tree: baobabTree,
  rootNoteCursor: baobabTree.select(),
}

state.tree.on('update', () => {
  storedState.save(state.tree.serialize())
})

export function getRootNoteCursor({rootNoteCursor}) {
  return rootNoteCursor
}
