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
        {false && (
          <div className={cn('pa3 pt0')}>{join(', ')(modelTypes)}</div>
        )}
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
    return (
      <div className={cn('pv1')}>
        <div className={cn('f4 b')}>{`${type}`}</div>
        <Table
          padding={'dense'}
          // className={cn('code')}
        >
          <TableHead>
            <TableRow>
              <TableCell>{`id`}</TableCell>
              {compose(
                map(([name, attribute]) => (
                  <Fragment key={name}>
                    <TableCell numeric={isAttributeNumeric(attribute)}>
                      {`${name}: ${attribute.type}`}
                    </TableCell>
                  </Fragment>
                )),
                toPairs,
              )(attributes)}
            </TableRow>
          </TableHead>
          <TableBody>
            {map(r => (
              <Fragment key={r.id}>
                <TableRow>
                  <TableCell>{take(10)(r.id)}</TableCell>
                  {compose(
                    map(([name, attribute]) => {
                      const val = recAttr(name)(r)
                      return (
                        <Fragment key={name}>
                          <TableCell
                            numeric={isAttributeNumeric(attribute)}
                          >
                            {`${val}`}
                          </TableCell>
                        </Fragment>
                      )
                    }),
                    toPairs,
                  )(attributes)}
                </TableRow>
              </Fragment>
            ))(this.rows)}
          </TableBody>
        </Table>
        <pre>
          <code>{prettyStringifySafe(this.rows)}</code>
        </pre>

        {false &&
          map(([name, attribute]) => (
            <Attribute
              key={name}
              attribute={attribute}
              type={type}
              name={name}
            />
          ))(toPairs(attributes))}
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
@observer
class Attribute extends Component {
  render() {
    const {attribute, type, name} = this.props
    return (
      <div className={cn('pv1')}>
        {`${type}.${name}`}
        <pre>
          <code>{prettyStringifySafe(attribute)}</code>
        </pre>
      </div>
    )
  }
}
