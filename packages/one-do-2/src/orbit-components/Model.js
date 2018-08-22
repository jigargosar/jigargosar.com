import {observer} from 'mobx-react'
import React, {Component} from 'react'
import {Button, TableCell, TableSortLabel} from '@material-ui/core'
import {idPath} from '../orbit-store/little-orbit'
import {action, computed, observable} from '../lib/mobx'
import {liveQuery, updateStore} from '../orbit-store/Store'
import {
  _path,
  ascend,
  compose,
  descend,
  equals,
  map,
  sortWith,
  take,
} from '../lib/ramda'
import cn from 'classnames'
import {AddIcon} from '../lib/Icons'
import DataGrid from './DataGrid'

function columnConfigsFromAttribute(attribute) {
  const name = attribute.name
  return {
    isNumeric: attribute.type === 'number',
    getCellData: row => row.attributes[name],
    cellDataPath: ['attributes', name],
    label: name,
  }
}

@observer
export class Model extends Component {
  @observable sortPath = ['attributes', 'sortIdx']
  @observable sortDirFn = ascend

  @computed
  get modelType() {
    return this.props.model.type
  }

  @computed
  get query() {
    return liveQuery(q => q.findRecords(this.modelType))
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
    const idColumnConfig = {
      isNumeric: false,
      getCellData: row => row.id,
      cellDataPath: ['id'],
      label: 'id',
    }
    const configs = [
      idColumnConfig,
      ...map(columnConfigsFromAttribute)(this.attributes),
    ]
    return (
      <div className={cn('pb4')}>
        <DataGrid
          rows={this.sortedRows}
          columns={map(config => {
            const {isNumeric, getCellData, label, cellDataPath} = config
            return {
              renderHeaderCell: () => (
                <TableCell numeric={isNumeric}>
                  <TableSortLabel
                    direction={this.direction}
                    active={equals(this.sortPath, cellDataPath)}
                    onClick={() => this.onSortLabelClicked(cellDataPath)}
                  >
                    {`${label}`}
                  </TableSortLabel>
                </TableCell>
              ),
              renderCell: ({row}) => (
                <TableCell numeric={isNumeric}>
                  {`${getCellData(row)}`}
                </TableCell>
              ),
            }
          })(configs)}
        />
        <Button
          color={'primary'}
          onClick={() =>
            updateStore(t => t.addRecord({type: this.modelType}))
          }
        >
          add <AddIcon />
        </Button>
      </div>
    )
  }

  @action
  onSortLabelClicked(sortPath) {
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
