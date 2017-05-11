#!/usr/bin/env node
const avaCukes = require('../')
const argv = require('yargs').argv
const fs = require('fs')
const path = require('path')

const libraryFilePath = argv._[1]
const featureFilePath = argv._[0]

if (!libraryFilePath) throw new Error('provide a library of step functions')
if (!featureFilePath) throw new Error('provide a feature file ')

const writeFilePath = argv.o

console.log(libraryFilePath, featureFilePath)

avaCukes(
  path.join(__dirname, libraryFilePath),
  path.join(__dirname, featureFilePath),
  (err, testFile) => {
    if (writeFilePath) {
      return fs.write(writeFilePath, testFile, err => {
        if (err) throw new Error('could not write')
      })
    }

    process.stdout.write(testFile)
  }
)
