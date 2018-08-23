import 'mobx'
import {Provider as MRProvider, Observer as MRObserver} from 'mobx-react'

export const Provider = MRProvider
export const Observer = MRObserver

export {
  observer,
  PropTypes,
  inject,
  onError,
  componentByNodeRegistry,
  renderReporter,
  trackComponents,
  useStaticRendering,
} from 'mobx-react'
