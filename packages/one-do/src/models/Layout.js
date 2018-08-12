import {optionalEnum} from '../lib/little-mst'
import {equals} from 'ramda'

export const LAYOUT_DESKTOP = 'desktop'
export const LAYOUT_MOBILE = 'mobile'
export const LayoutEnum = optionalEnum('Layout', [
  LAYOUT_DESKTOP,
  LAYOUT_MOBILE,
])
export const isLayoutMobile = equals(LAYOUT_MOBILE)
export const isLayoutDesktop = equals(LAYOUT_DESKTOP)
