import {TableCell, TableRow, TableSortLabel} from '@material-ui/core'
import React, {Component} from 'react'
import {validate} from '../lib/validate'
import Sugar from 'sugar'
import {withSortStateHandlers} from './withSortStateHandlers'
import {
  compose,
  equals,
  flatten,
  groupBy,
  isNil,
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

function enhance() {
  return compose(
    withSortStateHandlers,
    withProps(({sort, view}) => {
      return {
        sortComparator: isNil(sort.id)
          ? T
          : sort.directionFn(record =>
              view.getComputedData(sort.id, record),
            ),
      }
    }),
    compose(
      withProps(({sortComparator, records, sort, view}) => {
        const sortedRecords = sortWith([sortComparator])(records)
        const sortedAndFilteredRecords = view.filterRecords(sortedRecords)
        const groupRecords = compose(
          flatten,
          values,
          mapObjIndexed((records, groupName) => [
            {
              id: groupName,
              isGroupRow: true,
              title: groupName,
              count: records.length,
            },
            ...records,
          ]),
          groupBy(record =>
            view.getComputedData(view.groupByColumnName, record),
          ),
        )
        return {
          sortedRecords,
          sortedAndFilteredRecords,
          sortedFilteredAndGroupedRecords: view.groupByColumnName
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
