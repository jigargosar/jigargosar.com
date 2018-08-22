import {observer} from 'mobx-react'
import React, {Component} from 'react'
import {Button, TableCell, TableSortLabel} from '@material-ui/core'
import {action, computed, observable} from '../lib/mobx'
import {liveQuery, updateStore} from '../orbit-store/Store'
import {
  _path,
  ascend,
  compose,
  descend,
  equals,
  map,
  merge,
  sortWith,
  take,
} from '../lib/ramda'
import cn from 'classnames'
import {AddIcon} from '../lib/Icons'
import DataGrid from './DataGrid'

function attributesToColumnConfigs(attribute) {
  const name = attribute.name
  return {
    isNumeric: attribute.type === 'number',
    getCellData: row => `${row.attributes[name]}`,
    cellDataPath: ['attributes', name],
    label: name,
  }
}

function columnsFromConfigs(configs) {
  return map(({isNumeric, getCellData, rowCellProps, label, sort}) => {
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
          {getCellData(row)}
        </TableCell>
      ),
    }
  })(configs)
}

@observer
export class Model extends Component {
  @observable sortPath = ['attributes', 'sortIdx']
  @observable sortDirFn = ascend

  @computed
  get query() {
    return liveQuery(q => q.findRecords(this.props.model.type))
  }

  @computed
  get direction() {
    return this.sortDirFn === ascend ? 'asc' : 'desc'
  }

  @computed
  get sortComparator() {
    return compose(this.sortDirFn, _path)(this.sortPath)
  }

  @computed
  get sortedRows() {
    return sortWith([this.sortComparator])(this.query.current())
  }

  render() {
    return (
      <div className={cn('pb4')}>
        <DataGrid
          rows={this.sortedRows}
          columns={columnsFromConfigs(this.columnConfigs)}
        />
        <Button
          color={'primary'}
          onClick={() =>
            updateStore(t => t.addRecord({type: this.props.model.type}))
          }
        >
          add <AddIcon />
        </Button>
      </div>
    )
  }

  @computed
  get columnConfigs() {
    const idColumnConfig = {
      isNumeric: false,
      getCellData: row => take(10)(row.id),
      rowCellProps: {className: cn('code')},
      cellDataPath: ['id'],
      label: 'id',
    }
    return map(c =>
      merge({
        sort: {
          active: equals(this.sortPath, c.cellDataPath),
          onClick: () => this.onSortLabelClicked(c),
          direction: this.direction,
        },
      })(c),
    )([idColumnConfig, ...map(attributesToColumnConfigs)(this.attributes)])
  }

  @action
  onSortLabelClicked(columnConfig) {
    const sortPath = columnConfig.cellDataPath
    if (equals(this.sortPath, sortPath)) {
      this.sortDirFn = this.sortDirFn === ascend ? descend : ascend
    } else {
      this.sortDirFn = ascend
      this.sortPath = sortPath
    }
  }

  get attributes() {
    return this.props.model.attributes
  }
}
