import {getCollectionInstance, setSelectionToModel} from './helpers'

export function hasManyChildren(lazyCollection) {
  return self => ({
    views: {
      get childCollection() {
        return getCollectionInstance(self, lazyCollection())
      },
      get children() {
        return self.childCollection.whereEq({parent: self})
      },
    },
    actions: {
      onAddChild: () => setSelectionToModel(self.addChild({})),
      addChild: attrs =>
        self.childCollection.add({...attrs, parent: self}),
    },
  })
}
