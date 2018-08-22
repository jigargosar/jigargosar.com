import PropTypes from 'prop-types'
import React, {Component} from 'react'
import * as R from '../lib/ramda'
import {observer} from '../lib/mobx-react'
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
        <TableHead>{this.renderHeaderRow()}</TableHead>
        <TableBody>
          {R.map(row => (
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
class HeaderCell extends Component {
  render() {
    const {row, column} = this.props
    return <TableCell>{column.renderHeaderCell({row})}</TableCell>
  }
}
@observer
class GridCell extends Component {
  render() {
    const {row, column} = this.props
    return <TableCell>{column.renderCell({row})}</TableCell>
  }
}
