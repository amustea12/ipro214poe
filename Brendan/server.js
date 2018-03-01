const http = require('http')
const httpProxy = require('http-proxy')

const proxy = httpProxy.createProxyServer()

const server = http.createServer((req, res) => {
  // Fake the CORS preflight response...
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Content-Length': 0,
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': req.headers['origin'],
      'Access-Control-Allow-Methods': req.headers['access-control-request-method'],
      'Access-Control-Allow-Headers': req.headers['access-control-request-headers'],
      'Access-Control-Max-Age': -1
    })
    res.end()
    return
  }

  // Proxy by default
  proxy.web(req, res, {
    target: 'http://192.168.10.2'
  })
})

server.listen(8080)
