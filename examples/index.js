const avaCukes = require('../')
const path = require('path')
const fs = require('fs')

const libraryFilePath = path.join(__dirname, '/bottles/steps.js')
const featureFilePath = path.join(__dirname, '/bottles/bottles.feature')

fs.readFile(libraryFilePath, 'utf8', (err, libraryFile) => {
  fs.readFile(featureFilePath, 'utf8', (err, featureFile) => {
    const featureSpec = avaCukes(libraryFile, featureFile)

    fs.writeFile(
      path.join(__dirname, '/bottles/bottles-spec.js'),
      featureSpec,
      err => {
        if (err) throw new Error('didnt write')
      }
    )
  })
})
