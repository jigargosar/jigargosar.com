const log = require('nanologger')('el:CodeMirrorEditor')
const CodeMirror = require('codemirror')
const Component = require('nanocomponent')
const html = require('choo/html')
const css = require('sheetify')
// require('codemirror/addon/lint/lint')
// require('codemirror/mode/gfm/gfm')
// require('codemirror/mode/markdown/markdown')
// require('codemirror/mode/yaml-frontmatter/yaml-frontmatter')
require('codemirror/mode/yaml/yaml')
window.jsyaml = require('js-yaml')
require('codemirror/addon/lint/lint')
require('codemirror/addon/lint/yaml-lint')
css('codemirror/lib/codemirror.css')
css('codemirror/addon/lint/lint.css')
css('codemirror/theme/blackboard.css')

class CodeMirrorEditor extends Component {
  constructor() {
    super(...arguments)
    this._onChange = null
    this._data = ''
  }

  load() {
    this._cm = CodeMirror.fromTextArea(this.element.firstChild, {
      lineNumbers: true,
      // theme: 'default',
      theme: 'blackboard',
      mode: 'yaml',
      gutters: ['CodeMirror-lint-markers'],
      lint: true,
    })
    this._cm.setSize(null, 200)
    this._cm.on('changes', () => {
      if (this._onChange) {
        const value = this._cm.getDoc().getValue()
        this._data = value
        this._onChange(value)
      }
    })
  }

  createElement(_data, _onChange) {    
    Object.assign(this, {_data, _onChange})
    return html`
      <div>
        <textarea 
          name="cm" 
          id="" 
          cols="30" 
          rows="10">${this._data}</textarea>
        </div>`
  }

  update(data, onChange) {
    if (this._onChange !== onChange) {
      this._onChange = onChange
    }
    if (this._data !== data) {
      this._cm.getDoc().setValue(data)
    }
    return false
  }
}

module.exports = {CodeMirrorEditor}
