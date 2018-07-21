import {types} from 'mobx-state-tree'
import {commonViews} from './Views'
import {createItem} from './Item'
import {modelId} from '../../little-model'
import {_, isIndexOutOfBounds, maybeOr, S} from '../../little-ramda'

export const Bucket = types
  .model('Bucket', {
    id: types.identifier,
    name: '',
    deleted: false,
  })
  .views(commonViews)
  .views(views)
  .actions(actions)

function getNextSiblingOf(item, list) {
  if (_.isEmpty(list)) {
    return null
  }
  const idx = _.indexOf(item)(list) + 1
  return isIndexOutOfBounds(idx, list) ? null : list[idx]
}

function getPrevSiblingOf(item, list) {
  if (_.isEmpty(list)) {
    return null
  }
  const idx = _.indexOf(item)(list) - 1
  return isIndexOutOfBounds(idx, list) ? null : list[idx]
}

function maybeGetNexSiblingOf(item, list) {
  return S.toMaybe(getNextSiblingOf(item, list))
}

function views(self) {
  return {
    get items() {
      return self.root.getBucketItems(self)
    },
    nextSiblingOfItem(item) {
      maybeOr(item)(maybeGetNexSiblingOf(item, self.items))
      return getNextSiblingOf(item, self.items)
    },
    prevSiblingOfItem(item) {
      return getPrevSiblingOf(item, self.items)
    },
  }
}

function actions(self) {
  return {
    onDelete() {
      self.deleted = true
    },
    addItem(values) {
      return self.root.addItem(createItem(values, self))
    },
    onAddItem() {
      return self.addItem().setSelected()
    },
  }
}

export function createBucket(values) {
  return Bucket.create({
    ...values,
    id: modelId(Bucket.name),
  })
}
