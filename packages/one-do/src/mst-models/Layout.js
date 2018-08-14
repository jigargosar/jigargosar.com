import {optional, optionalEnum} from '../lib/little-mst'
import {defaultTo, equals} from 'ramda'
import {types} from 'mobx-state-tree'

export const LAYOUT_DESKTOP = 'desktop'
export const LAYOUT_MOBILE = 'mobile'
export const isLayoutMobile = equals(LAYOUT_MOBILE)
export const isLayoutDesktop = equals(LAYOUT_DESKTOP)

const drawerOpenState = types.model('DrawerOpenState', {
  [LAYOUT_MOBILE]: false,
  [LAYOUT_DESKTOP]: true,
})
export const Layout = types
  .model('Layout', {
    drawerOpenState: optional(drawerOpenState),
    layout: optionalEnum('Layout', [LAYOUT_DESKTOP, LAYOUT_MOBILE]),
  })
  .volatile(self => ({}))
  .views(self => ({
    set isDrawerOpen(val) {
      self.drawerOpenState[self.layout] = val
    },
    get isDrawerOpen() {
      return self.drawerOpenState[self.layout]
    },
  }))
  .actions(self => ({
    toggleDrawer(bool) {
      self.isDrawerOpen = defaultTo(!self.isDrawerOpen)(bool)
    },
  }))
