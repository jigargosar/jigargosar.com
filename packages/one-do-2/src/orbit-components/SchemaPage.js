/*eslint-disable*/

import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {
  attributeDescFromRecord,
  getModel,
  schema,
} from '../orbit-store/schema'
import {Page} from './Page'
import {PageTitle} from './PageTitle'
import cn from 'classnames'
import {join, keys, map, take, toPairs} from '../lib/ramda'
import {liveQuery} from '../orbit-store/Store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core'
import {recAttr} from '../orbit-store/little-orbit'
import {computed} from '../lib/mobx'

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

function getModelAttributePairs(type) {
  return toPairs(getModel(type).attributes)
}

@observer
class Model extends Component {
  query = liveQuery(q => q.findRecords(this.props.type))
  render() {
    const {type} = this.props
    const rows = this.rows

    return (
      <div className={cn('pb4')}>
        {renderHeader()}
        <Table padding={'dense'}>
          <TableHead>{renderHeaderRow()}</TableHead>
          <TableBody>{renderBodyRows()}</TableBody>
        </Table>
      </div>
    )

    function renderHeader() {
      return <div className={cn('f4 b')}>{`${type}`}</div>
    }

    function renderBodyRows() {
      return map(record => (
        <Fragment key={record.id}>{renderBodyRow(record)}</Fragment>
      ))(rows)
    }

    function renderBodyRow(record) {
      return (
        <TableRow hover>
          <TableCell>{take(10)(record.id)}</TableCell>
          {map(([name, attribute]) => (
            <BodyCell
              key={name}
              name={name}
              attribute={attribute}
              record={record}
            />
          ))(getModelAttributePairs(type))}
        </TableRow>
      )
    }

    function renderHeaderRow() {
      return (
        <TableRow>
          <TableCell>{`id`}</TableCell>
          {map(([name, attribute]) => (
            <HeaderCell key={name} name={name} attribute={attribute} />
          ))(getModelAttributePairs(type))}
        </TableRow>
      )
    }
  }

  @computed
  get rows() {
    return this.query.current()
  }
}

@observer
class BodyRow extends Component {
  render() {
    const {record, attrPairs} = this.props
    return (
      <div>
        <TableRow hover>
          <TableCell>{take(10)(record.id)}</TableCell>
          {map(([name, attribute]) => (
            <BodyCell
              key={name}
              name={name}
              attribute={attribute}
              record={record}
            />
          ))(attrPairs)}
        </TableRow>
      </div>
    )
  }
}
