var fs = require('fs')
var rightDir = fs.readFileSync('./right-dir').toString()
var errorDir = fs.readFileSync('./error-dir').toString()

// console.log(JSON.stringify(text))

function parseLine(line) {
  var reg = /^(\s*)([^\s]+)$/
  var $$ = reg.exec(line)
  if (!$$[1]) {
    return {
      pad: 0,
      value: line
    }
  } else {
    return {
      pad: $$[1].length,
      value: $$[2]
    }
  }
}

function dirParser(text) {
  var lines = text.split('\n')
  var stack = []
  var result = []

  var currentIndent = 0
  var indentTokenCaches = {}
  lines.forEach(line => {
    var currentLine = parseLine(line)
    if (currentLine.pad === currentIndent) {
      result.push(currentLine)
    } else if (currentLine.pad > currentIndent) {
      currentIndent = currentLine.pad
      stack.push(currentLine)
    } else if (indentTokenCaches[currentLine.pad]) {
      let token = stack.pop()
      while (token && token.pad > currentLine.pad) {
        currentIndent = token.pad
        result.push(token)
        token = stack.pop()
      }

      if (token) {
        stack.push(token)
        stack.push(currentLine)
      } else {
        result.push(currentLine)
      }
    } else {
      throw new Error(`error indent: ${line}`)
    }
    indentTokenCaches[currentLine.pad] = true
  })

  return result
}

console.log(dirParser(rightDir))

console.log(dirParser(errorDir))