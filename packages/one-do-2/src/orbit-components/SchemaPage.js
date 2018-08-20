import {observer} from 'mobx-react'
import React, {Component} from 'react'
import {join, keys, map} from 'ramda'
import {schema} from '../orbit-store/schema'
import {Page} from './Page'
import {PageTitle} from './PageTitle'
import cn from 'classnames'
import {prettyStringifySafe} from '../lib/little-ramda'

@observer
export class SchemaPage extends Component {
  render() {
    const modelTypes = keys(schema.models)
    return (
      <Page>
        <PageTitle>Schema</PageTitle>
        <div className={cn('pa3 pt0')}>{join(', ')(modelTypes)}</div>
        <div className={cn('ph3')}>
          {map(type => (
            <div key={type}>
              <div className={cn('pv1')}>
                {type}
                <pre>
                  <code>{prettyStringifySafe(schema.getModel(type))}</code>
                </pre>
              </div>
            </div>
          ))(modelTypes)}
        </div>
      </Page>
    )
  }
}
