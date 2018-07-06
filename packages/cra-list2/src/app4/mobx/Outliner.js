export function Outliner() {
  return {
    root: {
      id: '0',
      text: 'Home',
      lines: [
        {
          id: '1',
          text: 'line 1',
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
      ],
    },
  }
}
