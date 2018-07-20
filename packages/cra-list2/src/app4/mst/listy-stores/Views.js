import {getParentOfType} from 'mobx-state-tree'
import {RootStore} from './RootStore'

export function commonViews(self) {
  return {
    get domain() {
      return getParentOfType(self, RootStore)
    },
  }
}
