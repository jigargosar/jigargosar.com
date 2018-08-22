import {observer} from 'mobx-react'
import React, {Component} from 'react'
import {Button, TableCell, TableSortLabel} from '@material-ui/core'
import {attributePath, idPath} from '../orbit-store/little-orbit'
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
  get sortDirectionString() {
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
          columns={[
            //
            {
              renderHeaderCell: () => (
                <TableCell>
                  <TableSortLabel
                    direction={this.sortDirectionString}
                    active={equals(this.sortPath, idPath)}
                    onClick={() => this.onSortLabelClicked(idPath)}
                  >
                    id
                  </TableSortLabel>
                </TableCell>
              ),
              renderCell: compose(
                data => <TableCell>{data}</TableCell>,
                take(10),
                _path(['row', 'id']),
              ),
            },
            ...map(attribute => ({
              renderHeaderCell: () => (
                <TableCell numeric={isAttribute(attribute)}>
                  <TableSortLabel
                    direction={this.sortDirectionString}
                    active={equals(
                      this.sortPath,
                      attributePath(attribute.name),
                    )}
                    onClick={() =>
                      this.onSortLabelClicked(
                        attributePath(attribute.name),
                      )
                    }
                  >
                    {`${attribute.name}`}
                  </TableSortLabel>
                </TableCell>
              ),
              renderCell: compose(
                data => (
                  <TableCell numeric={isAttribute(attribute)}>
                    {`${data}`}
                  </TableCell>
                ),
                _path(['row', ...attributePath(attribute.name)]),
              ),
            }))(this.attributes),
          ]}
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

function isAttribute(attribute) {
  return attribute.type === 'number'
}
