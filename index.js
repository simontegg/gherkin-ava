const acorn = require('acorn')
const fs = require('fs')
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
  
  const featureFileStream = fs.createReadStream(__dirname + '/bottles.feature', 'utf8')
  featureFileStream.on('data', file => {
    const scanner = new Gherkin.TokenScanner(file, matcher)
    const { name, children } = parser.parse(scanner).feature
    featureDeclaration = getFeatureDeclaration(name)
    const scenarioDeclarations = []
    const scenarios = []

    // scenarios
    children.forEach(function ({ name, steps }, i) {
      scenarioDeclarations.push(getScenarioDeclaration(name))
      scenarios.push([])

      steps.forEach(function (step) {
        const keyword = step.keyword.trim()
        const { text } = step

        if (library[keyword]) {
          // assume 1 match
          const match = library[keyword].find(libraryStep => libraryStep.re.test(text))

          if (match) {
            const params = match.node.params.map(param => param.name)
            let isAsync = false

            // synchronous no params
            if (params.length === 0) {
              scenarios[i].push(getBody(match.node.body)) 
            }

            // evaluate
            if (params.length > 0) {
              console.log(params)
              match.re.lastIndex = 0 // reset regex
              const vars = match.re.exec(text).slice(1).map(v => {
                const coerced = v.includes('.') ? parseFloat(v) : parseInt(v, 10)
                if (!isNaN(coerced)) return coerced
                return v
              })

              // replace params with actual value
              traverse(match.node.body).forEach(function (x) {
                const index = this.node ? params.indexOf(this.node.name) : -1

                if (index > -1) {
                  console.log(vars[index])
                  this.update({
                   type: 'Literal',
                   value: vars[index]
                  })
                }

                if (this.node && this.node.name === 'next') isAsync = true
              })

              const body = getBody(match.node.body)

              if (isAsync) {
                const parts = body.split('next()') 
                const generateAsync = next => {
                  parts.splice(1, 0, next)
                  return parts.slice(0).join('')
                } 
                scenarios[i].push(generateAsync)   
              } else {
                scenarios[i].push(body) 
              }

              console.log(isAsync)
              
            }
          } else {
            // error no matching library step
          }


        }

        
      })
      
    })
  
    
  
  })





})

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





