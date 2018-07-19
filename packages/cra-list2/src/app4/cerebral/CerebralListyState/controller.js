import {createAppController} from '../../little-cerebral'
import {createRootModule} from './app'

export const controller = createAppController(createRootModule(), {
  stateChanges: {
    // currentDashboardId: 'kOYniDg34h9xp3cI1xzN1',
    // nullableSelectedItemId: 'OEqPlt2OOepfvjgTOSJX0',
  },
})
