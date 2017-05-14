// main
const acorn = require('acorn')
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

function avaCukes (libraryFilePath, featureFilePath, callback) {
  const parser = new Gherkin.Parser(new Gherkin.AstBuilder())
  const matcher = new Gherkin.TokenMatcher()
  const declarations = []
  const library = {
    Given: [],
    When: [],
    Then: []
  }

  fs.readFile(libraryFilePath, 'utf8', (err, libraryFile) => {
    if (err) callback(err)

    const libraryAst = acorn.parse(libraryFile)

    traverse(libraryAst).forEach(function (x) {
      // add top level module and variable requires
      if (isVariableDeclaration(this, x)) declarations.push(x)

      // create library
      if (isKeywordBlock(this, x, keywords)) {
        const keyword = this.node.callee.name
        const [regex, node] = this.node.arguments
        library[keyword].push({ re: RegExp(regex.value, 'g'), node })
      }
    })

    fs.readFile(featureFilePath, 'utf8', (err, featureFile) => {
      if (err) callback(err)

      const scanner = new Gherkin.TokenScanner(featureFile, matcher)
      const { name, children } = parser.parse(scanner).feature
      const scenarioNames = []

      const scenarioBodies = children
        .map(({ name, steps }, i) => {
          scenarioNames.push(name)

          return steps
            .reduce((acc, step, i, steps) => {
              const keyword = step.keyword.trim()
              const { text } = step

              if (library[keyword]) {
                // assume 1 match
                const match = library[keyword].find(step => step.re.test(text))
                if (!match) throw new Error('no matching step')

                const params = match.node.params.map(param => param.name)
                let isAsync = false

                // no params
                if (params.length === 0) {
                  traverse(match.node.body).forEach(function (x) {
                    if (this.node && this.node.name === 'next') isAsync = true
                  })
                  acc.push({ node: getBody(match), isAsync })
                  return acc
                }

                // evaluate
                if (params.length > 0) {
                  match.re.lastIndex = 0 // reset regex
                  const vars = getVariables(match.re, text)

                  // replace params with actual value
                  traverse(match.node.body).forEach(function (x) {
                    const index = this.node
                      ? params.indexOf(this.node.name)
                      : -1

                    if (index > -1) {
                      this.update({ type: 'Literal', value: vars[index] })
                    }

                    if (this.node && this.node.name === 'next') isAsync = true
                  })

                  acc.push({ node: getNode(match), isAsync })
                  return acc
                }
              }
            }, [])
            .concat({ node: tEndAst(), isAsync: false })
        })
        .map(scenarioAst)

      const ast = assembleAst(declarations, name, scenarioNames, scenarioBodies)

      callback(null, escodegen.generate(ast, escodegenOptions))
    })
  })
}

function assembleAst (declarations, featureName, scenarioNames, scenarioBodies) {
  return getProgramExpression(
    [avaSpecDeclaration].concat(declarations).concat(
      getFeatureExpression(
        featureName,
        scenarioBodies.map((scenarioBody, i) => {
          return getScenarioExpression(scenarioNames[i], scenarioBody)
        })
      )
    )
  )
}

function getNode (match) {
  return match.node.body.body[0]
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
