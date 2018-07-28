import {getCollectionInstance, startEditingModel} from './helpers'

export function hasManyChildren(lazyCollection) {
  return modelType =>
    modelType.extend(self => ({
      views: {
        get childCollection() {
          return getCollectionInstance(self, lazyCollection())
        },
        get children() {
          return self.childCollection.whereEq({parent: self})
        },
      },
      actions: {
        onAddChild: () => startEditingModel(self.addChild({})),
        addChild: attrs =>
          self.childCollection.add({...attrs, parent: self}),
        onPrependChild: () => self.addChild({}),
        onAddChildAfterSibling: s => self.addChild({}),
      },
    }))
}
