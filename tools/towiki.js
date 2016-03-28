
var es = require('./lib/endpoints.json')

var out = []
out.push(['', 'API resource', 'Lib function name', 'HTTP method', ''].join('|'))
out.push('|---|---|---|')
Object.keys(es.methods).forEach(function(e){
  var m = es.methods[e]
  Object.keys(m).forEach(function(r){
    out.push(['', e + r, m[r].resource, m[r].method.toUpperCase(), ''].join('|'))
  })
})

Object.keys(es.authentication).forEach(function(e){
 out.push(['', e, es.authentication[e], 'POST', ''].join('|'))
})

console.log(out.join('\n'))
