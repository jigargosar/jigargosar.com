import {compose, equals, objOf} from 'ramda'
import {withHandlers, withStateHandlers} from 'recompose'
import {overPath} from '../lib/little-ramda'
import {observer} from 'mobx-react'

export const withSortStateHandlers = compose(
  withStateHandlers(
    {
      sort: {
        id: '',
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
  observer,
)
