import {getCollection, setSelectionToModel} from './helpers'

export function hasMany(modelType) {
  return self => ({
    views: {
      get children() {
        return getCollection(self, modelType).whereEq({
          parent: self,
        })
      },
    },
    actions: {
      onAddChild() {
        setSelectionToModel(self.addChild())
      },
      addChild(model = {}) {
        return getCollection(self, modelType).add({
          ...model,
          parent: self,
        })
      },
    },
  })
}
