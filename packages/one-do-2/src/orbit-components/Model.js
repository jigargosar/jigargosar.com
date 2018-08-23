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
import {action, computed, observable} from '../lib/mobx'
import {liveQuery, updateStore} from '../orbit-store/Store'
import {
  compose,
  concat,
  equals,
  identity,
  map,
  merge,
  sortWith,
  take,
} from '../lib/ramda'
import cn from 'classnames'
import {AddIcon} from '../lib/Icons'
import DataGrid from './DataGrid'
import {withSortStateHandlers} from './withSortStateHandlers'
import {Observer} from '../lib/mobx-react'
import {withProps} from 'recompose'

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

@observer
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
    return (
      <StringValue defaultValue={model.defaultView.name}>
        {([viewName, setViewName]) => {
          return (
            <Fragment>
              <Toolbar variant={'regular'}>
                <SimpleSelect
                  label={'views'}
                  item={viewName}
                  items={model.viewNames}
                  onChange={setViewName}
                />
                <Button color={'primary'} onClick={this.handleAddRecord}>
                  <AddIcon /> Row
                </Button>
              </Toolbar>
              <ModelGrid
                key={model.type}
                records={this.query.current()}
                view={model.getView(viewName)}
              />
            </Fragment>
          )
        }}
      </StringValue>
    )
  }
}

@compose(
  withSortStateHandlers,
  observer,
  withProps(({records, sort}) => ({
    sortedRecords: sortWith([sort.comparator])(records),
  })),
  observer,
)
export class ModelGrid extends Component {
  get sortPath() {
    return this.props.sort.path
  }

  get direction() {
    return this.props.sort.direction
  }

  @computed
  get sortedRecords() {
    return this.props.sortedRecords
  }

  @computed
  get sortFilterRecords() {
    return this.props.view.filterRecords(this.sortedRecords)
  }

  render() {
    return (
      <DataGrid
        rows={this.sortFilterRecords}
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
        view.hideId ? [] : [idColumnConfig],
        map(
          //
          compose(attributeToColumnConfig),
        )(view.columnAttributes),
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
class SimpleSelect extends Component {
  render() {
    const {
      label,
      items,
      item,
      toValue = identity,
      toContent = identity,
    } = this.props
    return (
      <FormControl>
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          style={{minWidth: 180}}
          value={toValue(item)}
          onChange={e => this.props.onChange(e.target.value)}
        >
          {map(item => {
            const value = toValue(item)
            return (
              <MenuItem key={value} value={value}>
                {toContent(item)}
              </MenuItem>
            )
          })(items)}
        </Select>
      </FormControl>
    )
  }
}

@observer
class StringValue extends Component {
  @observable value = this.props.defaultValue || null

  @action.bound
  setValue(val) {
    this.value = val
  }

  render() {
    return (
      <Observer>
        {() => this.props.children([this.value, this.setValue])}
      </Observer>
    )
  }
}
