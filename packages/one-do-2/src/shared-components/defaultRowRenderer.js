import React, {Component} from 'react'
import {observer} from 'mobx-react'
import {TableRow} from '@material-ui/core'
import {mapIndexed} from '../lib/little-ramda'

export const defaultRowRenderer = function defaultRowRenderer({
  row,
  columns,
}) {
  return <GridRow row={row} columns={columns} />
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
