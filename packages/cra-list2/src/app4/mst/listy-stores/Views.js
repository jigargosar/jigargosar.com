import {getRoot} from 'mobx-state-tree'

export function commonViews(self) {
  return {
    get domain() {
      return getRoot(self)
    },
  }
}
