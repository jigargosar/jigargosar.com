import {model, optional, optionalEnum} from '../lib/little-mst'
import {defaultTo, equals} from 'ramda'

export const LAYOUT_DESKTOP = 'desktop'
export const LAYOUT_MOBILE = 'mobile'
export const isLayoutMobile = equals(LAYOUT_MOBILE)
export const isLayoutDesktop = equals(LAYOUT_DESKTOP)

const drawerOpenState = model('DrawerOpenState', {
  [LAYOUT_MOBILE]: false,
  [LAYOUT_DESKTOP]: true,
})
export const Layout = model('Layout', {
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
    get isMobileLayout() {
      return isLayoutMobile(self.layout)
    },
    get drawerVariant() {
      return self.isMobileLayout ? 'temporary' : 'persistent'
    },
    get isDrawerTemporary() {
      return self.drawerVariant === 'temporary'
    },
  }))
  .actions(self => ({
    setLayout(layout) {
      if (self.layout === layout) return
      self.layout = layout
      self.drawerOpenState = {}
    },
    toggleDrawer(bool) {
      self.isDrawerOpen = defaultTo(!self.isDrawerOpen)(bool)
    },
  }))
