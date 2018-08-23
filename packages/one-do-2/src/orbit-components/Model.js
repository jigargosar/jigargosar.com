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
  contains,
  descend,
  equals,
  filter,
  head,
  map,
  merge,
  pick,
  sortWith,
  take,
} from '../lib/ramda'
import cn from 'classnames'
import {AddIcon} from '../lib/Icons'
import DataGrid from './DataGrid'
import {withStateHandlers} from '../lib/recompose'

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

@compose(
  withStateHandlers(({model}) => ({selectedView: head(model.views)}), {
    handleViewChange: (state, {model}) => (e, viewName) => ({
      selectedView: model.getView(viewName),
    }),
  }),
  observer,
)
export class Model extends Component {
  @action.bound
  handleAddRecord() {
    return updateStore(t => t.addRecord({type: this.props.model.type}))
  }
  render() {
    const model = this.props.model
    const selectedView = this.props.selectedView
    return (
      <Fragment>
        <Toolbar variant={'regular'}>
          <ValueSelection
            value={selectedView.name}
            values={model.viewNames}
            onChange={this.props.handleViewChange}
          />
          <Button color={'primary'} onClick={this.handleAddRecord}>
            NEW <AddIcon />
          </Button>
        </Toolbar>
        <ModelGrid view={selectedView} model={model} />
      </Fragment>
    )
  }
}

@observer
class ValueSelection extends Component {
  @action.bound
  onChange(e) {
    this.props.onChange(e, e.target.value)
  }
  render() {
    const {values, value} = this.props
    return (
      <FormControl>
        <Select
          style={{minWidth: 180}}
          value={value}
          onChange={this.onChange}
        >
          {map(value => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))(values)}
        </Select>
      </FormControl>
    )
  }
}

@observer
export class ModelGrid extends Component {
  @observable sortPath = ['attributes', 'sortIdx']
  @observable direction = 'asc'

  @computed
  get query() {
    return liveQuery(q => q.findRecords(this.props.model.type))
  }

  @computed
  get sortDirFn() {
    return this.direction === 'asc' ? ascend : descend
  }

  @computed
  get sortedRows() {
    const sortComparator = compose(this.sortDirFn, _path)(this.sortPath)
    return sortWith([sortComparator])(this.query.current())
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
    const view = this.props.view
    const hideId = view.hideId
    const model = this.props.model
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
        map(attributesToColumnConfigs)(
          map(model.getAttribute, view.columns),
        ),
      ),
    )
  }

  @action
  onSortLabelClicked(columnConfig) {
    const sortPath = columnConfig.cellDataPath
    if (equals(this.sortPath, sortPath)) {
      this.direction = this.direction === 'asc' ? 'desc' : 'asc'
    } else {
      this.direction = 'asc'
      this.sortPath = sortPath
    }
  }
}
