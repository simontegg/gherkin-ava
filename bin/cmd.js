#!/usr/bin/env node
const avaCukes = require('../')
const argv = require('yargs').argv
const fs = require('fs')
const path = require('path')

const libraryFile = argv._[1]
const featureFile = argv._[0]

if (!libraryFile) throw new Error('provide a library of step functions')
if (!featureFile) throw new Error('provide a feature file ')

const writeFile = argv.o

avaCukes(
  path.join(__dirname, libraryFile),
  path.join(__dirname, featureFile),
  (err, testFile) => {}
)

console.log(featureFile, libraryFile, writeFile)
