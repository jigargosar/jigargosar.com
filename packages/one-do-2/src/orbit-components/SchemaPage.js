/*eslint-disable*/

import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {attributeDescFromRecord, schema} from '../orbit-store/schema'
import {Page} from './Page'
import {PageTitle} from './PageTitle'
import cn from 'classnames'
import {
  _path,
  _prop,
  ascend,
  compose,
  descend,
  equals,
  join,
  keys,
  map,
  sortWith,
  take,
  toPairs,
} from '../lib/ramda'
import {liveQuery} from '../orbit-store/Store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  TableSortLabel,
  TableFooter,
  Tab,
  TablePagination,
  Tabs,
} from '@material-ui/core'
import {
  modelDefOfType,
  recAttr,
  typeOfRecord,
} from '../orbit-store/little-orbit'
import {action, computed, observable} from '../lib/mobx'
import {renderKeyedById} from '../lib/little-react'

/*eslint-enable*/

function isAttributeTypeNumeric(attribute) {
  return attribute.type === 'number'
}

@observer
export class SchemaPage extends Component {
  render() {
    const modelTypes = keys(schema.models)
    return (
      <Page>
        <PageTitle>Schema</PageTitle>
        <div className={cn('pa3 pt0')}>{join(', ')(modelTypes)}</div>
        <div className={cn('ph3')}>
          {/*{map(type => <Model key={type} type={type} />)(modelTypes)}*/}
          <Model type={'task'} />
        </div>
      </Page>
    )
  }
}

@observer
class HeaderCell extends Component {
  render() {
    const {
      numeric = false,
      label = 'INVALID_LABEL',
      sortDirection,
      active = false,
      tooltipTitle = label,
      SortLabelProps = {},
    } = this.props
    return (
      <TableCell numeric={numeric}>
        <Tooltip title={tooltipTitle}>
          <TableSortLabel
            direction={sortDirection}
            active={active}
            {...SortLabelProps}
          >
            {label}
          </TableSortLabel>
        </Tooltip>
      </TableCell>
    )
  }
}

@observer
class BodyCell extends Component {
  render() {
    const {name, record} = this.props
    const attrDesc = attributeDescFromRecord(name)(record)
    return (
      <TableCell numeric={isAttributeTypeNumeric(attrDesc)}>
        {`${recAttr(name)(record)}`}
      </TableCell>
    )
  }
}

const getAttributes = type => schema =>
  compose(toPairs, _prop('attributes'), modelDefOfType(type))(schema)

function attrPairsFromType(type) {
  // const attrPairsFromModelDef = compose(toPairs, _prop('attributes'))
  // return compose(attrPairsFromModelDef, modelDefOfType(type))(schema)
  return getAttributes(type)(schema)
}

function attributePath(name) {
  return ['attributes', name]
}

const idPath = ['id']

@observer
class Model extends Component {
  @observable query = liveQuery(q => q.findRecords(this.props.type))
  @observable sortPath = ['attributes', 'sortIdx']
  @observable sortDirFn = ascend

  render() {
    const {type} = this.props

    const rows = this.sortedRows

    return (
      <div className={cn('pb4')}>
        {renderHeader.call(this)}
        <Table padding={'dense'}>
          <TableHead>{this.renderHeaderRow()}</TableHead>
          <TableBody>
            {renderKeyedById(RecordRow, 'record', rows)}
          </TableBody>
        </Table>
      </div>
    )

    function renderHeader() {
      return <div className={cn('f4 b')}>{`${type}`}</div>
    }
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

  renderHeaderRow() {
    const {type} = this.props
    return (
      <TableRow>
        <HeaderCell
          label={'id'}
          active={equals(this.sortPath, idPath)}
          sortDirection={this.sortDirectionString}
          SortLabelProps={{onClick: () => this.onSortLabelClicked(idPath)}}
        />
        {map(([name, attribute]) => (
          <HeaderCell
            key={name}
            label={name}
            numeric={isAttributeTypeNumeric(attribute)}
            active={equals(this.sortPath, attributePath(name))}
            sortDirection={this.sortDirectionString}
            SortLabelProps={{
              onClick: () => this.onSortLabelClicked(attributePath(name)),
            }}
          />
        ))(attrPairsFromType(type))}
      </TableRow>
    )
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
}

@observer
class RecordRow extends Component {
  render() {
    const {
      record,
      type = typeOfRecord(record),
      attrPairs = attrPairsFromType(type),
    } = this.props
    return (
      <Fragment>
        <TableRow hover>
          <TableCell className={cn('code')}>
            {take(10)(record.id)}
          </TableCell>
          {map(([name, attribute]) => (
            <BodyCell
              key={name}
              name={name}
              attribute={attribute}
              record={record}
            />
          ))(attrPairs)}
        </TableRow>
      </Fragment>
    )
  }
}
