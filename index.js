const acorn = require('acorn')
const fs = require('fs')
const isArray = require('is-array')
const pretty = require('prettyjson')
const escodegen = require('escodegen')
const traverse = require('traverse')
const Gherkin = require('gherkin')
const escodegenOptions = { format: { semicolons: false } }

const featureFileStream = fs.createReadStream(__dirname + '/bottles.feature')
const parser = new Gherkin.Parser(new Gherkin.AstBuilder())
const matcher = new Gherkin.TokenMatcher()

const keywords = [ 'Given', 'When', 'Then' ]

const library = {
  Given: [],
  When: [],
  Then: []
}

let output = "const { feature } = require('ava-spec') \n"
let featureDeclaration

const stream = fs.createReadStream(__dirname + '/steps.js')
stream.on('data', data => {
  const libraryAst = acorn.parse(data.toString())
  console.log(pretty.render(libraryAst)) 

  traverse(libraryAst).forEach(function (x) {

    // add top level module and variable requires
    if (this.level === 2 && x.type === 'VariableDeclaration') {
      output =  output + '\n' + escodegen.generate(this.node, escodegenOptions)
    }

    // create library
    if (this.level === 3 && x && x.type === 'CallExpression' && keywords.includes(this.node.callee.name)) {
      const keyword = this.node.callee.name
      const [ arg0, arg1 ] = this.node.arguments
      library[keyword].push({ re: RegExp(arg0.value, 'g'), node: arg1 })
    }
  })

  console.log(library)
  
  const featureFileStream = fs.createReadStream(__dirname + '/bottles.feature', 'utf8')
  featureFileStream.on('data', file => {
    const scanner = new Gherkin.TokenScanner(file, matcher)
    const { name, children } = parser.parse(scanner).feature
    featureDeclaration = getFeatureDeclaration(name)
    const scenarioDeclarations = []

    const scenarios = children.map(function ({ name, steps }, i) {
      scenarioDeclarations.push(getScenarioDeclaration(name))

      return steps.reduce(function (acc, step, i, steps) {
        const keyword = step.keyword.trim()
        const { text } = step

        if (library[keyword]) {
          // assume 1 match
          const match = library[keyword].find(libraryStep => libraryStep.re.test(text))
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
            console.log(params)
            match.re.lastIndex = 0 // reset regex
            const vars = getVariables(match.re, text)

            // replace params with actual value
            traverse(match.node.body).forEach(function (x) {
              const index = this.node ? params.indexOf(this.node.name) : -1

              if (index > -1) {
                this.update({
                  type: 'Literal',
                  value: vars[index]
                })
              }

              if (this.node && this.node.name === 'next') isAsync = true
            })

            console.log('body', pretty.render(match.node.body))

            acc.push({ node: match.node.body, isAsync })
            return acc
          }
        }
     }, [])

   })

    console.log(scenarios)


  const body = scenarios.map(function (scenario) {
   const steps = scenario.reverse().reduce(function (body, step, i, steps) {
    const nextStep = steps[i + 1]

    if (nextStep && nextStep.isAsync) {
      recurseStep(nextStep, step)
      return body
    }

    body.unshift(step.node.body)
    return body
   }, [])

    return steps
  })

  
  const ast = { type: 'BlockStatement', body }

  console.log('output', pretty.render(body))
  body[0].forEach(function (step, i) {
    console.log(step)
    console.log(escodegen.generate(step[0], escodegenOptions))

  })


  



})

})

function recurseStep (nextStep, step) {
  console.log(step.node)
  traverse(nextStep).forEach(function (x) {
    if (x && x.name === 'next') {
     console.log(x)
     this.parent.update(step.node)
    }
  })
}

function getFeatureDeclaration (name) {
  return function (body) {
    return `feature('${name}', scenario => {\n  ${body}\n})`
  }
}

function getScenarioDeclaration (name) {
  return function (body) {
    return `scenario.cb('${name}', t => {\n  ${body}\n})`
  }
}

function getBody (node) {
  return escodegen.generate(node, escodegenOptions).replace(/^{|}$/g, '')
}

function getVariables(regex, text) {
  return regex.exec(text).slice(1).map(v => {
    const coerced = v.includes('.') ? parseFloat(v) : parseInt(v, 10)
    if (!isNaN(coerced)) return coerced
    return v
  })
}





