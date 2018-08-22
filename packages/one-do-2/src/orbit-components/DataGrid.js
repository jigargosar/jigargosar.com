import PropTypes from 'prop-types'
import React, {Component} from 'react'
import * as R from '../lib/ramda'
import {map} from '../lib/ramda'
import {observer} from '../lib/mobx-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core'

@observer
class DataGrid extends Component {
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
          {map(row => (
            <GridRow key={row.id || row.key} row={row} columns={columns} />
          ))(rows)}
        </TableBody>
      </Table>
    )
  }
}

export default DataGrid

@observer
class GridRow extends Component {
  render() {
    const {row, columns} = this.props
    return (
      <TableRow>
        {R.map(column => (
          <GridCell
            key={column.id || column.key}
            column={column}
            row={row}
          />
        ))(columns)}
      </TableRow>
    )
  }
}

@observer
class HeaderRow extends Component {
  render() {
    const {columns} = this.props
    return (
      <TableRow>
        {R.map(column => (
          <HeaderCell key={column.id || column.key} column={column} />
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
@observer
class GridCell extends Component {
  render() {
    const {row, column} = this.props
    return <TableCell>{column.renderCell({row})}</TableCell>
  }
}
