import {getCollectionInstance, startEditingModel} from './helpers'
import {extend} from '../../little-mst'

export function hasManyChildren(lazyCollection) {
  return extend(self => ({
    views: {
      get childCollection() {
        return getCollectionInstance(self, lazyCollection())
      },
      get children() {
        return self.childCollection.whereEq({parent: self})
      },
    },
    actions: {
      onAddChild: e => {
        e.stopPropagation()
        return startEditingModel(self.addChild({}))
      },
      addChild: attrs =>
        self.childCollection.add({...attrs, parent: self}),
      onPrependChild: () => startEditingModel(self.prependChild()),
      prependChild: () => self.addChild({}),
      addChildAfter: s => self.addChild({}),
    },
  }))
}

export function belongsToParent() {
  return extend(self => ({
    views: {
      onAppendSibling() {
        startEditingModel(self.parent.addChildAfter(self))
      },
    },
  }))
}
