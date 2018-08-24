import {TableCell, TableRow, TableSortLabel} from '@material-ui/core'
import React, {Component} from 'react'
import {validate} from '../lib/validate'
import Sugar from 'sugar'
import {withSortStateHandlers} from './withSortStateHandlers'
import {
  ascend,
  compose,
  descend,
  equals,
  flatten,
  groupBy,
  has,
  map,
  mapObjIndexed,
  sortWith,
  T,
  values,
} from '../lib/exports-ramda'
import {withProps} from 'recompose'
import {observer} from 'mobx-react'
import {DataGrid} from '../shared-components/DataGrid'
import {action} from 'mobx'
import cn from 'classnames'
import {defaultRowRenderer} from '../shared-components/defaultRowRenderer'
import {assert} from '../lib/assert'

@enhance()
export class ModelGridView extends Component {
  render() {
    return (
      <DataGrid
        rows={this.props.sortedFilteredAndGroupedRecords}
        columns={this.getColumns()}
        rowRenderer={this.rowRenderer}
      />
    )
  }

  getColumns() {
    const {sort, view, handleSortHeaderCellClick} = this.props

    return map(id => {
      validate('S', [id])
      const computed = view.computedLookup[id]
      assert(computed, `computed not found ${id}`)

      const isNumeric = computed.type === 'number'
      return {
        renderHeaderCell: () => (
          <TableCell numeric={isNumeric}>
            <TableSortLabel
              active={equals(sort.id, id)}
              direction={sort.direction}
              onClick={() => handleSortHeaderCellClick(id)}
            >
              {computed.label}
            </TableSortLabel>
          </TableCell>
        ),
        renderCell: ({row}) => (
          <TableCell numeric={isNumeric}>
            {formatComputedDataFromRecord(computed, row)}
          </TableCell>
        ),
      }
    })(view.columnNames)
  }

  @action.bound
  rowRenderer({row, columns, ...rest}) {
    if (row.isGroupRow) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} className={cn('b ttu blue')}>
            {`${row.title} (${row.count})`}
          </TableCell>
        </TableRow>
      )
    }
    return defaultRowRenderer({row, columns, ...rest})
  }
}

function getSortComparator(view, sort) {
  const hasComputed = has(sort.id)(view.computedLookup)
  if (!hasComputed) return T
  const computed = view.computedLookup[sort.id]
  return record => sort.directionFn(computed.get(record))
}

function enhance() {
  return compose(
    withSortStateHandlers,
    compose(
      withProps(({sort}) => ({
        sort: {
          ...sort,
          directionFn: sort.direction === 'asc' ? ascend : descend,
        },
      })),
      observer,
    ),
    compose(
      withProps(({records, sort, view}) => {
        const sortedRecords = sortWith([getSortComparator(view, sort)])(
          records,
        )
        const sortedAndFilteredRecords = view.filterRecords(sortedRecords)
        const groupRecords = compose(
          flatten,
          values,
          mapObjIndexed((records, groupKey) => [
            {
              id: groupKey,
              isGroupRow: true,
              title: view.groupKeyToTitle(groupKey),
              count: records.length,
            },
            ...records,
          ]),
          groupBy(view.groupBy),
        )
        return {
          sortedRecords,
          sortedAndFilteredRecords,
          sortedFilteredAndGroupedRecords: view.groupBy
            ? groupRecords(sortedAndFilteredRecords)
            : sortedAndFilteredRecords,
        }
      }),
      observer,
    ),
  )
}

function formatComputedDataFromRecord(computed, record) {
  validate('OO', [computed, record])

  const data = computed.get(record)
  if (computed.type === 'timestamp') {
    return Sugar.Date(data).format(`{Dow} {do} {Mon} '{yy} {hh}:{mm}{t}`)
      .raw
  }
  return data
}
