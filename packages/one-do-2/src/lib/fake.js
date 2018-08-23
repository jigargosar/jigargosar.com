import f from 'faker'

export const randomWord = () => f.random.word()
export const randomBool = () => f.random.boolean()
export const randomNumber = f.random.number
export const randomNumberRange = num => randomNumber({min: -num, max: num})
export const randomTS = () =>
  Date.now() + randomNumberRange(7 * 24 * 60 * 60 * 1000)
