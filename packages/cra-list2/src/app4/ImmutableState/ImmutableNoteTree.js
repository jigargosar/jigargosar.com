import {StorageItem} from '../services/storage'
import {initialRoot} from './ImmutableNote'
import Baobab from 'baobab'

const storedState = StorageItem({
  name: 'NoteTreeState',
  getInitial: () => initialRoot,
})

// const initialTree = initialRoot
const initialTree = storedState.load()

export const state = {
  tree: new Baobab(initialTree, {asynchronous: false}),
}

state.tree.on('update', () => {
  storedState.save(state.tree.serialize())
})
