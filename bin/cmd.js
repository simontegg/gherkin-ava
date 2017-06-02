#!/usr/bin/env node
const avaCukes = require('../')
const argv = require('yargs').argv
const fs = require('fs')
const Writable = require('stream').Writable
const meow = require('meow')
const path = require('path')

const libraryFilePath = argv._[0]
const featureFilePath = argv._[1]

if (!libraryFilePath) throw new Error('provide a library of step functions')
if (!featureFilePath) throw new Error('provide a feature file ')

const writeFilePath = argv.o

fs.readFile(
  path.resolve(__dirname, '../', libraryFilePath),
  'utf8',
  (err, libraryFile) => {
    fs.readFile(
      path.resolve(__dirname, '../', featureFilePath),
      'utf8',
      (err, featureFile) => {
        const testFile = avaCukes(libraryFile, featureFile)

        if (writeFilePath) {
          return fs.write(writeFilePath, testFile, err => {
            if (err) process.exit(1)
          })
        }

        process.stdout.write(testFile)
        process.exit(0)
      }
    )
  }
)
