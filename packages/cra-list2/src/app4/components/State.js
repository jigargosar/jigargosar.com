import React from 'react'
import {CenterLayout, RootContainer, Text} from './ui'
import {cn, F, mrInjectAll, renderKeyed} from './utils'
import {_} from '../utils'
import Button from '@material-ui/core/Button'
import {withStyles} from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'

const StateProperty = mrInjectAll(function StateProperty({property}) {
  return <div>{`${property[0]}`}</div>
})

const StateObject = withStyles(theme => ({
  sizeSmall: {
    padding: '0px 0px',
    minWidth: 0,
    minHeight: 0,
    fontSize: theme.typography.pxToRem(13),
  },
}))(
  mrInjectAll(function StateObject({state, object, classes: c}) {
    return (
      <F>
        <div>Type: Object</div>
        <div className={cn('flex items-center')}>
          <Typography className={cn('mr1 lh-copy')}>
            propCount: {_.compose(_.length, _.keys)(object)}
          </Typography>
          <Button
            className={cn('mr1 lh-copy')}
            // variant={'contained'}
            color={'secondary'}
            size={'small'}
            classes={{
              sizeSmall: c.sizeSmall,
            }}
          >
            add
          </Button>
        </div>

        <div>
          {renderKeyed(
            StateProperty,
            'property',
            _.head,
            _.toPairs(object),
          )}
        </div>
      </F>
    )
  }),
)

const State = mrInjectAll(function({state}) {
  return <StateObject object={state.root} />
})

const Main = mrInjectAll(function App() {
  return (
    <RootContainer>
      <CenterLayout>
        <F>
          <div className={cn('pa3 bg-blue white shadow-1')}>
            <Text>{`State`}</Text>
          </div>
          <div className={cn('pa3')}>
            <State />
          </div>
        </F>
      </CenterLayout>
    </RootContainer>
  )
})

export default Main
