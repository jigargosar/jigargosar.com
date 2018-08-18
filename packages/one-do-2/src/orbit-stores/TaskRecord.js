import {fWord} from '../lib/fake'

class ST {
  constructor() {
    this.a = 1
    this.b = 2
  }
}

export function TaskRecord() {
  return {
    type: 'task',
    attributes: {
      title: fWord(),
      createdAt: Date.now(),
    },
  }
}
