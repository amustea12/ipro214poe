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
  
  // TODO: See link for building a static file server.
  // http://adrianmejia.com/blog/2016/08/24/Building-a-Node-js-static-file-server-files-over-HTTP-using-ES6/
  
  // TODO: Then, only proxy if the client is requesting "/api*"
  // Proxy by default
  proxy.web(req, res, {
    // target: 'http://192.168.10.2'
    target: 'http://192.168.1.19'
  })
})

server.listen(8080)
