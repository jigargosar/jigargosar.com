import system from 'system-components'
import {TextArea} from '../little-rebass'

export const Input = system({
  is: TextArea,
  flex: 1,
  colors: 'selected',
  css: {resize: 'none'},
  textStyle: null,
})
