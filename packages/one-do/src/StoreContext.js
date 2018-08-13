import React from 'react'
import store from './store'
import {observer} from './lib/little-react'
import {compose} from './lib/ramda'
import {setDisplayName} from './lib/recompose'

const StoreContext = React.createContext(store)
const StoreContentConsumer = StoreContext.Consumer

export const withStore = BaseComponent => {
  const BaseComponentObserver = observer(BaseComponent)
  return function withStore(props) {
    return (
      <StoreContentConsumer>
        {store => <BaseComponentObserver {...props} store={store} />}
      </StoreContentConsumer>
    )
  }
}

export const withStoreDN = displayName =>
  compose(withStore, setDisplayName(displayName))

export function StoreContextProvider({children}) {
  return (
    <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
  )
}
