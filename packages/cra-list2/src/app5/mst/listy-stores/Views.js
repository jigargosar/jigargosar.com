import {getParentOfType, isRoot} from 'mobx-state-tree'
import {RootStore} from './RootStore'

export function commonViews(self) {
  return {
    get root() {
      if (isRoot(self)) return self
      return getParentOfType(self, RootStore)
    },
  }
}
