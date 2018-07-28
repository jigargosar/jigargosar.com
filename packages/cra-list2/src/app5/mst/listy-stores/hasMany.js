import {getCollection, setSelectionToModel} from './helpers'

export function hasMany(modelType, {isParent = true} = {}) {
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
      addChild(attrs = {}) {
        return getCollection(self, modelType).add({
          ...attrs,
          ...(isParent ? {parent: self} : {}),
        })
      },
    },
  })
}
