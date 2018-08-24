import PropTypes from 'prop-types'
import React, {Component, Fragment} from 'react'
import {map} from '../lib/exports-ramda'
import {observer} from '../lib/mobx-react'
import {Table, TableBody, TableHead, TableRow} from '@material-ui/core'
import {mapIndexed} from '../lib/little-ramda'
import {defaultRowRenderer} from './defaultRowRenderer'

@observer
export class DataGrid extends Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
    rowRenderer: PropTypes.func,
  }

  render() {
    const {rows, columns, rowRenderer = defaultRowRenderer} = this.props

    return (
      <Table padding={'dense'}>
        <TableHead>
          <HeaderRow columns={columns} />
        </TableHead>
        <TableBody>
          {map(row => (
            <Fragment key={row.id || row.key}>
              {rowRenderer({row, columns})}
            </Fragment>
          ))(rows)}
        </TableBody>
      </Table>
    )
  }
}

@observer
class HeaderRow extends Component {
  render() {
    const {columns} = this.props
    return (
      <TableRow>
        {mapIndexed((column, idx) => (
          <HeaderCell key={idx} column={column} />
        ))(columns)}
      </TableRow>
    )
  }
}

@observer
class HeaderCell extends Component {
  render() {
    const {column} = this.props
    return column.renderHeaderCell()
  }
}
