# ipro497

A JavaScript SDK and application for accessing the Igor Gateway API.

## Setup

```bash
npm install
cd javascript-client
npm install
npm link
cd ..
npm link javascript-client
npm run build
npm start
```

## Server

The server is basically a proxy for the API server (hardcoded IP) that will spoof a valid CORS preflight response because the Igor Gateway API is not configured properly for CORS. The proxy server runs by default at `localhost:8080` and should work even from the `file://` protocol (i.e. you can just open `index.html` in your browser to try it out).
