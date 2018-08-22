import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  TableCell,
  TableSortLabel,
  Toolbar,
} from '@material-ui/core'
import {action, computed, observable} from '../lib/mobx'
import {liveQuery, updateStore} from '../orbit-store/Store'
import {
  _path,
  ascend,
  compose,
  concat,
  descend,
  equals,
  head,
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
    label: attribute.label,
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
  @action.bound
  handleAddRecord(e) {
    return updateStore(t => t.addRecord({type: this.props.model.type}))
  }
  render() {
    return (
      <Fragment>
        <Toolbar variant={'regular'}>
          <ViewSelection model={this.props.model} />
          <Button color={'primary'} onClick={this.handleAddRecord}>
            NEW <AddIcon />
          </Button>
        </Toolbar>
        <ModelGrid
          view={this.props.model.views[0]}
          model={this.props.model}
        />
      </Fragment>
    )
  }
}

@observer
class ViewSelection extends Component {
  @observable name = head(this.props.model.views).name

  @action.bound
  onChange(e) {
    this.name = e.target.value
  }
  render() {
    const {
      model: {views},
    } = this.props
    return (
      <FormControl>
        <Select
          style={{minWidth: 180}}
          value={this.name}
          onChange={this.onChange}
        >
          {map(({name}) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))(views)}
        </Select>
      </FormControl>
    )
  }
}

@observer
export class ModelGrid extends Component {
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
      <DataGrid
        rows={this.sortedRows}
        columns={columnsFromConfigs(this.columnConfigs)}
      />
    )
  }

  @computed
  get columnConfigs() {
    const idColumnConfig = {
      isNumeric: false,
      getCellData: row => take(10)(row.id),
      rowCellProps: {className: cn('code')},
      cellDataPath: ['id'],
      label: 'ID',
    }
    const hideId = this.props.view.hideId
    return map(c =>
      merge({
        sort: {
          active: equals(this.sortPath, c.cellDataPath),
          onClick: () => this.onSortLabelClicked(c),
          direction: this.direction,
        },
      })(c),
    )(
      concat(
        hideId ? [] : [idColumnConfig],
        map(attributesToColumnConfigs)(this.props.model.attributes),
      ),
    )
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
}
