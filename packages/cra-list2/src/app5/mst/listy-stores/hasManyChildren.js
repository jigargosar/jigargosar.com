import {getCollection, setSelectionToModel} from './helpers'

export function hasManyChildren(childType) {
  return self => ({
    views: {
      get childCollection() {
        return getCollection(self, childType)
      },
      get children() {
        return self.childCollection.whereEq({parent: self})
      },
    },
    actions: {
      onAddChild() {
        setSelectionToModel(self.addChild())
      },
      addChild(attrs = {}) {
        return getCollection(self, childType).add({
          ...attrs,
          parent: self,
        })
      },
    },
  })
}
