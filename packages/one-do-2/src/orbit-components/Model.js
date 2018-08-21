import {observer} from 'mobx-react'
import React, {Component, Fragment} from 'react'
import {attributeDescFromRecord, schema} from '../orbit-store/schema'
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
} from '@material-ui/core'
import {
  attributePath,
  attributesOfType,
  idPath,
  recAttr,
  typeOfRecord,
} from '../orbit-store/little-orbit'
import {action, computed, observable} from '../lib/mobx'
import {liveQuery, updateStore} from '../orbit-store/Store'
import {
  _path,
  ascend,
  compose,
  descend,
  equals,
  map,
  sortWith,
  take,
} from '../lib/ramda'
import cn from 'classnames'
import {AddIcon} from '../lib/Icons'
import {renderKeyedById} from '../lib/little-react'

@observer
export class Model extends Component {
  @observable sortPath = ['attributes', 'sortIdx']
  @observable sortDirFn = ascend

  @computed
  get modelType() {
    return this.props.model.type
  }

  @computed
  get query() {
    return liveQuery(q => q.findRecords(this.modelType))
  }

  @computed
  get sortDirectionString() {
    return this.sortDirFn === ascend ? 'asc' : 'desc'
  }

  @computed
  get sortComparator() {
    return compose(this.sortDirFn, _path)(this.sortPath)
  }

  @computed
  get sortedRows() {
    return sortWith([this.sortComparator])(this.query.current())
  }

  render() {
    const rows = this.sortedRows
    const {type} = this.props

    return (
      <div className={cn('pb4')}>
        <Button
          color={'primary'}
          onClick={() =>
            updateStore(t => t.addRecord({type: this.modelType}))
          }
        >
          add <AddIcon />
        </Button>
        <Table padding={'dense'}>
          <TableHead>{this.renderHeaderRow()}</TableHead>
          <TableBody>
            {renderKeyedById(RecordRow, 'record', rows)}
          </TableBody>
        </Table>
      </div>
    )
  }

  @action
  onSortLabelClicked(sortPath) {
    if (equals(this.sortPath, sortPath)) {
      this.sortDirFn = this.sortDirFn === ascend ? descend : ascend
    } else {
      this.sortDirFn = ascend
      this.sortPath = sortPath
    }
  }

  renderHeaderRow() {
    const {type} = this.props
    return (
      <TableRow>
        <HeaderCell
          label={'id'}
          active={equals(this.sortPath, idPath)}
          sortDirection={this.sortDirectionString}
          SortLabelProps={{onClick: () => this.onSortLabelClicked(idPath)}}
        />
        {map(([name, attribute]) => (
          <HeaderCell
            key={name}
            label={name}
            numeric={isAttributeTypeNumeric(attribute)}
            active={equals(this.sortPath, attributePath(name))}
            sortDirection={this.sortDirectionString}
            SortLabelProps={{
              onClick: () => this.onSortLabelClicked(attributePath(name)),
            }}
          />
        ))(this.attributes())}
      </TableRow>
    )
  }

  @computed
  get attributes() {
    return attributesOfType(this.modelType)(schema)
  }
}

function isAttributeTypeNumeric(attribute) {
  return attribute.type === 'number'
}

@observer
class HeaderCell extends Component {
  render() {
    const {
      numeric = false,
      label = 'INVALID_LABEL',
      sortDirection,
      active = false,
      tooltipTitle = label,
      SortLabelProps = {},
    } = this.props
    return (
      <TableCell numeric={numeric}>
        <Tooltip title={tooltipTitle} enterDelay={1500}>
          <TableSortLabel
            direction={sortDirection}
            active={active}
            {...SortLabelProps}
          >
            {label}
          </TableSortLabel>
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

@observer
class RecordRow extends Component {
  render() {
    const {
      record,
      type = typeOfRecord(record),
      attrPairs = attributesOfType(type)(schema),
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
