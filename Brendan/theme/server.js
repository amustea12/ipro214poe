const http = require('http')
const httpProxy = require('http-proxy')
const url = require('url')
const fs = require('fs')
const path = require('path')
const mime = require('mime-types')

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

  const parsedUrl = url.parse(req.url)

  // Proxy API requests to the Gateway API
  if (parsedUrl.path.match(/^\/admin\/api/)) {
    console.log(`Proxying ${req.method} ${req.url} to Gateway`)
    proxy.web(req, res, {
      target: 'http://192.168.10.2' // replace with Gateway IP
    })
    return
  }

  // Serve filesystem otherwise
  let pathname = '.'
  pathname += parsedUrl.pathname

  console.log(`${req.method} ${req.url}`)

  fs.exists(pathname, (exists) => {
    if (!exists) {
      res.statusCode = 404
      res.end(`Resource ${pathname} not found!`)
      return
    }

    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/index.html'
    }

    fs.readFile(pathname, (err, data) => {
      if (err) {
        res.statusCode = 500
        res.end('Internal server error.')
      } else {
        res.setHeader('Content-Type', mime.lookup(pathname) || 'text/plain')
        res.end(data)
      }
    })
  })
})

server.listen(8080, () => {
  console.log('Listening on port 8080...')
})
