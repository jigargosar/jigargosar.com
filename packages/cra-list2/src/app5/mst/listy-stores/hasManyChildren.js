import {
  getCollectionOfModelType,
  setSelectionToModel,
} from './helpers'

export function hasManyChildren(collectionContainer) {
  return self => ({
    views: {
      get childCollection() {
        return getCollectionOfModelType(
          self,
          collectionContainer().Model,
        )
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
