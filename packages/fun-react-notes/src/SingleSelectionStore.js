import {model, nullString} from './little-mst'
import {_compose, _merge, defaultTo, isNil, mathMod} from './little-ramda'
import {whenKeyPD, withKeyEvent} from './components/utils'

export const SingleSelectionStore = model('SingleSelectionStore')
  .props({
    selectedKey: nullString,
    // keys: optional(stringArray, []),
  })
  .volatile(self => ({
    keys: [],
  }))
  .views(self => ({
    get selectedKeyIdx() {
      if (self.keys.length === 0) {
        return NaN
      }
      const idx = self.keys.indexOf(self.selectedKey)
      return idx === -1 ? 0 : idx
    },
    getContainerProps(props = {}) {
      return _merge(self.containerProps, props)
    },
    get containerProps() {
      return {
        onKeyDown: withKeyEvent(
          whenKeyPD('down')(self.selectNext),
          whenKeyPD('up')(self.selectPrev),
        ),
        tabIndex: 0,
      }
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
      self.selectedKey = key
    },
    setKeys(keys) {
      self.keys = keys
    },
    selectNext() {
      const nextIdx = _compose(defaultTo(null), mathMod)(
        self.selectedKeyIdx + 1,
        self.keys.length,
      )
      self.selectedKey = isNil(nextIdx) ? null : self.keys[nextIdx]
    },
    selectPrev() {
      const nextIdx = _compose(defaultTo(null), mathMod)(
        self.selectedKeyIdx - 1,
        self.keys.length,
      )
      self.selectedKey = isNil(nextIdx) ? null : self.keys[nextIdx]
    },
  }))
