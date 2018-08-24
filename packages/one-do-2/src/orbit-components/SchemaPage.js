import {observer} from 'mobx-react'
import React, {Component} from 'react'
import {Page} from './Page'
import {PageTitle} from './PageTitle'
import {head, map} from '../lib/exports-ramda'
import store from '../orbit-store/Store'
import {Tab, Tabs, Toolbar} from '@material-ui/core'
import {action, computed, observable} from '../lib/mobx'
import {Model} from './Model'

@observer
export class SchemaPage extends Component {
  @observable _selectedModelType = null

  @computed
  get selectedModelType() {
    return this._selectedModelType || head(store.schema.modelTypes)
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
        <div>
          {this.selectedModel && (
            <Model
              key={this.selectedModel.type}
              model={this.selectedModel}
            />
          )}
        </div>
      </Page>
    )
  }
}
