import {ascend, compose, descend, equals, objOf} from 'ramda'
import {withHandlers, withProps, withStateHandlers} from 'recompose'
import {overPath} from '../lib/little-ramda'
import {_path} from '../lib/ramda'
import {observer} from 'mobx-react'

export const withSortStateHandlers = compose(
  withStateHandlers(
    {
      sort: {
        path: ['attributes', 'sortIdx'],
        direction: 'asc',
      },
    },
    {
      toggleSortDirection: state => () =>
        overPath(['sort', 'direction'])(
          direction => (direction === 'asc' ? 'desc' : 'asc'),
        )(state),
      setSortState: () => objOf('sort'),
    },
  ),
  withHandlers({
    handleSortPathClicked: ({
      sort,
      toggleSortDirection,
      setSortState,
    }) => path => {
      if (equals(sort.path, path)) {
        toggleSortDirection()
      } else {
        setSortState({direction: 'asc', path})
      }
    },
  }),
  withProps(({sort}) => ({
    sort: {
      ...sort,
      comparator: compose(
        sort.direction === 'asc' ? ascend : descend,
        _path,
      )(sort.path),
    },
  })),
  observer,
)
