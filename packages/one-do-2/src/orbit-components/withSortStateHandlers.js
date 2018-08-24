import {ascend, compose, descend, equals, objOf} from 'ramda'
import {withHandlers, withProps, withStateHandlers} from 'recompose'
import {overPath} from '../lib/little-ramda'
import {observer} from 'mobx-react'

export const withSortStateHandlers = compose(
  withStateHandlers(
    {
      sort: {
        id: null,
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
    handleSortHeaderCellClick: ({
      sort,
      toggleSortDirection,
      setSortState,
    }) => id => {
      if (equals(sort.id, id)) {
        toggleSortDirection()
      } else {
        setSortState({direction: 'asc', id})
      }
    },
  }),
  withProps(({sort}) => ({
    sort: {
      ...sort,
      directionFn: sort.direction === 'asc' ? ascend : descend,
    },
  })),
  observer,
)
