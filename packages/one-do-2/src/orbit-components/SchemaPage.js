/*eslint-disable*/

import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {schema} from '../orbit-store/schema'
import {Page} from './Page'
import {PageTitle} from './PageTitle'
import cn from 'classnames'
import {prettyStringifySafe} from '../lib/little-ramda'
import {compose, join, keys, map, take, toPairs} from '../lib/ramda'
import {liveQuery} from '../orbit-store/Store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  TableFooter,
  TableSortLabel,
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
class Model extends Component {
  query = liveQuery(q => q.findRecords(this.props.type))
  render() {
    const {type} = this.props
    const modelDesc = schema.getModel(type)
    const {attributes} = modelDesc
    const attrPairs = toPairs(attributes)
    return (
      <div className={cn('pb4')}>
        <div className={cn('f4 b')}>{`${type}`}</div>
        <Table
          padding={'dense'}
          // className={cn('code')}
        >
          <TableHead>
            <TableRow>
              <TableCell>{`id`}</TableCell>
              {map(([name, attribute]) => (
                <Fragment key={name}>
                  <TableCell numeric={isAttributeNumeric(attribute)}>
                    <Tooltip title={attribute.type}>
                      <div>{name}</div>
                    </Tooltip>
                  </TableCell>
                </Fragment>
              ))(attrPairs)}
            </TableRow>
          </TableHead>
          <TableBody>
            {map(r => (
              <Fragment key={r.id}>
                <TableRow hover>
                  <TableCell>{take(10)(r.id)}</TableCell>
                  {map(([name, attribute]) => {
                    const val = recAttr(name)(r)
                    return (
                      <Fragment key={name}>
                        <TableCell numeric={isAttributeNumeric(attribute)}>
                          {`${val}`}
                        </TableCell>
                      </Fragment>
                    )
                  })(attrPairs)}
                </TableRow>
              </Fragment>
            ))(this.rows)}
          </TableBody>
        </Table>
        {false && (
          <pre>
            <code>{prettyStringifySafe(this.rows)}</code>
          </pre>
        )}

        {false && (
          <pre>
            <code>{prettyStringifySafe(modelDesc)}</code>
          </pre>
        )}
      </div>
    )
  }

  @computed
  get rows() {
    return this.query.current()
  }
}
