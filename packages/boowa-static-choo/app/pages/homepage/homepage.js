var html = require('choo/html')
var raw = require('choo/html/raw')
var Nanocomponent = require('nanocomponent')
var css = require('sheetify')
var fs = require('fs')
var articleList = require('../../tmpl/articleList.js')
var header = require('../../tmpl/header.js')

css('./homepage.scss')

class Component extends Nanocomponent {
  constructor () {
    super()
  }

  createElement (state, emit) {
    return html`
      <pre class='language-javascript homepage-pre'>
        <div class="avatar">
          ${raw(header(state))}
        </div>
        <code class='language-javascript'>
          ${raw(articleList(state))}
        </code>
      </pre>
    `
  }

  update () {
    return false
  }
}
module.exports = new Component()
