import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {schema} from '../orbit-store/schema'
import {Page} from './Page'
import {PageTitle} from './PageTitle'
import cn from 'classnames'
import {prettyStringifySafe} from '../lib/little-ramda'
import {toPairs, join, keys, map, compose} from '../lib/ramda'

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

@observer
class Model extends Component {
  render() {
    const {type} = this.props
    const modelDesc = schema.getModel(type)
    const {attributes} = modelDesc
    return (
      <div className={cn('pv1')}>
        <div className={cn('f4 b')}>{`${type}`}</div>
        {compose(
          map(([name, attribute]) => (
            <Fragment key={name}>
              <span className={cn('ph1')}>
                <strong>{`${name}:`}</strong>
                <em>{`${attribute.type}`}</em>
              </span>
            </Fragment>
          )),
          toPairs,
        )(attributes)}
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
