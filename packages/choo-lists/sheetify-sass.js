const sass = require('node-sass')
const R = require('ramda')

module.exports = sheetifySass

function sheetifySass(filePath, fileContentBuffer, options, done) {
  const sassOpts = R.merge(
    {
      file: filePath,
      data: fileContentBuffer,
      indentedSyntax: /\.sass$/i.test(filePath),
      includePaths: [__dirname + '/node_modules'],
    },
    options,
  )

  sass.render(sassOpts, function(err, res) {
    if (err) return done(err)
    done(null, {
      css: String(res.css),
      files: res.includedFiles,
    })
  })
}
