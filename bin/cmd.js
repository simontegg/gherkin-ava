#!/usr/bin/env node
const avaCukes = require('../')
const argv = require('yargs').argv

const featureFile = argv._[0]
const libraryFile = argv._[1]
const writeFile = argv.o

console.log(featureFile, libraryFile, writeFile)
