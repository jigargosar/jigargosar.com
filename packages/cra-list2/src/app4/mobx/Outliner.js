import {createObservableObject} from './utils'

export function Outliner() {
  const out = createObservableObject({
    props: {
      get lines() {
        return [
          {
            id: '1',
            text: 'line 1 c',
            lines: [],
          },
          {
            id: '2',
            text: 'line 2',
            lines: [
              {
                id: '1',
                text: 'line 2-1',
                lines: [],
              },
              {
                id: '2',
                text: 'line 2-2',
                lines: [],
              },
            ],
          },
        ]
      },
    },
    actions: {},
    name: 'Outliner',
  })
  return out
}
