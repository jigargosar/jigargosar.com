/*eslint-disable*/

import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {schema} from '../orbit-store/schema'
import {Page} from './Page'
import {PageTitle} from './PageTitle'
import cn from 'classnames'
import {prettyStringifySafe} from '../lib/little-ramda'
import {join, keys, map, partial, take, toPairs} from '../lib/ramda'
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

function isAttributeNumeric(attribute) {
  return attribute.type === 'number'
}

@observer
class HeaderCell extends Component {
  render() {
    const {attribute, name} = this.props
    return (
      <TableCell numeric={isAttributeNumeric(attribute)}>
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
    const {attribute, name, record} = this.props
    return (
      <TableCell numeric={isAttributeNumeric(attribute)}>
        {`${recAttr(name)(record)}`}
      </TableCell>
    )
  }
}

@observer
class Model extends Component {
  query = liveQuery(q => q.findRecords(this.props.type))
  render() {
    const {type} = this.props
    const modelDesc = schema.getModel(type)
    const attrPairs = toPairs(modelDesc.attributes)

    const rows = this.rows

    return (
      <div className={cn('pb4')}>
        <div className={cn('f4 b')}>{`${type}`}</div>
        <Table
          padding={'dense'}
        >
          <TableHead>{renderHeaderRow()}</TableHead>
          <TableBody>{renderBodyRows()}</TableBody>
        </Table>
      </div>
    )

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
          ))(attrPairs)}
        </TableRow>
      )
    }

    function renderHeaderRow() {
      return (
        <TableRow>
          <TableCell>{`id`}</TableCell>
          {map(([name, attribute]) => (
            <HeaderCell key={name} name={name} attribute={attribute} />
          ))(attrPairs)}
        </TableRow>
      )
    }
  }

  @computed
  get rows() {
    return this.query.current()
  }
}
