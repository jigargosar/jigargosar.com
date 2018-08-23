import {ascend, compose, descend, objOf} from 'ramda'
import {withProps, withStateHandlers} from 'recompose'
import {overPath} from '../lib/little-ramda'
import {_path} from '../lib/ramda'

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
  withProps(({sort}) => ({
    sort: {
      ...sort,
      comparator: compose(
        sort.direction === 'asc' ? ascend : descend,
        _path,
      )(sort.path),
    },
  })),
)
