/*eslint-disable*/

import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {
  attributeDescFromRecord,
  modelDescFromType,
  schema,
} from '../orbit-store/schema'
import {Page} from './Page'
import {PageTitle} from './PageTitle'
import cn from 'classnames'
import {
  _prop,
  ascend,
  compose,
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
} from '@material-ui/core'
import {
  modelDefOfType,
  recAttr,
  typeOfRecord,
} from '../orbit-store/little-orbit'
import {computed, observable} from '../lib/mobx'
import {renderKeyedById} from '../lib/little-react'

/*eslint-enable*/

@observer
export class SchemaPage extends Component {
  render() {
    const modelTypes = keys(schema.models)
    return (
      <Page>
        <PageTitle>Schema</PageTitle>
        <div className={cn('pa3 pt0')}>{join(', ')(modelTypes)}</div>
        <div className={cn('ph3')}>
          {map(type => <Model key={type} type={type} />)(modelTypes)}
        </div>
      </Page>
    )
  }
}

function isAttributeTypeNumeric(attribute) {
  return attribute.type === 'number'
}

@observer
class HeaderCell extends Component {
  render() {
    const {attribute, name} = this.props
    return (
      <TableCell numeric={isAttributeTypeNumeric(attribute)}>
        <Tooltip title={attribute.type}>
          <div>{name}</div>
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

function attrPairsFromType(type) {
  return compose(toPairs, _prop('attributes'), modelDefOfType(type))(
    schema,
  )
}

@observer
class Model extends Component {
  @observable query = liveQuery(q => q.findRecords(this.props.type))
  @observable sortAttribute = 'sortIdx'
  render() {
    const {type} = this.props

    return (
      <div className={cn('pb4')}>
        {renderHeader()}
        <Table padding={'dense'}>
          <TableHead>{renderHeaderRow()}</TableHead>
          <TableBody>
            {renderKeyedById(RecordRow, 'record', this.rows)}
          </TableBody>
        </Table>
      </div>
    )

    function renderHeader() {
      return <div className={cn('f4 b')}>{`${type}`}</div>
    }
    function renderHeaderRow() {
      return (
        <TableRow>
          <TableCell>{`id`}</TableCell>
          {map(([name, attribute]) => (
            <HeaderCell key={name} name={name} attribute={attribute} />
          ))(attrPairsFromType(type))}
        </TableRow>
      )
    }
  }

  get rows() {
    return this.sortedRows
  }
  get allRows() {
    return this.query.current()
  }

  @computed
  get sortComparators() {
    return [ascend(_prop(this.sortAttribute))]
  }

  @computed
  get sortedRows() {
    return sortWith(this.sortComparators)(this.allRows)
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
