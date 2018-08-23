import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TableCell,
  TableSortLabel,
  Toolbar,
} from '@material-ui/core'
import {action, computed} from '../lib/mobx'
import {liveQuery, updateStore} from '../orbit-store/Store'
import {
  compose,
  concat,
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
import {withStateHandlers} from '../lib/recompose'
import {withSortStateHandlers} from './withSortStateHandlers'
import {validate} from '../lib/little-ramda'

function attributeToColumnConfig(attribute) {
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
  withStateHandlers(({model}) => ({selectedView: head(model.viewNames)}), {
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

  @computed
  get query() {
    return liveQuery(q => q.findRecords(this.props.model.type))
  }

  render() {
    const model = this.props.model
    const selectedView = this.props.selectedView
    return (
      <Fragment>
        <Toolbar variant={'regular'}>
          <ValueSelection
            label={'views'}
            value={selectedView.name}
            values={model.viewNames}
            onChange={this.props.handleViewChange}
          />
          <Button color={'primary'} onClick={this.handleAddRecord}>
            <AddIcon /> Row
          </Button>
        </Toolbar>
        <ModelGrid
          key={model.type}
          records={this.query.current()}
          view={model.getView(selectedView)}
          model={model}
        />
      </Fragment>
    )
  }
}

@compose(withSortStateHandlers, observer)
export class ModelGrid extends Component {
  @computed
  get query() {
    return liveQuery(q => q.findRecords(this.props.model.type))
  }

  get sortPath() {
    return this.props.sort.path
  }

  get direction() {
    return this.props.sort.direction
  }

  @computed
  get sortedRows() {
    const sortComparator = this.props.sort.comparator
    return sortWith([sortComparator])(this.props.records)
  }

  @computed
  get sortedThenFilteredRows() {
    return this.sortedRows
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
    const columns = view.columns
    validate('A', [columns])

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
        map(
          //
          compose(attributeToColumnConfig, model.getAttribute),
        )(columns),
      ),
    )
  }

  @action
  onSortLabelClicked(columnConfig) {
    const path = columnConfig.cellDataPath
    if (equals(this.sortPath, path)) {
      this.props.toggleSortDirection()
    } else {
      this.props.setSortState({direction: 'asc', path})
    }
  }
}

@observer
class ValueSelection extends Component {
  @action.bound
  onChange(e) {
    this.props.onChange(e, e.target.value)
  }
  render() {
    const {values, value, label} = this.props
    return (
      <FormControl>
        <InputLabel>{label}</InputLabel>
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
