import {createObservableObject} from './utils'
import {validate} from '../utils'

export function Router() {
  return createObservableObject({
    props: {
      currentRoute: 'root',
    },
    actions: {
      goto(routeName) {
        validate('S', arguments)
        this.currentRoute = routeName
      },
    },
    name: 'Router',
  })
}
