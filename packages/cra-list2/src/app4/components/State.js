import React from 'react'
import {CenterLayout, RootContainer, Text} from './ui'
import {cn, F, mrInjectAll, renderKeyed} from './utils'
import {_} from '../utils'
import Button from '@material-ui/core/Button'
import {withStyles} from '@material-ui/core/styles'
// import Typography from '@material-ui/core/Typography'

const StateProperty = mrInjectAll(function StateProperty({property}) {
  return (
    <div>
      {`${property[0]} : ${property[1]}`}
      <input value={property[0]} />
      :
      <input value={property[1]} />
    </div>
  )
})

const StateObject = withStyles(theme => ({
  sizeSmall: {
    padding: '0px 0px',
    minWidth: 0,
    minHeight: 0,
    fontSize: theme.typography.pxToRem(13),
  },
}))(
  mrInjectAll(function StateObject({state, stateObject, classes: c}) {
    return (
      <F>
        <div className={cn('lh-copy')}>
          Type: Object ({_.compose(_.length, _.keys)(
            stateObject.props,
          )})
        </div>
        <div className={cn('flex items-center')}>
          <Button
            onClick={e => stateObject.add()}
            className={cn('mr1 lh-copy link ph1')}
            // variant={'contained'}
            disableFocusRipple={true}
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
            _.toPairs(stateObject.props),
          )}
        </div>
      </F>
    )
  }),
)

const State = mrInjectAll(function({state}) {
  return <StateObject stateObject={state.root} />
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
