const traverse = require('traverse')
const acorn = require('acorn')
const walk = require('acorn/dist/walk')
const { dropRight, last } = require('lodash')
const pretty = require('prettyjson')
const isArray = require('is-array')

module.exports = function (scenario) {
  let insertPath
  let asyncBody
  const ast = []

  scenario.forEach(function (step, i) {
    const prevStep = scenario[i - 1]
    const nextStep = scenario[i + 1]

    if (step.isCallback && nextStep) {
      insertPath = embedStep(step.node, nextStep.node)
      callbackBody = scenario[i].node
      ast.push(step.node)
    } else if (prevStep && !prevStep.isCallback && insertPath) {
      const body = traverse(callbackBody).get(insertPath)
      if (body) {
        body.push(step.node)
        traverse(callbackBody).set(insertPath, body)
      }
    } else if (!insertPath) {
      ast.push(step.node)
    }
  })

  return ast
}

function embedStep (node, nextNode) {
  let path

  traverse(node).forEach(function (x) {
    if (x && x.name === 'next') {
      this.parent.update(nextNode, true)
      path = getParentArrayPath(this)
    }
  })

  return path
}

function getParentArrayPath (node) {
  if (!node) return null
  if (node.parent && isArray(node.parent.node)) return node.parent.path
  return getParentArrayPath(node.parent)
}
