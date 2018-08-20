import {fWord} from '../lib/fake'

export function TaskRecord() {
  return {
    type: 'task',
    attributes: {
      title: fWord(),
      createdAt: Date.now(),
      isDone: false,
      sortIdx: 0,
    },
  }
}
