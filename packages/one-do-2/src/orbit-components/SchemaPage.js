import {observer} from 'mobx-react'
import React, {Component} from 'react'
import {schema} from '../orbit-store/schema'
import {Page} from './Page'
import {PageTitle} from './PageTitle'
import cn from 'classnames'
import {compose, head, map} from '../lib/ramda'
import store from '../orbit-store/Store'
import {Tab, Tabs, Toolbar} from '@material-ui/core'
import {getModelTypes} from '../orbit-store/little-orbit'
import {action, computed, observable} from '../lib/mobx'
import {Model} from './Model'

@observer
export class SchemaPage extends Component {
  @observable _selectedModelType = null

  @computed
  get selectedModelType() {
    return this._selectedModelType || compose(head, getModelTypes)(schema)
  }

  @action.bound
  handleTabsChange(e, value) {
    this._selectedModelType = value
  }

  @computed
  get selectedModel() {
    return store.schema.getModel(this.selectedModelType)
  }

  render() {
    return (
      <Page>
        <PageTitle>Schema</PageTitle>
        <Toolbar>
          <Tabs
            value={this.selectedModelType}
            onChange={this.handleTabsChange}
          >
            {map(type => {
              return <Tab key={type} label={type} value={type} />
            })(store.schema.modelTypes)}
          </Tabs>
        </Toolbar>
        <div className={cn('ph3')}>
          {this.selectedModelType && (
            <Model
              key={this.selectedModelType}
              type={this.selectedModelType}
              model={this.selectedModel}
            />
          )}
        </div>
      </Page>
    )
  }
}
