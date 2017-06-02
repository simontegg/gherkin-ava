// main
const acorn = require('acorn')
const recast = require('recast')
const escodegen = require('escodegen')
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
const escodegenOptions = {
  format: { indent: { style: '  ' }, semicolons: false }
}
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

  const libraryAst = acorn.parse(libraryFile, { ecmaVersion: 8 })

  traverse(libraryAst).forEach(function (x) {
    // add top level module requires
    if (isVariableDeclaration(this, x)) declarations.push(x)

    // create library
    if (isKeywordBlock(this, x, keywords)) {
      const keyword = this.node.callee.name
      const [regex, node] = this.node.arguments
      library[keyword].push({ re: RegExp(regex.value, 'g'), node })
    }
  })

  const scenarioOptions = []

  const scenarioBodies = children
    .map(({ name, steps }, i) => {
      const options = { name, assertionCount: 0 }

      const scenarioBody = steps
        .reduce((acc, step, i, steps) => {
          const keyword = step.keyword.trim()
          const { text } = step
          const librarySet = library[keyword]
          const match = librarySet ? getMatch(librarySet, text) : null

          if (match) {
            const params = match.node.params.map(param => param.name)
            let isCallback = false

            // evaluate
            match.re.lastIndex = 0 // reset regex
            const vars = params.length > 0 ? getVariables(match.re, text) : []

            traverse(match.node.body).forEach(function (x) {
              if (this.node) {
                const { name } = this.node

                if (params.length > 0) {
                  const index = params.indexOf(name)

                  if (index > -1) {
                    // replace params with actual value
                    this.update({ type: 'Literal', value: vars[index] })
                  }
                }

                if (isAssertion(name, this.parent)) {
                  options.assertionCount++
                }

                if (name === 'next') {
                  isCallback = true
                  options.callback = true
                }

                if (name === 'async') {
                  options.async = true
                }
              }
            })

            acc.push({ node: getNode(match), isCallback })
            return acc
          } else {
            throw new Error('no matching step!')
          }
        }, [])
        .concat({ node: tEndAst(), isCallback: false })

      scenarioOptions.push(options)

      return scenarioBody
    })
    .map(scenarioAst)

  const ast = assembleAst(declarations, name, scenarioOptions, scenarioBodies)

  return escodegen.generate(ast, escodegenOptions)
}

function assembleAst (
  declarations,
  featureName,
  scenarioOptions,
  scenarioBodies
) {
  return getProgramExpression(
    [avaSpecDeclaration].concat(declarations).concat(
      getFeatureExpression(
        featureName,
        scenarioBodies.map((scenarioBody, i) => {
          return getScenarioExpression(scenarioOptions[i], scenarioBody)
        })
      )
    )
  )
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
