const traverse = require('traverse')

module.exports = function (scenario) {
  return scenario.reverse().reduce(function (body, step, i, steps) {
    const nextStep = steps[i + 1]

    if (nextStep && nextStep.isAsync) {
      embedStep(nextStep, step.node)
      return body
    }

    body.unshift(step.node)
    return body
  }, [])
}

function embedStep (nextStep, node) {
  traverse(nextStep).forEach(function (x) {
    if (x && x.name === 'next') this.parent.update(node)
  })
}
