import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TableSortLabel,
  Toolbar,
} from '@material-ui/core'
import {action, computed, observable} from '../lib/mobx'
import {liveQuery, updateStore} from '../orbit-store/Store'
import cn from 'classnames'
import {AddIcon} from '../lib/Icons'
import {withSortStateHandlers} from './withSortStateHandlers'
import {Observer} from '../lib/mobx-react'
import {withProps} from 'recompose'
import {
  compose,
  concat,
  equals,
  flatten,
  groupBy,
  identity,
  map,
  mapObjIndexed,
  sortWith,
  take,
  values,
} from 'ramda'
import {DataGrid} from '../shared-components/DataGrid'
import {defaultRowRenderer} from '../shared-components/defaultRowRenderer'

function attributeToColConfig(attribute) {
  const name = attribute.name
  return {
    isNumeric: attribute.type === 'number',
    getCellData: row => `${row.attributes[name]}`,
    cellDataPath: ['attributes', name],
    label: attribute.label,
  }
}

function colConfigToColumnProp({
  isNumeric,
  getCellData,
  rowCellProps,
  label,
  sort,
}) {
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
        {([viewName, setViewName]) => (
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
            <ModelGridView
              key={model.type}
              records={this.query.current()}
              view={model.getView(viewName)}
            />
          </Fragment>
        )}
      </StringValue>
    )
  }
}

@withSortStateHandlers
@compose(
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
          title: JSON.parse(groupKey) ? 'Completed' : 'Pending',
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
)
export class ModelGridView extends Component {
  render() {
    return (
      <DataGrid
        rows={this.props.sortedFilteredAndGroupedRecords}
        columns={map(colConfigToColumnProp)(this.columnConfigs)}
        rowRenderer={this.rowRenderer}
      />
    )
  }

  @action.bound
  rowRenderer({row, columns, ...rest}) {
    if (row.isGroupRow) {
      return (
        <TableRow>
          <TableCell colSpan={3} className={cn('b ttu blue')}>
            {row.title || `Group Row`}
          </TableCell>
        </TableRow>
      )
    }
    return defaultRowRenderer({row, columns, ...rest})
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

    const sortPropsFor = path => ({
      active: equals(sort.path, path),
      onClick: () => this.props.handleSortPathClicked(path),
      direction: sort.direction,
    })
    return compose(
      //
      map(colConfig => ({
        ...colConfig,
        sort: sortPropsFor(colConfig.cellDataPath),
      })),
      concat(view.hideId ? [] : [idColumnConfig]),
      map(attributeToColConfig),
    )(view.columnAttributes)
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
