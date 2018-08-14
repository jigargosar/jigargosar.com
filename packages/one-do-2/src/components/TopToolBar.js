import React, {Component} from 'react'
import {observer} from '../lib/little-react'

import cn from 'classnames'
import MenuIcon from '@material-ui/icons/MenuRounded'
import IconButton from '@material-ui/core/IconButton/IconButton'
import Typography from '@material-ui/core/Typography/Typography'
import Toolbar from '@material-ui/core/Toolbar/Toolbar'
import {handleToggleDrawer} from '../mst-models/RootStore'

@observer
export class TopToolBar extends Component {
  render() {
    return (
      <Toolbar>
        <IconButton color={'inherit'} onClick={handleToggleDrawer}>
          <MenuIcon/>
        </IconButton>
        <Typography
          className={cn('ml2')}
          variant="title"
          color="inherit"
          noWrap
        >
          ONE DO
        </Typography>
      </Toolbar>
    )
  }
}
