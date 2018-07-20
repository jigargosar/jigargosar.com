import {getParentOfType} from 'mobx-state-tree'
import {DomainStore} from './DomainStore'

export function commonViews(self) {
  return {
    get domain() {
      return getParentOfType(self, DomainStore)
    },
  }
}
