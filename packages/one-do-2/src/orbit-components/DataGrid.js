import PropTypes from 'prop-types'
import React, {Component, Fragment} from 'react'
import {map} from '../lib/ramda'
import {observer} from '../lib/mobx-react'
import {Table, TableBody, TableHead, TableRow} from '@material-ui/core'
import {mapIndexed} from '../lib/little-ramda'

export const defaultRowRenderer = function defaultRowRenderer({
  row,
  columns,
}) {
  return (
    <Fragment key={row.id || row.key}>
      <GridRow row={row} columns={columns} />
    </Fragment>
  )
}

@observer
export class DataGrid extends Component {
  static propTypes = {
    columns: PropTypes.array.isRequired,
    rows: PropTypes.array.isRequired,
  }

  render() {
    const {rows, columns} = this.props

    return (
      <Table padding={'dense'}>
        <TableHead>
          <HeaderRow columns={columns} />
        </TableHead>
        <TableBody>
          {map(row => defaultRowRenderer({row, columns}))(rows)}
        </TableBody>
      </Table>
    )
  }
}

@observer
class GridRow extends Component {
  render() {
    const {row, columns} = this.props
    return (
      <TableRow>
        {mapIndexed((column, idx) => (
          <RowCell key={idx} column={column} row={row} />
        ))(columns)}
      </TableRow>
    )
  }
}

@observer
class RowCell extends Component {
  render() {
    const {row, column} = this.props
    return column.renderCell({row})
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
