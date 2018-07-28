import {getCollection, setSelectionToModel} from './helpers'
import {R} from '../../little-ramda'

export function hasManyChildren(typeOrFn) {
  return self => {
    const childType = R.when(R.is(Function))(fn => fn())(typeOrFn)
    return {
      views: {
        get childCollection() {
          return getCollection(self, childType)
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
    }
  }
}
