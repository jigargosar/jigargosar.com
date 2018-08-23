import f from 'faker'

export const randomWord = () => f.random.word()
export const randomBool = () => f.random.boolean()
export const randomNumber = f.random.number
export const randomTS = () =>
  Date.now() + randomNumber({min: -10000, max: 10000})
