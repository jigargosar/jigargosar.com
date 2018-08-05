import {autorun, computed, model, nullNumber} from './little-mst'
import {__, _compose, _merge, defaultTo, mathMod} from './ramda'
import {whenKeyPD, withKeyEvent} from './components/utils'

export const SingleSelectionStore = model('SingleSelectionStore')
  .props({
    _selectedIdx: nullNumber,
  })
  .volatile(self => ({
    computedKeys: computed(() => []),
  }))
  .views(self => ({
    get keys() {
      return self.computedKeys.get()
    },
    get selectedKey() {
      return self.keys[self._selectedIdx]
    },
    set selectedIdx(idx) {
      self._selectedIdx = _compose(
        mathMod(__, self.keys.length),
        defaultTo(0),
      )(idx)
    },
    get selectedIdx() {
      if (self.keys.length === 0) {
        return NaN
      }
      return _compose(mathMod(__, self.keys.length), defaultTo(0))(
        self._selectedIdx,
      )
    },
    getContainerProps(props = {}) {
      return _merge(
        {
          onKeyDown: withKeyEvent(
            whenKeyPD('down')(self.selectNext),
            whenKeyPD('up')(self.selectPrev),
          ),
          // tabIndex: 0,
        },
        props,
      )
    },
    getItemProps(props = {}) {
      return _merge(
        {
          onClick: () => {
            self.setSelectedKey(props.key)
          },
        },
        props,
      )
    },
  }))
  .actions(self => ({
    setSelectedKey(key) {
      self.selectedIdx = self.keys.indexOf(key)
    },
    setComputedKeys(computedKeys) {
      self.computedKeys = computedKeys
    },
    selectNext() {
      self.selectedIdx += 1
    },
    selectPrev() {
      self.selectedIdx -= 1
    },
  }))

const SSM = model('SSM', {_idx: 0, _max: 0}).views(self => ({
  get max() {
    const max = self._max
    return max === 0 ? NaN : max
  },
  get idx() {
    return mathMod(self._idx)(self.max)
  },
  get lastIdx() {
    return self.max - 1
  },
}))

const ssm = SSM.create()

autorun(() => {
  console.log(`ssm.max`, ssm.max)
  console.log(`ssm.idx`, ssm.idx)
})
