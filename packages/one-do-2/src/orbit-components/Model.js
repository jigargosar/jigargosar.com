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
import Sugar from 'sugar'

import {
  ascend,
  compose,
  descend,
  equals,
  filter,
  flatten,
  groupBy,
  head,
  identity,
  keys,
  map,
  mapObjIndexed,
  pick,
  prop,
  propEq,
  sortWith,
  values,
} from 'ramda'

import {DataGrid} from '../shared-components/DataGrid'
import {defaultRowRenderer} from '../shared-components/defaultRowRenderer'

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

async function addRecord(model) {
  const firstHasOneType = compose(
    head,
    keys,
    filter(propEq('type')('hasOne')),
    prop('relationships'),
  )(model)

  let hasOneRecord = null
  if (firstHasOneType) {
    hasOneRecord = await updateStore(t =>
      t.addRecord({
        type: firstHasOneType,
      }),
    )
  }

  const addResult = await updateStore(t =>
    t.addRecord({
      type: model.type,
      ...(firstHasOneType
        ? {
            relationships: {
              [firstHasOneType]: {
                data: pick(['type', 'id'])(hasOneRecord),
              },
            },
          }
        : {}),
    }),
  )
  console.debug(`addResult`, addResult)
  return addResult
}

@observer
export class Model extends Component {
  @action.bound
  handleAddRecord() {
    return addRecord(this.props.model)
  }

  @computed
  get query() {
    return liveQuery(q => q.findRecords(this.props.model.type))
  }

  render() {
    const model = this.props.model
    // console.log(`this.query.current()`, this.query.current())
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
  withProps(({sort}) => ({
    sort: {
      ...sort,
      comparator: sort.direction === 'asc' ? ascend : descend,
    },
  })),
  observer,
)
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
          <TableCell colSpan={columns.length} className={cn('b ttu blue')}>
            {`${row.title} (${row.count})`}
          </TableCell>
        </TableRow>
      )
    }
    return defaultRowRenderer({row, columns, ...rest})
  }

  @computed
  get columnConfigs() {
    const {sort, view} = this.props

    return map(computedToColConfig)(view.columnNames)

    function computedToColConfig(id) {
      const computed = view.computedLookup[id]

      return {
        id,
        sort: {
          active: equals(sort.id, id),
          onClick: () => this.props.handleSortPathClicked(id),
          direction: sort.direction,
        },
        isNumeric: computed.type === 'number',
        getCellData: row => computed.get(row),
        getFormattedCellData: row => format(computed.get(row)),
        label: computed.label,
      }
      function format(value) {
        if (computed.type === 'timestamp') {
          return Sugar.Date(value).format(
            `{Dow} {do} {Mon} '{yy} {hh}:{mm}{t}`,
          ).raw
        }
        return value
      }
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
