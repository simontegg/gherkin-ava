const avaCukes = require('../')
const path = require('path')
const fs = require('fs')

const featureFile = path.join(__dirname, 'bottles.feature')
const libraryFile = path.join(__dirname, 'steps.js')

avaCukes(libraryFile, featureFile, (err, featureSpec) => {
  fs.writeFile(path.join(__dirname, 'bottles-spec.js'), featureSpec, err => {
    console.log(featureSpec)
    if (err) throw new Error('didnt write')
  })
})
