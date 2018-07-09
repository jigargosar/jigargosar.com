import {
  createObservableObject,
  Disposers,
  mReaction,
} from './little-mobx'
import {_, validate} from '../utils'

import {createBrowserHistory} from 'history'

const a = require('nanoassert')

const findRouteByName = _.curry(function findRouteByName(
  routeName,
  routes,
) {
  return _.find(_.propEq('name', routeName))(routes)
})

const findRouteByPathname = _.curry(function findRouteByName(
  pathname,
  routes,
) {
  return _.find(_.propEq('pathname', pathname))(routes)
})

const notFoundRouteName = 'notFound'
// const routeNameEqualsNotFound = _.equals(notFoundRouteName)

const isValidRouteName = _.curry(function isValidRouteName(
  routeName,
  routes,
) {
  return _.compose(_.complement, _.isNil, findRouteByName(routeName))(
    routes,
  )
})

const defaultRoutes = [
  {name: 'root', pathname: '/'},
  {name: notFoundRouteName, pathname: '/404'},
]

export function Router({routes = defaultRoutes} = {}) {
  const history = createBrowserHistory()
  const pathnameEquals = _.equals(history.location.pathname)

  const router = createObservableObject({
    props: {
      currentRouteName:
        findRouteByPathname(history.location.pathname) || 'notFound',
      get currentPathname() {
        const route = findRouteByName(this.currentRouteName, routes)
        if (_.isNil(route)) {
          return '/'
        }
        return route.pathname
      },
    },
    actions: {
      goto({name}) {
        validate('S', [name])
        a(isValidRouteName(name, routes))
        this.currentRoute = name
      },
    },
    name: 'Router',
  })

  const disposers = Disposers()
  disposers.push(
    mReaction(
      () => [router.currentPathname],
      () => {
        if (!pathnameEquals(router.currentPathname)) {
          // history.pushState(router.currentPathname, mJS(router))
        }
      },
      {name: 'Router: update Location from currentRoute'},
    ),
  )
  return router
}
