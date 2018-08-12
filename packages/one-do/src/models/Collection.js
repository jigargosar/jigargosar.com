import {dropFlow, model} from '../lib/little-mst'
import {flow, types} from 'mobx-state-tree'
import {_compose, _prop} from '../lib/ramda'
import {equals, filter, isNil, reject} from 'ramda'
import {
  firestoreUserCRefNamed,
  isSignedIn,
  queryToDocsData,
} from '../firebase'
import {findById} from '../lib/little-ramda'

export function collection(Model) {
  const Collection = model(`${Model.name}Collection`, {
    items: types.optional(types.array(Model), []),
  })
    .volatile(self => ({}))
    .views(self => ({
      get dirtyItems() {
        return self.filter(_prop('isDirty'))
      },
      get activeItems() {
        return reject(_prop('isDeleted'))(self.items)
      },
      get isDirty() {
        return self.dirtyItems.length > 0
      },
      filter(fn) {
        return filter(fn)(self.items)
      },
    }))
    .actions(self => ({
      add(props) {
        self.items.push(Model.create(props))
      },
      update(props, item) {
        const preUpdateSnap = item.remoteSnap
        Object.assign(item, item.pickRemoteProps(props))
        if (!item.isDirty && !equals(preUpdateSnap, item.remoteSnap)) {
          item.isDirty = true
        }
      },
      saveToCRef: flow(function*(cRef, item) {
        console.assert(item.isDirty)
        const preSaveFireSnap = item.remoteSnap
        yield cRef.doc(item.id).set(preSaveFireSnap)
        if (equals(preSaveFireSnap, item.remoteSnap)) {
          item.isDirty = false
        }
      }),
      loadFromRemoteData(data, item) {
        if (item.isDirty) return
        const cleanProps = _compose(reject(isNil), item.pickRemoteProps)(
          data,
        )
        Object.assign(item, cleanProps)
      },
      delete(item) {
        self.update({isDeleted: true}, item)
      },
      pullFromRemote: dropFlow(function*() {
        console.assert(isSignedIn())
        const cRef = firestoreUserCRefNamed(Collection.name)

        const docsData = yield queryToDocsData(cRef)
        console.log(`[sync] pull result: docsData.length`, docsData.length)
        docsData.forEach(data => {
          const item = findById(data.id)(self.items)
          if (item) {
            self.loadFromRemoteData(data, item)
          } else {
            self.add({...data, isDirty: false})
          }
        })
      }),
      pushDirtyToRemote: dropFlow(function*() {
        console.assert(isSignedIn())
        const cRef = firestoreUserCRefNamed(Collection.name)

        const pushResult = yield Promise.all(
          self.dirtyItems.map(item => self.saveToCRef(cRef, item)),
        )
        console.log('[sync] push success', pushResult.length)
      }),
    }))
  return Collection
}
