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
  map,
  mapObjIndexed,
  sortWith,
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

    const columnConfigs = map(id => {
      validate('S', [id])

      const computed = view.computedLookup[id]
      assert(computed, `computed not found ${id}`)

      return {
        id,
        sort: {
          active: equals(sort.id, id),
          onClick: () => handleSortHeaderCellClick(id),
          direction: sort.direction,
        },
        isNumeric: computed.type === 'number',
        getRawCellData: record => computed.get(record),
        getCellContent: record =>
          formatComputedDataFromRecord(computed, record),
        label: computed.label,
      }
    })(view.columnNames)

    return map(colConfigToColumnProp)(columnConfigs)
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
    compose(
      withProps(({sort}) => ({
        sort: {
          ...sort,
          comparator: sort.direction === 'asc' ? ascend : descend,
        },
      })),
      observer,
    ),
    compose(
      withProps(({records, sort, view}) => {
        const sortedRecords = sortWith([sort.comparator])(records)
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

function colConfigToColumnProp(config) {
  const {isNumeric, getRawCellData, rowCellProps, label, sort} = config
  return {
    renderHeaderCell: () => (
      <TableCell numeric={isNumeric}>
        <TableSortLabel
          direction={sort.direction}
          active={sort.active}
          onClick={sort.onClick}
        >
          {label}
        </TableSortLabel>
      </TableCell>
    ),
    renderCell: ({row}) => (
      <TableCell numeric={isNumeric} {...rowCellProps}>
        {getRawCellData(row)}
      </TableCell>
    ),
  }
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
