// main
const recast = require('recast')
const fs = require('fs')
const Gherkin = require('gherkin')
const isArray = require('is-array')
const path = require('path')
const traverse = require('traverse')
const pretty = require('prettyjson')

// modules
const getProgramExpression = require('./get-program-expression')
const getFeatureExpression = require('./get-feature-expression')
const getScenarioExpression = require('./get-scenario-expression')
const scenarioAst = require('./scenario-ast')
const tEndAst = require('./t-end-ast')

// constants
const avaSpecDeclaration = require('./ava-spec-declaration')
const keywords = ['Given', 'When', 'Then']

module.exports = avaCukes

function avaCukes (libraryFile, featureFile) {
  const parser = new Gherkin.Parser(new Gherkin.AstBuilder())
  const matcher = new Gherkin.TokenMatcher()
  const scanner = new Gherkin.TokenScanner(featureFile, matcher)
  const { name, children } = parser.parse(scanner).feature
  const declarations = []
  const library = {
    Given: [],
    When: [],
    Then: []
  }

  const ast = recast.parse(libraryFile)

  traverse(ast).forEach(function (x) {

  })

  const result = [] 

  ast.program.body.forEach(function (n) {
    if (n.type === 'ExpressionStatement')

    console.log(n)
  })


}

const libraryFile = fs.readFileSync(__dirname + '/examples/async-await/steps.js', 'utf8')
const featureFile = fs.readFileSync(__dirname + '/examples/async-await/bottles.feature', 'utf8')

avaCukes(libraryFile, featureFile)

function isGherkin (statement) {
  return statement.type === 'ExpressionStatement'
    && 

}


function getNode (match) {
  return match.node.body.body[0]
}

function getMatch (librarySet, text) {
  return librarySet.find(step => step.re.test(text))
}

function isAssertion (name, parent) {
  return (
    name === 't' &&
    ['end', 'context', 'plan'].indexOf(parent.node.property.name) === -1
  )
}

function getVariables (regex, text) {
  return regex.exec(text).slice(1).map(v => {
    const coerced = v.includes('.') ? parseFloat(v) : parseInt(v, 10)
    if (!isNaN(coerced)) return coerced
    return v
  })
}

function isVariableDeclaration (context, node) {
  return context.level === 2 && node.type === 'VariableDeclaration'
}

function isKeywordBlock (context, node, keywords) {
  return (
    context.level === 3 &&
    node &&
    node.type === 'CallExpression' &&
    keywords.includes(context.node.callee.name)
  )
}
