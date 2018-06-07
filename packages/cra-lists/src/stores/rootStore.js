import {autorun, observable} from 'mobx'

export const rootStore = observable({pageTitle: 'CRA List Prototype'})

autorun(() => {
  document.title = rootStore.pageTitle
})
