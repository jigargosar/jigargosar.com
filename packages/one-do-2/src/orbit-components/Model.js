import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Toolbar,
} from '@material-ui/core'
import {action, computed, observable} from '../lib/mobx'
import {liveQuery, updateStore} from '../orbit-store/Store'
import {AddIcon} from '../lib/Icons'
import {Observer} from '../lib/mobx-react'

import {
  compose,
  filter,
  head,
  identity,
  keys,
  map,
  pick,
  prop,
  propEq,
} from '../lib/exports-ramda'
import {ModelGridView} from './ModelGridView'
// import assertDefault from 'assert'

// const assert = assertDefault.strict

async function addRecord(model) {
  const firstHasOneType = compose(
    head,
    keys,
    filter(propEq('type')('hasOne')),
    prop('relationships'),
  )(model)

  let hasOneRecord = null
  if (firstHasOneType) {
    hasOneRecord = await updateStore(t =>
      t.addRecord({
        type: firstHasOneType,
      }),
    )
  }

  const addResult = await updateStore(t =>
    t.addRecord({
      type: model.type,
      ...(firstHasOneType
        ? {
            relationships: {
              [firstHasOneType]: {
                data: pick(['type', 'id'])(hasOneRecord),
              },
            },
          }
        : {}),
    }),
  )
  console.debug(`addResult`, addResult)
  return addResult
}

@observer
export class Model extends Component {
  @action.bound
  handleAddRecord() {
    return addRecord(this.props.model)
  }

  @computed
  get query() {
    return liveQuery(q => q.findRecords(this.props.model.type))
  }

  render() {
    const model = this.props.model
    // console.log(`this.query.current()`, this.query.current())
    return (
      <StringValue defaultValue={model.defaultView.name}>
        {([viewName, setViewName]) => (
          <Fragment>
            <Toolbar variant={'regular'}>
              <SimpleSelect
                label={'views'}
                item={viewName}
                items={model.viewNames}
                onChange={setViewName}
              />
              <Button color={'primary'} onClick={this.handleAddRecord}>
                <AddIcon /> Row
              </Button>
            </Toolbar>
            <ModelGridView
              key={model.type}
              records={this.query.current()}
              view={model.getView(viewName)}
            />
          </Fragment>
        )}
      </StringValue>
    )
  }
}

@observer
class SimpleSelect extends Component {
  render() {
    const {
      label,
      items,
      item,
      toValue = identity,
      toContent = identity,
    } = this.props
    return (
      <FormControl>
        {label && <InputLabel>{label}</InputLabel>}
        <Select
          style={{minWidth: 180}}
          value={toValue(item)}
          onChange={e => this.props.onChange(e.target.value)}
        >
          {map(item => {
            const value = toValue(item)
            return (
              <MenuItem key={value} value={value}>
                {toContent(item)}
              </MenuItem>
            )
          })(items)}
        </Select>
      </FormControl>
    )
  }
}

@observer
class StringValue extends Component {
  @observable value = this.props.defaultValue || null

  @action.bound
  setValue(val) {
    this.value = val
  }

  render() {
    return (
      <Observer>
        {() => this.props.children([this.value, this.setValue])}
      </Observer>
    )
  }
}
