// main
const acorn = require('acorn')
const escodegen = require('escodegen')
const fs = require('fs')
const Gherkin = require('gherkin')
const isArray = require('is-array')
const pretty = require('prettyjson')
const traverse = require('traverse')

// modules
const getProgramExpression = require('./get-program-expression')
const getFeatureExpression = require('./get-feature-expression')
const getScenarioExpression = require('./get-scenario-expression')
const scenarioAst = require('./scenario-ast')

// constants
const avaSpecDeclaration = require('./ava-spec-declaration')
const escodegenOptions = { format: { semicolons: false } }
const keywords = ['Given', 'When', 'Then']
const library = {
  Given: [],
  When: [],
  Then: []
}

// initialization
const libraryStream = fs.createReadStream(__dirname + '/steps.js')
const parser = new Gherkin.Parser(new Gherkin.AstBuilder())
const matcher = new Gherkin.TokenMatcher()

// let output = "const { feature } = require('ava-spec') \n" // use ast

libraryStream.on('data', data => {
  const featureStream = fs.createReadStream(
    __dirname + '/bottles.feature',
    'utf8'
  )
  const libraryAst = acorn.parse(data.toString())
  const declarations = []

  traverse(libraryAst).forEach(function (x) {
    // add top level module and variable requires
    if (this.level === 2 && x.type === 'VariableDeclaration') {
      declarations.push(x)
    }

    // create library
    if (
      this.level === 3 &&
      x &&
      x.type === 'CallExpression' &&
      keywords.includes(this.node.callee.name)
    ) {
      const keyword = this.node.callee.name
      const [regex, node] = this.node.arguments
      library[keyword].push({ re: RegExp(regex.value, 'g'), node })
    }
  })

  featureStream.on('data', file => {
    const scanner = new Gherkin.TokenScanner(file, matcher)
    const { name, children } = parser.parse(scanner).feature
    const scenarioNames = []

    const scenarios = children.map(function ({ name, steps }, i) {
      scenarioNames.push(name)

      return steps.reduce(function (acc, step, i, steps) {
        const keyword = step.keyword.trim()
        const { text } = step

        if (library[keyword]) {
          // assume 1 match
          const match = library[keyword].find(libraryStep =>
            libraryStep.re.test(text)
          )

          if (!match) throw new Error('no matching step')

          const params = match.node.params.map(param => param.name)
          let isAsync = false

          // synchronous, no params
          if (params.length === 0) {
            acc.push(match.node.body)
            return acc
          }

          // evaluate
          if (params.length > 0) {
            match.re.lastIndex = 0 // reset regex
            const vars = getVariables(match.re, text)

            // replace params with actual value
            traverse(match.node.body).forEach(function (x) {
              const index = this.node ? params.indexOf(this.node.name) : -1

              if (index > -1) {
                this.update({ type: 'Literal', value: vars[index] })
              }
              if (this.node && this.node.name === 'next') isAsync = true
            })

            const node = getNode(match)
            acc.push({ node, isAsync })
            return acc
          }
        }
      }, [])
    })

    const scenarioBodies = scenarios.map(scenarioAst)

    const ast = assembleAst(name, scenarioNames, scenarioBodies)

    console.log(escodegen.generate(ast))
  })
})

function assembleAst (featureName, scenarioNames, scenarioBodies) {
  return getProgramExpression([
    avaSpecDeclaration,
    getFeatureExpression(
      featureName,
      scenarioBodies.map((scenarioBody, i) => {
        return getScenarioExpression(scenarioNames[i], scenarioBody)
      })
    )
  ])
}

function getNode (match) {
  return match.node.body.body[0]
}

function getBody (node) {
  return escodegen.generate(node, escodegenOptions).replace(/^{|}$/g, '')
}

function getVariables (regex, text) {
  return regex.exec(text).slice(1).map(v => {
    const coerced = v.includes('.') ? parseFloat(v) : parseInt(v, 10)
    if (!isNaN(coerced)) return coerced
    return v
  })
}
