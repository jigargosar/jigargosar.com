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
import cn from 'classnames'
import {AddIcon} from '../lib/Icons'
import DataGrid from './DataGrid'
import {withSortStateHandlers} from './withSortStateHandlers'
import {Observer} from '../lib/mobx-react'
import {withProps} from 'recompose'
import {
  compose,
  concat,
  equals,
  identity,
  map,
  merge,
  sortWith,
  take,
} from 'ramda'

import {tapLog} from '../lib/little-ramda'

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
  withProps(({records, sort, view}) => {
    const sortedRecords = sortWith([sort.comparator])(records)
    return {
      sortedRecords,
      sortedAndFilteredRecords: view.filterRecords(sortedRecords),
    }
  }),
  observer,
)
export class ModelGrid extends Component {
  get sortPath() {
    return this.props.sort.path
  }

  get direction() {
    return this.props.sort.direction
  }

  render() {
    return (
      <DataGrid
        rows={this.props.sortedAndFilteredRecords}
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
    const {sort, view} = this.props

    const map1 = map(c =>
      merge(this.getSortProps(sort, c.cellDataPath))(c),
    )
    return compose(
      tapLog,
      //
      map1(concat(view.hideId ? [] : [idColumnConfig])),
      tapLog,
      map(attributeToColumnConfig),
      tapLog,
    )(view.columnAttributes)
  }

  getSortProps(sort, path) {
    return {
      sort: {
        active: equals(sort.path, path),
        onClick: () => this.props.handleSortPathClicked(path),
        direction: sort.direction,
      },
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
