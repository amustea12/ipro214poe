(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
const GatewaySoftwareApi = require('gateway_software_api')
window.GatewaySoftwareApi = window.GatewaySoftwareApi || GatewaySoftwareApi

},{"gateway_software_api":33}],2:[function(require,module,exports){

/**
 * Expose `Emitter`.
 */

if (typeof module !== 'undefined') {
  module.exports = Emitter;
}

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks['$' + event] = this._callbacks['$' + event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  function on() {
    this.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks['$' + event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks['$' + event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks['$' + event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks['$' + event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],3:[function(require,module,exports){
/**
 * Root reference for iframes.
 */

var root;
if (typeof window !== 'undefined') { // Browser window
  root = window;
} else if (typeof self !== 'undefined') { // Web Worker
  root = self;
} else { // Other environments
  console.warn("Using browser-only version of superagent in non-browser environment");
  root = this;
}

var Emitter = require('component-emitter');
var RequestBase = require('./request-base');
var isObject = require('./is-object');
var isFunction = require('./is-function');
var ResponseBase = require('./response-base');
var shouldRetry = require('./should-retry');

/**
 * Noop.
 */

function noop(){};

/**
 * Expose `request`.
 */

var request = exports = module.exports = function(method, url) {
  // callback
  if ('function' == typeof url) {
    return new exports.Request('GET', method).end(url);
  }

  // url first
  if (1 == arguments.length) {
    return new exports.Request('GET', method);
  }

  return new exports.Request(method, url);
}

exports.Request = Request;

/**
 * Determine XHR.
 */

request.getXHR = function () {
  if (root.XMLHttpRequest
      && (!root.location || 'file:' != root.location.protocol
          || !root.ActiveXObject)) {
    return new XMLHttpRequest;
  } else {
    try { return new ActiveXObject('Microsoft.XMLHTTP'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.6.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP.3.0'); } catch(e) {}
    try { return new ActiveXObject('Msxml2.XMLHTTP'); } catch(e) {}
  }
  throw Error("Browser-only verison of superagent could not find XHR");
};

/**
 * Removes leading and trailing whitespace, added to support IE.
 *
 * @param {String} s
 * @return {String}
 * @api private
 */

var trim = ''.trim
  ? function(s) { return s.trim(); }
  : function(s) { return s.replace(/(^\s*|\s*$)/g, ''); };

/**
 * Serialize the given `obj`.
 *
 * @param {Object} obj
 * @return {String}
 * @api private
 */

function serialize(obj) {
  if (!isObject(obj)) return obj;
  var pairs = [];
  for (var key in obj) {
    pushEncodedKeyValuePair(pairs, key, obj[key]);
  }
  return pairs.join('&');
}

/**
 * Helps 'serialize' with serializing arrays.
 * Mutates the pairs array.
 *
 * @param {Array} pairs
 * @param {String} key
 * @param {Mixed} val
 */

function pushEncodedKeyValuePair(pairs, key, val) {
  if (val != null) {
    if (Array.isArray(val)) {
      val.forEach(function(v) {
        pushEncodedKeyValuePair(pairs, key, v);
      });
    } else if (isObject(val)) {
      for(var subkey in val) {
        pushEncodedKeyValuePair(pairs, key + '[' + subkey + ']', val[subkey]);
      }
    } else {
      pairs.push(encodeURIComponent(key)
        + '=' + encodeURIComponent(val));
    }
  } else if (val === null) {
    pairs.push(encodeURIComponent(key));
  }
}

/**
 * Expose serialization method.
 */

 request.serializeObject = serialize;

 /**
  * Parse the given x-www-form-urlencoded `str`.
  *
  * @param {String} str
  * @return {Object}
  * @api private
  */

function parseString(str) {
  var obj = {};
  var pairs = str.split('&');
  var pair;
  var pos;

  for (var i = 0, len = pairs.length; i < len; ++i) {
    pair = pairs[i];
    pos = pair.indexOf('=');
    if (pos == -1) {
      obj[decodeURIComponent(pair)] = '';
    } else {
      obj[decodeURIComponent(pair.slice(0, pos))] =
        decodeURIComponent(pair.slice(pos + 1));
    }
  }

  return obj;
}

/**
 * Expose parser.
 */

request.parseString = parseString;

/**
 * Default MIME type map.
 *
 *     superagent.types.xml = 'application/xml';
 *
 */

request.types = {
  html: 'text/html',
  json: 'application/json',
  xml: 'application/xml',
  urlencoded: 'application/x-www-form-urlencoded',
  'form': 'application/x-www-form-urlencoded',
  'form-data': 'application/x-www-form-urlencoded'
};

/**
 * Default serialization map.
 *
 *     superagent.serialize['application/xml'] = function(obj){
 *       return 'generated xml here';
 *     };
 *
 */

 request.serialize = {
   'application/x-www-form-urlencoded': serialize,
   'application/json': JSON.stringify
 };

 /**
  * Default parsers.
  *
  *     superagent.parse['application/xml'] = function(str){
  *       return { object parsed from str };
  *     };
  *
  */

request.parse = {
  'application/x-www-form-urlencoded': parseString,
  'application/json': JSON.parse
};

/**
 * Parse the given header `str` into
 * an object containing the mapped fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

function parseHeader(str) {
  var lines = str.split(/\r?\n/);
  var fields = {};
  var index;
  var line;
  var field;
  var val;

  lines.pop(); // trailing CRLF

  for (var i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    field = line.slice(0, index).toLowerCase();
    val = trim(line.slice(index + 1));
    fields[field] = val;
  }

  return fields;
}

/**
 * Check if `mime` is json or has +json structured syntax suffix.
 *
 * @param {String} mime
 * @return {Boolean}
 * @api private
 */

function isJSON(mime) {
  return /[\/+]json\b/.test(mime);
}

/**
 * Initialize a new `Response` with the given `xhr`.
 *
 *  - set flags (.ok, .error, etc)
 *  - parse header
 *
 * Examples:
 *
 *  Aliasing `superagent` as `request` is nice:
 *
 *      request = superagent;
 *
 *  We can use the promise-like API, or pass callbacks:
 *
 *      request.get('/').end(function(res){});
 *      request.get('/', function(res){});
 *
 *  Sending data can be chained:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' })
 *        .end(function(res){});
 *
 *  Or passed to `.send()`:
 *
 *      request
 *        .post('/user')
 *        .send({ name: 'tj' }, function(res){});
 *
 *  Or passed to `.post()`:
 *
 *      request
 *        .post('/user', { name: 'tj' })
 *        .end(function(res){});
 *
 * Or further reduced to a single call for simple cases:
 *
 *      request
 *        .post('/user', { name: 'tj' }, function(res){});
 *
 * @param {XMLHTTPRequest} xhr
 * @param {Object} options
 * @api private
 */

function Response(req) {
  this.req = req;
  this.xhr = this.req.xhr;
  // responseText is accessible only if responseType is '' or 'text' and on older browsers
  this.text = ((this.req.method !='HEAD' && (this.xhr.responseType === '' || this.xhr.responseType === 'text')) || typeof this.xhr.responseType === 'undefined')
     ? this.xhr.responseText
     : null;
  this.statusText = this.req.xhr.statusText;
  var status = this.xhr.status;
  // handle IE9 bug: http://stackoverflow.com/questions/10046972/msie-returns-status-code-of-1223-for-ajax-request
  if (status === 1223) {
      status = 204;
  }
  this._setStatusProperties(status);
  this.header = this.headers = parseHeader(this.xhr.getAllResponseHeaders());
  // getAllResponseHeaders sometimes falsely returns "" for CORS requests, but
  // getResponseHeader still works. so we get content-type even if getting
  // other headers fails.
  this.header['content-type'] = this.xhr.getResponseHeader('content-type');
  this._setHeaderProperties(this.header);

  if (null === this.text && req._responseType) {
    this.body = this.xhr.response;
  } else {
    this.body = this.req.method != 'HEAD'
      ? this._parseBody(this.text ? this.text : this.xhr.response)
      : null;
  }
}

ResponseBase(Response.prototype);

/**
 * Parse the given body `str`.
 *
 * Used for auto-parsing of bodies. Parsers
 * are defined on the `superagent.parse` object.
 *
 * @param {String} str
 * @return {Mixed}
 * @api private
 */

Response.prototype._parseBody = function(str){
  var parse = request.parse[this.type];
  if(this.req._parser) {
    return this.req._parser(this, str);
  }
  if (!parse && isJSON(this.type)) {
    parse = request.parse['application/json'];
  }
  return parse && str && (str.length || str instanceof Object)
    ? parse(str)
    : null;
};

/**
 * Return an `Error` representative of this response.
 *
 * @return {Error}
 * @api public
 */

Response.prototype.toError = function(){
  var req = this.req;
  var method = req.method;
  var url = req.url;

  var msg = 'cannot ' + method + ' ' + url + ' (' + this.status + ')';
  var err = new Error(msg);
  err.status = this.status;
  err.method = method;
  err.url = url;

  return err;
};

/**
 * Expose `Response`.
 */

request.Response = Response;

/**
 * Initialize a new `Request` with the given `method` and `url`.
 *
 * @param {String} method
 * @param {String} url
 * @api public
 */

function Request(method, url) {
  var self = this;
  this._query = this._query || [];
  this.method = method;
  this.url = url;
  this.header = {}; // preserves header name case
  this._header = {}; // coerces header names to lowercase
  this.on('end', function(){
    var err = null;
    var res = null;

    try {
      res = new Response(self);
    } catch(e) {
      err = new Error('Parser is unable to parse the response');
      err.parse = true;
      err.original = e;
      // issue #675: return the raw response if the response parsing fails
      if (self.xhr) {
        // ie9 doesn't have 'response' property
        err.rawResponse = typeof self.xhr.responseType == 'undefined' ? self.xhr.responseText : self.xhr.response;
        // issue #876: return the http status code if the response parsing fails
        err.status = self.xhr.status ? self.xhr.status : null;
        err.statusCode = err.status; // backwards-compat only
      } else {
        err.rawResponse = null;
        err.status = null;
      }

      return self.callback(err);
    }

    self.emit('response', res);

    var new_err;
    try {
      if (!self._isResponseOK(res)) {
        new_err = new Error(res.statusText || 'Unsuccessful HTTP response');
        new_err.original = err;
        new_err.response = res;
        new_err.status = res.status;
      }
    } catch(e) {
      new_err = e; // #985 touching res may cause INVALID_STATE_ERR on old Android
    }

    // #1000 don't catch errors from the callback to avoid double calling it
    if (new_err) {
      self.callback(new_err, res);
    } else {
      self.callback(null, res);
    }
  });
}

/**
 * Mixin `Emitter` and `RequestBase`.
 */

Emitter(Request.prototype);
RequestBase(Request.prototype);

/**
 * Set Content-Type to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.xml = 'application/xml';
 *
 *      request.post('/')
 *        .type('xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 *      request.post('/')
 *        .type('application/xml')
 *        .send(xmlstring)
 *        .end(callback);
 *
 * @param {String} type
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.type = function(type){
  this.set('Content-Type', request.types[type] || type);
  return this;
};

/**
 * Set Accept to `type`, mapping values from `request.types`.
 *
 * Examples:
 *
 *      superagent.types.json = 'application/json';
 *
 *      request.get('/agent')
 *        .accept('json')
 *        .end(callback);
 *
 *      request.get('/agent')
 *        .accept('application/json')
 *        .end(callback);
 *
 * @param {String} accept
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.accept = function(type){
  this.set('Accept', request.types[type] || type);
  return this;
};

/**
 * Set Authorization field value with `user` and `pass`.
 *
 * @param {String} user
 * @param {String} [pass] optional in case of using 'bearer' as type
 * @param {Object} options with 'type' property 'auto', 'basic' or 'bearer' (default 'basic')
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.auth = function(user, pass, options){
  if (typeof pass === 'object' && pass !== null) { // pass is optional and can substitute for options
    options = pass;
  }
  if (!options) {
    options = {
      type: 'function' === typeof btoa ? 'basic' : 'auto',
    }
  }

  switch (options.type) {
    case 'basic':
      this.set('Authorization', 'Basic ' + btoa(user + ':' + pass));
    break;

    case 'auto':
      this.username = user;
      this.password = pass;
    break;
      
    case 'bearer': // usage would be .auth(accessToken, { type: 'bearer' })
      this.set('Authorization', 'Bearer ' + user);
    break;  
  }
  return this;
};

/**
 * Add query-string `val`.
 *
 * Examples:
 *
 *   request.get('/shoes')
 *     .query('size=10')
 *     .query({ color: 'blue' })
 *
 * @param {Object|String} val
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.query = function(val){
  if ('string' != typeof val) val = serialize(val);
  if (val) this._query.push(val);
  return this;
};

/**
 * Queue the given `file` as an attachment to the specified `field`,
 * with optional `options` (or filename).
 *
 * ``` js
 * request.post('/upload')
 *   .attach('content', new Blob(['<a id="a"><b id="b">hey!</b></a>'], { type: "text/html"}))
 *   .end(callback);
 * ```
 *
 * @param {String} field
 * @param {Blob|File} file
 * @param {String|Object} options
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.attach = function(field, file, options){
  if (file) {
    if (this._data) {
      throw Error("superagent can't mix .send() and .attach()");
    }

    this._getFormData().append(field, file, options || file.name);
  }
  return this;
};

Request.prototype._getFormData = function(){
  if (!this._formData) {
    this._formData = new root.FormData();
  }
  return this._formData;
};

/**
 * Invoke the callback with `err` and `res`
 * and handle arity check.
 *
 * @param {Error} err
 * @param {Response} res
 * @api private
 */

Request.prototype.callback = function(err, res){
  // console.log(this._retries, this._maxRetries)
  if (this._maxRetries && this._retries++ < this._maxRetries && shouldRetry(err, res)) {
    return this._retry();
  }

  var fn = this._callback;
  this.clearTimeout();

  if (err) {
    if (this._maxRetries) err.retries = this._retries - 1;
    this.emit('error', err);
  }

  fn(err, res);
};

/**
 * Invoke callback with x-domain error.
 *
 * @api private
 */

Request.prototype.crossDomainError = function(){
  var err = new Error('Request has been terminated\nPossible causes: the network is offline, Origin is not allowed by Access-Control-Allow-Origin, the page is being unloaded, etc.');
  err.crossDomain = true;

  err.status = this.status;
  err.method = this.method;
  err.url = this.url;

  this.callback(err);
};

// This only warns, because the request is still likely to work
Request.prototype.buffer = Request.prototype.ca = Request.prototype.agent = function(){
  console.warn("This is not supported in browser version of superagent");
  return this;
};

// This throws, because it can't send/receive data as expected
Request.prototype.pipe = Request.prototype.write = function(){
  throw Error("Streaming is not supported in browser version of superagent");
};

/**
 * Compose querystring to append to req.url
 *
 * @api private
 */

Request.prototype._appendQueryString = function(){
  var query = this._query.join('&');
  if (query) {
    this.url += (this.url.indexOf('?') >= 0 ? '&' : '?') + query;
  }

  if (this._sort) {
    var index = this.url.indexOf('?');
    if (index >= 0) {
      var queryArr = this.url.substring(index + 1).split('&');
      if (isFunction(this._sort)) {
        queryArr.sort(this._sort);
      } else {
        queryArr.sort();
      }
      this.url = this.url.substring(0, index) + '?' + queryArr.join('&');
    }
  }
};

/**
 * Check if `obj` is a host object,
 * we don't want to serialize these :)
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */
Request.prototype._isHost = function _isHost(obj) {
  // Native objects stringify to [object File], [object Blob], [object FormData], etc.
  return obj && 'object' === typeof obj && !Array.isArray(obj) && Object.prototype.toString.call(obj) !== '[object Object]';
}

/**
 * Initiate request, invoking callback `fn(res)`
 * with an instanceof `Response`.
 *
 * @param {Function} fn
 * @return {Request} for chaining
 * @api public
 */

Request.prototype.end = function(fn){
  if (this._endCalled) {
    console.warn("Warning: .end() was called twice. This is not supported in superagent");
  }
  this._endCalled = true;

  // store callback
  this._callback = fn || noop;

  // querystring
  this._appendQueryString();

  return this._end();
};

Request.prototype._end = function() {
  var self = this;
  var xhr = this.xhr = request.getXHR();
  var data = this._formData || this._data;

  this._setTimeouts();

  // state change
  xhr.onreadystatechange = function(){
    var readyState = xhr.readyState;
    if (readyState >= 2 && self._responseTimeoutTimer) {
      clearTimeout(self._responseTimeoutTimer);
    }
    if (4 != readyState) {
      return;
    }

    // In IE9, reads to any property (e.g. status) off of an aborted XHR will
    // result in the error "Could not complete the operation due to error c00c023f"
    var status;
    try { status = xhr.status } catch(e) { status = 0; }

    if (!status) {
      if (self.timedout || self._aborted) return;
      return self.crossDomainError();
    }
    self.emit('end');
  };

  // progress
  var handleProgress = function(direction, e) {
    if (e.total > 0) {
      e.percent = e.loaded / e.total * 100;
    }
    e.direction = direction;
    self.emit('progress', e);
  }
  if (this.hasListeners('progress')) {
    try {
      xhr.onprogress = handleProgress.bind(null, 'download');
      if (xhr.upload) {
        xhr.upload.onprogress = handleProgress.bind(null, 'upload');
      }
    } catch(e) {
      // Accessing xhr.upload fails in IE from a web worker, so just pretend it doesn't exist.
      // Reported here:
      // https://connect.microsoft.com/IE/feedback/details/837245/xmlhttprequest-upload-throws-invalid-argument-when-used-from-web-worker-context
    }
  }

  // initiate request
  try {
    if (this.username && this.password) {
      xhr.open(this.method, this.url, true, this.username, this.password);
    } else {
      xhr.open(this.method, this.url, true);
    }
  } catch (err) {
    // see #1149
    return this.callback(err);
  }

  // CORS
  if (this._withCredentials) xhr.withCredentials = true;

  // body
  if (!this._formData && 'GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !this._isHost(data)) {
    // serialize stuff
    var contentType = this._header['content-type'];
    var serialize = this._serializer || request.serialize[contentType ? contentType.split(';')[0] : ''];
    if (!serialize && isJSON(contentType)) {
      serialize = request.serialize['application/json'];
    }
    if (serialize) data = serialize(data);
  }

  // set header fields
  for (var field in this.header) {
    if (null == this.header[field]) continue;

    if (this.header.hasOwnProperty(field))
      xhr.setRequestHeader(field, this.header[field]);
  }

  if (this._responseType) {
    xhr.responseType = this._responseType;
  }

  // send stuff
  this.emit('request', this);

  // IE11 xhr.send(undefined) sends 'undefined' string as POST payload (instead of nothing)
  // We need null here if data is undefined
  xhr.send(typeof data !== 'undefined' ? data : null);
  return this;
};

/**
 * GET `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.get = function(url, data, fn){
  var req = request('GET', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.query(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * HEAD `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.head = function(url, data, fn){
  var req = request('HEAD', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * OPTIONS query to `url` with optional callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.options = function(url, data, fn){
  var req = request('OPTIONS', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * DELETE `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

function del(url, data, fn){
  var req = request('DELETE', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

request['del'] = del;
request['delete'] = del;

/**
 * PATCH `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.patch = function(url, data, fn){
  var req = request('PATCH', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * POST `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed} [data]
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.post = function(url, data, fn){
  var req = request('POST', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

/**
 * PUT `url` with optional `data` and callback `fn(res)`.
 *
 * @param {String} url
 * @param {Mixed|Function} [data] or fn
 * @param {Function} [fn]
 * @return {Request}
 * @api public
 */

request.put = function(url, data, fn){
  var req = request('PUT', url);
  if ('function' == typeof data) fn = data, data = null;
  if (data) req.send(data);
  if (fn) req.end(fn);
  return req;
};

},{"./is-function":4,"./is-object":5,"./request-base":6,"./response-base":7,"./should-retry":8,"component-emitter":2}],4:[function(require,module,exports){
/**
 * Check if `fn` is a function.
 *
 * @param {Function} fn
 * @return {Boolean}
 * @api private
 */
var isObject = require('./is-object');

function isFunction(fn) {
  var tag = isObject(fn) ? Object.prototype.toString.call(fn) : '';
  return tag === '[object Function]';
}

module.exports = isFunction;

},{"./is-object":5}],5:[function(require,module,exports){
/**
 * Check if `obj` is an object.
 *
 * @param {Object} obj
 * @return {Boolean}
 * @api private
 */

function isObject(obj) {
  return null !== obj && 'object' === typeof obj;
}

module.exports = isObject;

},{}],6:[function(require,module,exports){
/**
 * Module of mixed-in functions shared between node and client code
 */
var isObject = require('./is-object');

/**
 * Expose `RequestBase`.
 */

module.exports = RequestBase;

/**
 * Initialize a new `RequestBase`.
 *
 * @api public
 */

function RequestBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in RequestBase.prototype) {
    obj[key] = RequestBase.prototype[key];
  }
  return obj;
}

/**
 * Clear previous timeout.
 *
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.clearTimeout = function _clearTimeout(){
  clearTimeout(this._timer);
  clearTimeout(this._responseTimeoutTimer);
  delete this._timer;
  delete this._responseTimeoutTimer;
  return this;
};

/**
 * Override default response body parser
 *
 * This function will be called to convert incoming data into request.body
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.parse = function parse(fn){
  this._parser = fn;
  return this;
};

/**
 * Set format of binary response body.
 * In browser valid formats are 'blob' and 'arraybuffer',
 * which return Blob and ArrayBuffer, respectively.
 *
 * In Node all values result in Buffer.
 *
 * Examples:
 *
 *      req.get('/')
 *        .responseType('blob')
 *        .end(callback);
 *
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.responseType = function(val){
  this._responseType = val;
  return this;
};

/**
 * Override default request body serializer
 *
 * This function will be called to convert data set via .send or .attach into payload to send
 *
 * @param {Function}
 * @api public
 */

RequestBase.prototype.serialize = function serialize(fn){
  this._serializer = fn;
  return this;
};

/**
 * Set timeouts.
 *
 * - response timeout is time between sending request and receiving the first byte of the response. Includes DNS and connection time.
 * - deadline is the time from start of the request to receiving response body in full. If the deadline is too short large files may not load at all on slow connections.
 *
 * Value of 0 or false means no timeout.
 *
 * @param {Number|Object} ms or {response, read, deadline}
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.timeout = function timeout(options){
  if (!options || 'object' !== typeof options) {
    this._timeout = options;
    this._responseTimeout = 0;
    return this;
  }

  for(var option in options) {
    switch(option) {
      case 'deadline':
        this._timeout = options.deadline;
        break;
      case 'response':
        this._responseTimeout = options.response;
        break;
      default:
        console.warn("Unknown timeout option", option);
    }
  }
  return this;
};

/**
 * Set number of retry attempts on error.
 *
 * Failed requests will be retried 'count' times if timeout or err.code >= 500.
 *
 * @param {Number} count
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.retry = function retry(count){
  // Default to 1 if no count passed or true
  if (arguments.length === 0 || count === true) count = 1;
  if (count <= 0) count = 0;
  this._maxRetries = count;
  this._retries = 0;
  return this;
};

/**
 * Retry request
 *
 * @return {Request} for chaining
 * @api private
 */

RequestBase.prototype._retry = function() {
  this.clearTimeout();

  // node
  if (this.req) {
    this.req = null;
    this.req = this.request();
  }

  this._aborted = false;
  this.timedout = false;

  return this._end();
};

/**
 * Promise support
 *
 * @param {Function} resolve
 * @param {Function} [reject]
 * @return {Request}
 */

RequestBase.prototype.then = function then(resolve, reject) {
  if (!this._fullfilledPromise) {
    var self = this;
    if (this._endCalled) {
      console.warn("Warning: superagent request was sent twice, because both .end() and .then() were called. Never call .end() if you use promises");
    }
    this._fullfilledPromise = new Promise(function(innerResolve, innerReject){
      self.end(function(err, res){
        if (err) innerReject(err); else innerResolve(res);
      });
    });
  }
  return this._fullfilledPromise.then(resolve, reject);
}

RequestBase.prototype.catch = function(cb) {
  return this.then(undefined, cb);
};

/**
 * Allow for extension
 */

RequestBase.prototype.use = function use(fn) {
  fn(this);
  return this;
}

RequestBase.prototype.ok = function(cb) {
  if ('function' !== typeof cb) throw Error("Callback required");
  this._okCallback = cb;
  return this;
};

RequestBase.prototype._isResponseOK = function(res) {
  if (!res) {
    return false;
  }

  if (this._okCallback) {
    return this._okCallback(res);
  }

  return res.status >= 200 && res.status < 300;
};


/**
 * Get request header `field`.
 * Case-insensitive.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

RequestBase.prototype.get = function(field){
  return this._header[field.toLowerCase()];
};

/**
 * Get case-insensitive header `field` value.
 * This is a deprecated internal API. Use `.get(field)` instead.
 *
 * (getHeader is no longer used internally by the superagent code base)
 *
 * @param {String} field
 * @return {String}
 * @api private
 * @deprecated
 */

RequestBase.prototype.getHeader = RequestBase.prototype.get;

/**
 * Set header `field` to `val`, or multiple fields with one object.
 * Case-insensitive.
 *
 * Examples:
 *
 *      req.get('/')
 *        .set('Accept', 'application/json')
 *        .set('X-API-Key', 'foobar')
 *        .end(callback);
 *
 *      req.get('/')
 *        .set({ Accept: 'application/json', 'X-API-Key': 'foobar' })
 *        .end(callback);
 *
 * @param {String|Object} field
 * @param {String} val
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.set = function(field, val){
  if (isObject(field)) {
    for (var key in field) {
      this.set(key, field[key]);
    }
    return this;
  }
  this._header[field.toLowerCase()] = val;
  this.header[field] = val;
  return this;
};

/**
 * Remove header `field`.
 * Case-insensitive.
 *
 * Example:
 *
 *      req.get('/')
 *        .unset('User-Agent')
 *        .end(callback);
 *
 * @param {String} field
 */
RequestBase.prototype.unset = function(field){
  delete this._header[field.toLowerCase()];
  delete this.header[field];
  return this;
};

/**
 * Write the field `name` and `val`, or multiple fields with one object
 * for "multipart/form-data" request bodies.
 *
 * ``` js
 * request.post('/upload')
 *   .field('foo', 'bar')
 *   .end(callback);
 *
 * request.post('/upload')
 *   .field({ foo: 'bar', baz: 'qux' })
 *   .end(callback);
 * ```
 *
 * @param {String|Object} name
 * @param {String|Blob|File|Buffer|fs.ReadStream} val
 * @return {Request} for chaining
 * @api public
 */
RequestBase.prototype.field = function(name, val) {

  // name should be either a string or an object.
  if (null === name ||  undefined === name) {
    throw new Error('.field(name, val) name can not be empty');
  }

  if (this._data) {
    console.error(".field() can't be used if .send() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObject(name)) {
    for (var key in name) {
      this.field(key, name[key]);
    }
    return this;
  }

  if (Array.isArray(val)) {
    for (var i in val) {
      this.field(name, val[i]);
    }
    return this;
  }

  // val should be defined now
  if (null === val || undefined === val) {
    throw new Error('.field(name, val) val can not be empty');
  }
  if ('boolean' === typeof val) {
    val = '' + val;
  }
  this._getFormData().append(name, val);
  return this;
};

/**
 * Abort the request, and clear potential timeout.
 *
 * @return {Request}
 * @api public
 */
RequestBase.prototype.abort = function(){
  if (this._aborted) {
    return this;
  }
  this._aborted = true;
  this.xhr && this.xhr.abort(); // browser
  this.req && this.req.abort(); // node
  this.clearTimeout();
  this.emit('abort');
  return this;
};

/**
 * Enable transmission of cookies with x-domain requests.
 *
 * Note that for this to work the origin must not be
 * using "Access-Control-Allow-Origin" with a wildcard,
 * and also must set "Access-Control-Allow-Credentials"
 * to "true".
 *
 * @api public
 */

RequestBase.prototype.withCredentials = function(on){
  // This is browser-only functionality. Node side is no-op.
  if(on==undefined) on = true;
  this._withCredentials = on;
  return this;
};

/**
 * Set the max redirects to `n`. Does noting in browser XHR implementation.
 *
 * @param {Number} n
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.redirects = function(n){
  this._maxRedirects = n;
  return this;
};

/**
 * Convert to a plain javascript object (not JSON string) of scalar properties.
 * Note as this method is designed to return a useful non-this value,
 * it cannot be chained.
 *
 * @return {Object} describing method, url, and data of this request
 * @api public
 */

RequestBase.prototype.toJSON = function(){
  return {
    method: this.method,
    url: this.url,
    data: this._data,
    headers: this._header
  };
};


/**
 * Send `data` as the request body, defaulting the `.type()` to "json" when
 * an object is given.
 *
 * Examples:
 *
 *       // manual json
 *       request.post('/user')
 *         .type('json')
 *         .send('{"name":"tj"}')
 *         .end(callback)
 *
 *       // auto json
 *       request.post('/user')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // manual x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send('name=tj')
 *         .end(callback)
 *
 *       // auto x-www-form-urlencoded
 *       request.post('/user')
 *         .type('form')
 *         .send({ name: 'tj' })
 *         .end(callback)
 *
 *       // defaults to x-www-form-urlencoded
 *      request.post('/user')
 *        .send('name=tobi')
 *        .send('species=ferret')
 *        .end(callback)
 *
 * @param {String|Object} data
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.send = function(data){
  var isObj = isObject(data);
  var type = this._header['content-type'];

  if (this._formData) {
    console.error(".send() can't be used if .attach() or .field() is used. Please use only .send() or only .field() & .attach()");
  }

  if (isObj && !this._data) {
    if (Array.isArray(data)) {
      this._data = [];
    } else if (!this._isHost(data)) {
      this._data = {};
    }
  } else if (data && this._data && this._isHost(this._data)) {
    throw Error("Can't merge these send calls");
  }

  // merge
  if (isObj && isObject(this._data)) {
    for (var key in data) {
      this._data[key] = data[key];
    }
  } else if ('string' == typeof data) {
    // default to x-www-form-urlencoded
    if (!type) this.type('form');
    type = this._header['content-type'];
    if ('application/x-www-form-urlencoded' == type) {
      this._data = this._data
        ? this._data + '&' + data
        : data;
    } else {
      this._data = (this._data || '') + data;
    }
  } else {
    this._data = data;
  }

  if (!isObj || this._isHost(data)) {
    return this;
  }

  // default to json
  if (!type) this.type('json');
  return this;
};


/**
 * Sort `querystring` by the sort function
 *
 *
 * Examples:
 *
 *       // default order
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery()
 *         .end(callback)
 *
 *       // customized sort function
 *       request.get('/user')
 *         .query('name=Nick')
 *         .query('search=Manny')
 *         .sortQuery(function(a, b){
 *           return a.length - b.length;
 *         })
 *         .end(callback)
 *
 *
 * @param {Function} sort
 * @return {Request} for chaining
 * @api public
 */

RequestBase.prototype.sortQuery = function(sort) {
  // _sort default to true but otherwise can be a function or boolean
  this._sort = typeof sort === 'undefined' ? true : sort;
  return this;
};

/**
 * Invoke callback with timeout error.
 *
 * @api private
 */

RequestBase.prototype._timeoutError = function(reason, timeout, errno){
  if (this._aborted) {
    return;
  }
  var err = new Error(reason + timeout + 'ms exceeded');
  err.timeout = timeout;
  err.code = 'ECONNABORTED';
  err.errno = errno;
  this.timedout = true;
  this.abort();
  this.callback(err);
};

RequestBase.prototype._setTimeouts = function() {
  var self = this;

  // deadline
  if (this._timeout && !this._timer) {
    this._timer = setTimeout(function(){
      self._timeoutError('Timeout of ', self._timeout, 'ETIME');
    }, this._timeout);
  }
  // response timeout
  if (this._responseTimeout && !this._responseTimeoutTimer) {
    this._responseTimeoutTimer = setTimeout(function(){
      self._timeoutError('Response timeout of ', self._responseTimeout, 'ETIMEDOUT');
    }, this._responseTimeout);
  }
}

},{"./is-object":5}],7:[function(require,module,exports){

/**
 * Module dependencies.
 */

var utils = require('./utils');

/**
 * Expose `ResponseBase`.
 */

module.exports = ResponseBase;

/**
 * Initialize a new `ResponseBase`.
 *
 * @api public
 */

function ResponseBase(obj) {
  if (obj) return mixin(obj);
}

/**
 * Mixin the prototype properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in ResponseBase.prototype) {
    obj[key] = ResponseBase.prototype[key];
  }
  return obj;
}

/**
 * Get case-insensitive `field` value.
 *
 * @param {String} field
 * @return {String}
 * @api public
 */

ResponseBase.prototype.get = function(field){
    return this.header[field.toLowerCase()];
};

/**
 * Set header related properties:
 *
 *   - `.type` the content type without params
 *
 * A response of "Content-Type: text/plain; charset=utf-8"
 * will provide you with a `.type` of "text/plain".
 *
 * @param {Object} header
 * @api private
 */

ResponseBase.prototype._setHeaderProperties = function(header){
    // TODO: moar!
    // TODO: make this a util

    // content-type
    var ct = header['content-type'] || '';
    this.type = utils.type(ct);

    // params
    var params = utils.params(ct);
    for (var key in params) this[key] = params[key];

    this.links = {};

    // links
    try {
        if (header.link) {
            this.links = utils.parseLinks(header.link);
        }
    } catch (err) {
        // ignore
    }
};

/**
 * Set flags such as `.ok` based on `status`.
 *
 * For example a 2xx response will give you a `.ok` of __true__
 * whereas 5xx will be __false__ and `.error` will be __true__. The
 * `.clientError` and `.serverError` are also available to be more
 * specific, and `.statusType` is the class of error ranging from 1..5
 * sometimes useful for mapping respond colors etc.
 *
 * "sugar" properties are also defined for common cases. Currently providing:
 *
 *   - .noContent
 *   - .badRequest
 *   - .unauthorized
 *   - .notAcceptable
 *   - .notFound
 *
 * @param {Number} status
 * @api private
 */

ResponseBase.prototype._setStatusProperties = function(status){
    var type = status / 100 | 0;

    // status / class
    this.status = this.statusCode = status;
    this.statusType = type;

    // basics
    this.info = 1 == type;
    this.ok = 2 == type;
    this.redirect = 3 == type;
    this.clientError = 4 == type;
    this.serverError = 5 == type;
    this.error = (4 == type || 5 == type)
        ? this.toError()
        : false;

    // sugar
    this.accepted = 202 == status;
    this.noContent = 204 == status;
    this.badRequest = 400 == status;
    this.unauthorized = 401 == status;
    this.notAcceptable = 406 == status;
    this.forbidden = 403 == status;
    this.notFound = 404 == status;
};

},{"./utils":9}],8:[function(require,module,exports){
var ERROR_CODES = [
  'ECONNRESET',
  'ETIMEDOUT',
  'EADDRINFO',
  'ESOCKETTIMEDOUT'
];

/**
 * Determine if a request should be retried.
 * (Borrowed from segmentio/superagent-retry)
 *
 * @param {Error} err
 * @param {Response} [res]
 * @returns {Boolean}
 */
module.exports = function shouldRetry(err, res) {
  if (err && err.code && ~ERROR_CODES.indexOf(err.code)) return true;
  if (res && res.status && res.status >= 500) return true;
  // Superagent timeout
  if (err && 'timeout' in err && err.code == 'ECONNABORTED') return true;
  if (err && 'crossDomain' in err) return true;
  return false;
};

},{}],9:[function(require,module,exports){

/**
 * Return the mime type for the given `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

exports.type = function(str){
  return str.split(/ *; */).shift();
};

/**
 * Return header field parameters.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.params = function(str){
  return str.split(/ *; */).reduce(function(obj, str){
    var parts = str.split(/ *= */);
    var key = parts.shift();
    var val = parts.shift();

    if (key && val) obj[key] = val;
    return obj;
  }, {});
};

/**
 * Parse Link header fields.
 *
 * @param {String} str
 * @return {Object}
 * @api private
 */

exports.parseLinks = function(str){
  return str.split(/ *, */).reduce(function(obj, str){
    var parts = str.split(/ *; */);
    var url = parts[0].slice(1, -1);
    var rel = parts[1].split(/ *= */)[1].slice(1, -1);
    obj[rel] = url;
    return obj;
  }, {});
};

/**
 * Strip content related fields from `header`.
 *
 * @param {Object} header
 * @return {Object} header
 * @api private
 */

exports.cleanHeader = function(header, shouldStripCookie){
  delete header['content-type'];
  delete header['content-length'];
  delete header['transfer-encoding'];
  delete header['host'];
  if (shouldStripCookie) {
    delete header['cookie'];
  }
  return header;
};
},{}],10:[function(require,module,exports){
(function (Buffer){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['superagent', 'querystring'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('superagent'), require('querystring'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ApiClient = factory(root.superagent, root.querystring);
  }
}(this, function(superagent, querystring) {
  'use strict';

  /**
   * @module ApiClient
   * @version v1
   */

  /**
   * Manages low level client-server communications, parameter marshalling, etc. There should not be any need for an
   * application to use this class directly - the *Api and model classes provide the public API for the service. The
   * contents of this file should be regarded as internal but are documented for completeness.
   * @alias module:ApiClient
   * @class
   */
  var exports = function() {
    /**
     * The base URL against which to resolve every API call's (relative) path.
     * @type {String}
     * @default http://192.168.10.2/admin/api
     */
    this.basePath = 'http://192.168.10.2/admin/api'.replace(/\/+$/, '');

    /**
     * The authentication methods to be included for all API calls.
     * @type {Array.<String>}
     */
    this.authentications = {
    };
    /**
     * The default HTTP headers to be included for all API calls.
     * @type {Array.<String>}
     * @default {}
     */
    this.defaultHeaders = {};

    /**
     * The default HTTP timeout for all API calls.
     * @type {Number}
     * @default 60000
     */
    this.timeout = 60000;

    /**
     * If set to false an additional timestamp parameter is added to all API GET calls to
     * prevent browser caching
     * @type {Boolean}
     * @default true
     */
    this.cache = true;

    /**
     * If set to true, the client will save the cookies from each server
     * response, and return them in the next request.
     * @default false
     */
    this.enableCookies = false;

    /*
     * Used to save and return cookies in a node.js (non-browser) setting,
     * if this.enableCookies is set to true.
     */
    if (typeof window === 'undefined') {
      this.agent = new superagent.agent();
    }

  };

  /**
   * Returns a string representation for an actual parameter.
   * @param param The actual parameter.
   * @returns {String} The string representation of <code>param</code>.
   */
  exports.prototype.paramToString = function(param) {
    if (param == undefined || param == null) {
      return '';
    }
    if (param instanceof Date) {
      return param.toJSON();
    }
    return param.toString();
  };

  /**
   * Builds full URL by appending the given path to the base URL and replacing path parameter place-holders with parameter values.
   * NOTE: query parameters are not handled here.
   * @param {String} path The path to append to the base URL.
   * @param {Object} pathParams The parameter values to append.
   * @returns {String} The encoded path with parameter values substituted.
   */
  exports.prototype.buildUrl = function(path, pathParams) {
    if (!path.match(/^\//)) {
      path = '/' + path;
    }
    var url = this.basePath + path;
    var _this = this;
    url = url.replace(/\{([\w-]+)\}/g, function(fullMatch, key) {
      var value;
      if (pathParams.hasOwnProperty(key)) {
        value = _this.paramToString(pathParams[key]);
      } else {
        value = fullMatch;
      }
      return encodeURIComponent(value);
    });
    return url;
  };

  /**
   * Checks whether the given content type represents JSON.<br>
   * JSON content type examples:<br>
   * <ul>
   * <li>application/json</li>
   * <li>application/json; charset=UTF8</li>
   * <li>APPLICATION/JSON</li>
   * </ul>
   * @param {String} contentType The MIME content type to check.
   * @returns {Boolean} <code>true</code> if <code>contentType</code> represents JSON, otherwise <code>false</code>.
   */
  exports.prototype.isJsonMime = function(contentType) {
    return Boolean(contentType != null && contentType.match(/^application\/json(;.*)?$/i));
  };

  /**
   * Chooses a content type from the given array, with JSON preferred; i.e. return JSON if included, otherwise return the first.
   * @param {Array.<String>} contentTypes
   * @returns {String} The chosen content type, preferring JSON.
   */
  exports.prototype.jsonPreferredMime = function(contentTypes) {
    for (var i = 0; i < contentTypes.length; i++) {
      if (this.isJsonMime(contentTypes[i])) {
        return contentTypes[i];
      }
    }
    return contentTypes[0];
  };

  /**
   * Checks whether the given parameter value represents file-like content.
   * @param param The parameter to check.
   * @returns {Boolean} <code>true</code> if <code>param</code> represents a file.
   */
  exports.prototype.isFileParam = function(param) {
    // fs.ReadStream in Node.js and Electron (but not in runtime like browserify)
    if (typeof require === 'function') {
      var fs;
      try {
        fs = require('fs');
      } catch (err) {}
      if (fs && fs.ReadStream && param instanceof fs.ReadStream) {
        return true;
      }
    }
    // Buffer in Node.js
    if (typeof Buffer === 'function' && param instanceof Buffer) {
      return true;
    }
    // Blob in browser
    if (typeof Blob === 'function' && param instanceof Blob) {
      return true;
    }
    // File in browser (it seems File object is also instance of Blob, but keep this for safe)
    if (typeof File === 'function' && param instanceof File) {
      return true;
    }
    return false;
  };

  /**
   * Normalizes parameter values:
   * <ul>
   * <li>remove nils</li>
   * <li>keep files and arrays</li>
   * <li>format to string with `paramToString` for other cases</li>
   * </ul>
   * @param {Object.<String, Object>} params The parameters as object properties.
   * @returns {Object.<String, Object>} normalized parameters.
   */
  exports.prototype.normalizeParams = function(params) {
    var newParams = {};
    for (var key in params) {
      if (params.hasOwnProperty(key) && params[key] != undefined && params[key] != null) {
        var value = params[key];
        if (this.isFileParam(value) || Array.isArray(value)) {
          newParams[key] = value;
        } else {
          newParams[key] = this.paramToString(value);
        }
      }
    }
    return newParams;
  };

  /**
   * Enumeration of collection format separator strategies.
   * @enum {String}
   * @readonly
   */
  exports.CollectionFormatEnum = {
    /**
     * Comma-separated values. Value: <code>csv</code>
     * @const
     */
    CSV: ',',
    /**
     * Space-separated values. Value: <code>ssv</code>
     * @const
     */
    SSV: ' ',
    /**
     * Tab-separated values. Value: <code>tsv</code>
     * @const
     */
    TSV: '\t',
    /**
     * Pipe(|)-separated values. Value: <code>pipes</code>
     * @const
     */
    PIPES: '|',
    /**
     * Native array. Value: <code>multi</code>
     * @const
     */
    MULTI: 'multi'
  };

  /**
   * Builds a string representation of an array-type actual parameter, according to the given collection format.
   * @param {Array} param An array parameter.
   * @param {module:ApiClient.CollectionFormatEnum} collectionFormat The array element separator strategy.
   * @returns {String|Array} A string representation of the supplied collection, using the specified delimiter. Returns
   * <code>param</code> as is if <code>collectionFormat</code> is <code>multi</code>.
   */
  exports.prototype.buildCollectionParam = function buildCollectionParam(param, collectionFormat) {
    if (param == null) {
      return null;
    }
    switch (collectionFormat) {
      case 'csv':
        return param.map(this.paramToString).join(',');
      case 'ssv':
        return param.map(this.paramToString).join(' ');
      case 'tsv':
        return param.map(this.paramToString).join('\t');
      case 'pipes':
        return param.map(this.paramToString).join('|');
      case 'multi':
        // return the array directly as SuperAgent will handle it as expected
        return param.map(this.paramToString);
      default:
        throw new Error('Unknown collection format: ' + collectionFormat);
    }
  };

  /**
   * Applies authentication headers to the request.
   * @param {Object} request The request object created by a <code>superagent()</code> call.
   * @param {Array.<String>} authNames An array of authentication method names.
   */
  exports.prototype.applyAuthToRequest = function(request, authNames) {
    var _this = this;
    authNames.forEach(function(authName) {
      var auth = _this.authentications[authName];
      switch (auth.type) {
        case 'basic':
          if (auth.username || auth.password) {
            request.auth(auth.username || '', auth.password || '');
          }
          break;
        case 'apiKey':
          if (auth.apiKey) {
            var data = {};
            if (auth.apiKeyPrefix) {
              data[auth.name] = auth.apiKeyPrefix + ' ' + auth.apiKey;
            } else {
              data[auth.name] = auth.apiKey;
            }
            if (auth['in'] === 'header') {
              request.set(data);
            } else {
              request.query(data);
            }
          }
          break;
        case 'oauth2':
          if (auth.accessToken) {
            request.set({'Authorization': 'Bearer ' + auth.accessToken});
          }
          break;
        default:
          throw new Error('Unknown authentication type: ' + auth.type);
      }
    });
  };

  /**
   * Deserializes an HTTP response body into a value of the specified type.
   * @param {Object} response A SuperAgent response object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} returnType The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns A value of the specified type.
   */
  exports.prototype.deserialize = function deserialize(response, returnType) {
    if (response == null || returnType == null || response.status == 204) {
      return null;
    }
    // Rely on SuperAgent for parsing response body.
    // See http://visionmedia.github.io/superagent/#parsing-response-bodies
    var data = response.body;
    if (data == null || (typeof data === 'object' && typeof data.length === 'undefined' && !Object.keys(data).length)) {
      // SuperAgent does not always produce a body; use the unparsed response as a fallback
      data = response.text;
    }
    return exports.convertToType(data, returnType);
  };

  /**
   * Callback function to receive the result of the operation.
   * @callback module:ApiClient~callApiCallback
   * @param {String} error Error message, if any.
   * @param data The data returned by the service call.
   * @param {String} response The complete HTTP response.
   */

  /**
   * Invokes the REST service using the supplied settings and parameters.
   * @param {String} path The base URL to invoke.
   * @param {String} httpMethod The HTTP method to use.
   * @param {Object.<String, String>} pathParams A map of path parameters and their values.
   * @param {Object.<String, Object>} queryParams A map of query parameters and their values.
   * @param {Object.<String, Object>} headerParams A map of header parameters and their values.
   * @param {Object.<String, Object>} formParams A map of form parameters and their values.
   * @param {Object} bodyParam The value to pass as the request body.
   * @param {Array.<String>} authNames An array of authentication type names.
   * @param {Array.<String>} contentTypes An array of request MIME types.
   * @param {Array.<String>} accepts An array of acceptable response MIME types.
   * @param {(String|Array|ObjectFunction)} returnType The required type to return; can be a string for simple types or the
   * constructor for a complex type.
   * @param {module:ApiClient~callApiCallback} callback The callback function.
   * @returns {Object} The SuperAgent request object.
   */
  exports.prototype.callApi = function callApi(path, httpMethod, pathParams,
      queryParams, headerParams, formParams, bodyParam, authNames, contentTypes, accepts,
      returnType, callback) {

    var _this = this;
    var url = this.buildUrl(path, pathParams);
    var request = superagent(httpMethod, url);

    // apply authentications
    this.applyAuthToRequest(request, authNames);

    // set query parameters
    if (httpMethod.toUpperCase() === 'GET' && this.cache === false) {
        queryParams['_'] = new Date().getTime();
    }
    request.query(this.normalizeParams(queryParams));

    // set header parameters
    request.set(this.defaultHeaders).set(this.normalizeParams(headerParams));

    // set request timeout
    request.timeout(this.timeout);

    var contentType = this.jsonPreferredMime(contentTypes);
    if (contentType) {
      // Issue with superagent and multipart/form-data (https://github.com/visionmedia/superagent/issues/746)
      if(contentType != 'multipart/form-data') {
        request.type(contentType);
      }
    } else if (!request.header['Content-Type']) {
      request.type('application/json');
    }

    if (contentType === 'application/x-www-form-urlencoded') {
      request.send(querystring.stringify(this.normalizeParams(formParams)));
    } else if (contentType == 'multipart/form-data') {
      var _formParams = this.normalizeParams(formParams);
      for (var key in _formParams) {
        if (_formParams.hasOwnProperty(key)) {
          if (this.isFileParam(_formParams[key])) {
            // file field
            request.attach(key, _formParams[key]);
          } else {
            request.field(key, _formParams[key]);
          }
        }
      }
    } else if (bodyParam) {
      request.send(bodyParam);
    }

    var accept = this.jsonPreferredMime(accepts);
    if (accept) {
      request.accept(accept);
    }

    if (returnType === 'Blob') {
      request.responseType('blob');
    } else if (returnType === 'String') {
      request.responseType('string');
    }

    // Attach previously saved cookies, if enabled
    if (this.enableCookies){
      if (typeof window === 'undefined') {
        this.agent.attachCookies(request);
      }
      else {
        request.withCredentials();
      }
    }


    request.end(function(error, response) {
      if (callback) {
        var data = null;
        if (!error) {
          try {
            data = _this.deserialize(response, returnType);
            if (_this.enableCookies && typeof window === 'undefined'){
              _this.agent.saveCookies(response);
            }
          } catch (err) {
            error = err;
          }
        }
        callback(error, data, response);
      }
    });

    return request;
  };

  /**
   * Parses an ISO-8601 string representation of a date value.
   * @param {String} str The date value as a string.
   * @returns {Date} The parsed date object.
   */
  exports.parseDate = function(str) {
    return new Date(str.replace(/T/i, ' '));
  };

  /**
   * Converts a value to the specified type.
   * @param {(String|Object)} data The data to convert, as a string or object.
   * @param {(String|Array.<String>|Object.<String, Object>|Function)} type The type to return. Pass a string for simple types
   * or the constructor function for a complex type. Pass an array containing the type name to return an array of that type. To
   * return an object, pass an object with one property whose name is the key type and whose value is the corresponding value type:
   * all properties on <code>data<code> will be converted to this type.
   * @returns An instance of the specified type or null or undefined if data is null or undefined.
   */
  exports.convertToType = function(data, type) {
    if (data === null || data === undefined)
      return data

    switch (type) {
      case 'Boolean':
        return Boolean(data);
      case 'Integer':
        return parseInt(data, 10);
      case 'Number':
        return parseFloat(data);
      case 'String':
        return String(data);
      case 'Date':
        return this.parseDate(String(data));
      case 'Blob':
      	return data;
      default:
        if (type === Object) {
          // generic object, return directly
          return data;
        } else if (typeof type === 'function') {
          // for model type like: User
          return type.constructFromObject(data);
        } else if (Array.isArray(type)) {
          // for array type like: ['String']
          var itemType = type[0];
          return data.map(function(item) {
            return exports.convertToType(item, itemType);
          });
        } else if (typeof type === 'object') {
          // for plain object type like: {'String': 'Integer'}
          var keyType, valueType;
          for (var k in type) {
            if (type.hasOwnProperty(k)) {
              keyType = k;
              valueType = type[k];
              break;
            }
          }
          var result = {};
          for (var k in data) {
            if (data.hasOwnProperty(k)) {
              var key = exports.convertToType(k, keyType);
              var value = exports.convertToType(data[k], valueType);
              result[key] = value;
            }
          }
          return result;
        } else {
          // for unknown type, return the data directly
          return data;
        }
    }
  };

  /**
   * Constructs a new map or array model from REST data.
   * @param data {Object|Array} The REST data.
   * @param obj {Object|Array} The target object or array.
   */
  exports.constructFromObject = function(data, obj, itemType) {
    if (Array.isArray(data)) {
      for (var i = 0; i < data.length; i++) {
        if (data.hasOwnProperty(i))
          obj[i] = exports.convertToType(data[i], itemType);
      }
    } else {
      for (var k in data) {
        if (data.hasOwnProperty(k))
          obj[k] = exports.convertToType(data[k], itemType);
      }
    }
  };

  /**
   * The default API client implementation.
   * @type {module:ApiClient}
   */
  exports.instance = new exports();

  return exports;
}));

}).call(this,require("buffer").Buffer)
},{"buffer":161,"fs":160,"querystring":165,"superagent":3}],11:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ActionSetDto', 'model/CreateActionSetDto', 'model/ListDtoActionSetDto', 'model/ListDtoEventDto', 'model/UpdateActionSetDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/ActionSetDto'), require('../model/CreateActionSetDto'), require('../model/ListDtoActionSetDto'), require('../model/ListDtoEventDto'), require('../model/UpdateActionSetDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ActionSetsApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ActionSetDto, root.GatewaySoftwareApi.CreateActionSetDto, root.GatewaySoftwareApi.ListDtoActionSetDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.UpdateActionSetDto);
  }
}(this, function(ApiClient, ActionSetDto, CreateActionSetDto, ListDtoActionSetDto, ListDtoEventDto, UpdateActionSetDto) {
  'use strict';

  /**
   * ActionSets service.
   * @module api/ActionSetsApi
   * @version v1
   */

  /**
   * Constructs a new ActionSetsApi. 
   * @alias module:api/ActionSetsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the actionSetsDelete operation.
     * @callback module:api/ActionSetsApi~actionSetsDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes an action set from the system
     * @param {Number} id the ID of the action set to be deleted
     * @param {module:api/ActionSetsApi~actionSetsDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.actionSetsDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling actionSetsDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/actionsets/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionSetsExecute operation.
     * @callback module:api/ActionSetsApi~actionSetsExecuteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Executes an action set
     * @param {Number} id the ID of the action set to be executed
     * @param {module:api/ActionSetsApi~actionSetsExecuteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.actionSetsExecute = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling actionSetsExecute");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/actionsets/{id}/execute', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionSetsGet operation.
     * @callback module:api/ActionSetsApi~actionSetsGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoActionSetDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of action sets in the system
     * @param {module:api/ActionSetsApi~actionSetsGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoActionSetDto}
     */
    this.actionSetsGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoActionSetDto;

      return this.apiClient.callApi(
        '/actionsets', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionSetsGetActionSet operation.
     * @callback module:api/ActionSetsApi~actionSetsGetActionSetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ActionSetDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets an action set
     * @param {Number} id the ID of the action set to be retrieved
     * @param {module:api/ActionSetsApi~actionSetsGetActionSetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ActionSetDto}
     */
    this.actionSetsGetActionSet = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling actionSetsGetActionSet");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ActionSetDto;

      return this.apiClient.callApi(
        '/actionsets/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionSetsGetEvents operation.
     * @callback module:api/ActionSetsApi~actionSetsGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of action set events
     * @param {Number} id the ID of the action set
     * @param {module:api/ActionSetsApi~actionSetsGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.actionSetsGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling actionSetsGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/actionsets/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionSetsPost operation.
     * @callback module:api/ActionSetsApi~actionSetsPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates an action set
     * @param {module:model/CreateActionSetDto} actionSet the action set to be created
     * @param {module:api/ActionSetsApi~actionSetsPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.actionSetsPost = function(actionSet, callback) {
      var postBody = actionSet;

      // verify the required parameter 'actionSet' is set
      if (actionSet === undefined || actionSet === null) {
        throw new Error("Missing the required parameter 'actionSet' when calling actionSetsPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/actionsets', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionSetsPut operation.
     * @callback module:api/ActionSetsApi~actionSetsPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates an action set
     * @param {Number} id the ID of the action set to be updated
     * @param {module:model/UpdateActionSetDto} actionSet the updated values for the action set
     * @param {module:api/ActionSetsApi~actionSetsPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.actionSetsPut = function(id, actionSet, callback) {
      var postBody = actionSet;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling actionSetsPut");
      }

      // verify the required parameter 'actionSet' is set
      if (actionSet === undefined || actionSet === null) {
        throw new Error("Missing the required parameter 'actionSet' when calling actionSetsPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/actionsets/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/ActionSetDto":35,"../model/CreateActionSetDto":43,"../model/ListDtoActionSetDto":98,"../model/ListDtoEventDto":107,"../model/UpdateActionSetDto":138}],12:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ActionDto', 'model/CreateActionDto', 'model/ListDtoActionDto', 'model/ListDtoEventDto', 'model/UpdateActionDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/ActionDto'), require('../model/CreateActionDto'), require('../model/ListDtoActionDto'), require('../model/ListDtoEventDto'), require('../model/UpdateActionDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ActionsApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ActionDto, root.GatewaySoftwareApi.CreateActionDto, root.GatewaySoftwareApi.ListDtoActionDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.UpdateActionDto);
  }
}(this, function(ApiClient, ActionDto, CreateActionDto, ListDtoActionDto, ListDtoEventDto, UpdateActionDto) {
  'use strict';

  /**
   * Actions service.
   * @module api/ActionsApi
   * @version v1
   */

  /**
   * Constructs a new ActionsApi. 
   * @alias module:api/ActionsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the actionsDelete operation.
     * @callback module:api/ActionsApi~actionsDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes an action from the system
     * @param {Number} actionSetId the ID of the action set
     * @param {Number} actionId the ID of the action to be deleted
     * @param {module:api/ActionsApi~actionsDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.actionsDelete = function(actionSetId, actionId, callback) {
      var postBody = null;

      // verify the required parameter 'actionSetId' is set
      if (actionSetId === undefined || actionSetId === null) {
        throw new Error("Missing the required parameter 'actionSetId' when calling actionsDelete");
      }

      // verify the required parameter 'actionId' is set
      if (actionId === undefined || actionId === null) {
        throw new Error("Missing the required parameter 'actionId' when calling actionsDelete");
      }


      var pathParams = {
        'actionSetId': actionSetId,
        'actionId': actionId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/actionsets/{actionSetId}/actions/{actionId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionsExecute operation.
     * @callback module:api/ActionsApi~actionsExecuteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Executes an action
     * @param {Number} actionSetId the ID of the action set
     * @param {Number} actionId the ID of the action to be executed
     * @param {module:api/ActionsApi~actionsExecuteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.actionsExecute = function(actionSetId, actionId, callback) {
      var postBody = null;

      // verify the required parameter 'actionSetId' is set
      if (actionSetId === undefined || actionSetId === null) {
        throw new Error("Missing the required parameter 'actionSetId' when calling actionsExecute");
      }

      // verify the required parameter 'actionId' is set
      if (actionId === undefined || actionId === null) {
        throw new Error("Missing the required parameter 'actionId' when calling actionsExecute");
      }


      var pathParams = {
        'actionSetId': actionSetId,
        'actionId': actionId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/actionsets/{actionSetId}/actions/{actionId}/execute', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionsGet operation.
     * @callback module:api/ActionsApi~actionsGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoActionDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of actions contained within an action set
     * @param {Number} actionSetId the ID of the action set to be retrieved
     * @param {module:api/ActionsApi~actionsGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoActionDto}
     */
    this.actionsGet = function(actionSetId, callback) {
      var postBody = null;

      // verify the required parameter 'actionSetId' is set
      if (actionSetId === undefined || actionSetId === null) {
        throw new Error("Missing the required parameter 'actionSetId' when calling actionsGet");
      }


      var pathParams = {
        'actionSetId': actionSetId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoActionDto;

      return this.apiClient.callApi(
        '/actionsets/{actionSetId}/actions', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionsGetAction operation.
     * @callback module:api/ActionsApi~actionsGetActionCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ActionDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets an action
     * @param {Number} actionSetId the ID of the action set
     * @param {Number} actionId the ID of the action to be retrieved
     * @param {module:api/ActionsApi~actionsGetActionCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ActionDto}
     */
    this.actionsGetAction = function(actionSetId, actionId, callback) {
      var postBody = null;

      // verify the required parameter 'actionSetId' is set
      if (actionSetId === undefined || actionSetId === null) {
        throw new Error("Missing the required parameter 'actionSetId' when calling actionsGetAction");
      }

      // verify the required parameter 'actionId' is set
      if (actionId === undefined || actionId === null) {
        throw new Error("Missing the required parameter 'actionId' when calling actionsGetAction");
      }


      var pathParams = {
        'actionSetId': actionSetId,
        'actionId': actionId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ActionDto;

      return this.apiClient.callApi(
        '/actionsets/{actionSetId}/actions/{actionId}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionsGetEvents operation.
     * @callback module:api/ActionsApi~actionsGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of action events
     * @param {Number} actionSetId the ID of the action set
     * @param {Number} actionId the ID of the action
     * @param {module:api/ActionsApi~actionsGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.actionsGetEvents = function(actionSetId, actionId, callback) {
      var postBody = null;

      // verify the required parameter 'actionSetId' is set
      if (actionSetId === undefined || actionSetId === null) {
        throw new Error("Missing the required parameter 'actionSetId' when calling actionsGetEvents");
      }

      // verify the required parameter 'actionId' is set
      if (actionId === undefined || actionId === null) {
        throw new Error("Missing the required parameter 'actionId' when calling actionsGetEvents");
      }


      var pathParams = {
        'actionSetId': actionSetId,
        'actionId': actionId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/actionsets/{actionSetId}/actions/{actionId}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionsPost operation.
     * @callback module:api/ActionsApi~actionsPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates an action
     * @param {Number} actionSetId the ID of the action set
     * @param {module:model/CreateActionDto} action the action to be created
     * @param {module:api/ActionsApi~actionsPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.actionsPost = function(actionSetId, action, callback) {
      var postBody = action;

      // verify the required parameter 'actionSetId' is set
      if (actionSetId === undefined || actionSetId === null) {
        throw new Error("Missing the required parameter 'actionSetId' when calling actionsPost");
      }

      // verify the required parameter 'action' is set
      if (action === undefined || action === null) {
        throw new Error("Missing the required parameter 'action' when calling actionsPost");
      }


      var pathParams = {
        'actionSetId': actionSetId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/actionsets/{actionSetId}/actions', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the actionsPut operation.
     * @callback module:api/ActionsApi~actionsPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates an action
     * @param {Number} actionSetId the ID of the action set
     * @param {Number} actionId the ID of the action to be updated
     * @param {module:model/UpdateActionDto} action the updated values for the action
     * @param {module:api/ActionsApi~actionsPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.actionsPut = function(actionSetId, actionId, action, callback) {
      var postBody = action;

      // verify the required parameter 'actionSetId' is set
      if (actionSetId === undefined || actionSetId === null) {
        throw new Error("Missing the required parameter 'actionSetId' when calling actionsPut");
      }

      // verify the required parameter 'actionId' is set
      if (actionId === undefined || actionId === null) {
        throw new Error("Missing the required parameter 'actionId' when calling actionsPut");
      }

      // verify the required parameter 'action' is set
      if (action === undefined || action === null) {
        throw new Error("Missing the required parameter 'action' when calling actionsPut");
      }


      var pathParams = {
        'actionSetId': actionSetId,
        'actionId': actionId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/actionsets/{actionSetId}/actions/{actionId}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/ActionDto":34,"../model/CreateActionDto":42,"../model/ListDtoActionDto":97,"../model/ListDtoEventDto":107,"../model/UpdateActionDto":137}],13:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ApplicationKeyDto', 'model/CreateApplicationKeyDto', 'model/ListDtoApplicationKeyDto', 'model/UpdateApplicationKeyDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/ApplicationKeyDto'), require('../model/CreateApplicationKeyDto'), require('../model/ListDtoApplicationKeyDto'), require('../model/UpdateApplicationKeyDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ApplicationKeysApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ApplicationKeyDto, root.GatewaySoftwareApi.CreateApplicationKeyDto, root.GatewaySoftwareApi.ListDtoApplicationKeyDto, root.GatewaySoftwareApi.UpdateApplicationKeyDto);
  }
}(this, function(ApiClient, ApplicationKeyDto, CreateApplicationKeyDto, ListDtoApplicationKeyDto, UpdateApplicationKeyDto) {
  'use strict';

  /**
   * ApplicationKeys service.
   * @module api/ApplicationKeysApi
   * @version v1
   */

  /**
   * Constructs a new ApplicationKeysApi. 
   * @alias module:api/ApplicationKeysApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the applicationKeysDelete operation.
     * @callback module:api/ApplicationKeysApi~applicationKeysDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes an application key from the system
     * @param {Number} id the ID of the application key to be deleted
     * @param {module:api/ApplicationKeysApi~applicationKeysDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.applicationKeysDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling applicationKeysDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/applicationkeys/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the applicationKeysGet operation.
     * @callback module:api/ApplicationKeysApi~applicationKeysGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoApplicationKeyDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all application keys in the system
     * @param {module:api/ApplicationKeysApi~applicationKeysGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoApplicationKeyDto}
     */
    this.applicationKeysGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoApplicationKeyDto;

      return this.apiClient.callApi(
        '/applicationkeys', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the applicationKeysGetApplicationKey operation.
     * @callback module:api/ApplicationKeysApi~applicationKeysGetApplicationKeyCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ApplicationKeyDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets an application key
     * @param {Number} id the ID of the application key to be retrieved
     * @param {module:api/ApplicationKeysApi~applicationKeysGetApplicationKeyCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ApplicationKeyDto}
     */
    this.applicationKeysGetApplicationKey = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling applicationKeysGetApplicationKey");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ApplicationKeyDto;

      return this.apiClient.callApi(
        '/applicationkeys/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the applicationKeysPost operation.
     * @callback module:api/ApplicationKeysApi~applicationKeysPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates an application key
     * @param {module:model/CreateApplicationKeyDto} applicationKey the application key
     * @param {module:api/ApplicationKeysApi~applicationKeysPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.applicationKeysPost = function(applicationKey, callback) {
      var postBody = applicationKey;

      // verify the required parameter 'applicationKey' is set
      if (applicationKey === undefined || applicationKey === null) {
        throw new Error("Missing the required parameter 'applicationKey' when calling applicationKeysPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/applicationkeys', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the applicationKeysPut operation.
     * @callback module:api/ApplicationKeysApi~applicationKeysPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates an application key
     * @param {Number} id the ID of the application key to be updated
     * @param {module:model/UpdateApplicationKeyDto} applicationKey the updated values for the aplication key
     * @param {module:api/ApplicationKeysApi~applicationKeysPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.applicationKeysPut = function(id, applicationKey, callback) {
      var postBody = applicationKey;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling applicationKeysPut");
      }

      // verify the required parameter 'applicationKey' is set
      if (applicationKey === undefined || applicationKey === null) {
        throw new Error("Missing the required parameter 'applicationKey' when calling applicationKeysPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/applicationkeys/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/ApplicationKeyDto":39,"../model/CreateApplicationKeyDto":44,"../model/ListDtoApplicationKeyDto":100,"../model/UpdateApplicationKeyDto":139}],14:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ListDtoDashboardDeviceStatusByDeviceTypeDto', 'model/ListDtoDashboardDeviceStatusByNetworkSwitchDto', 'model/ListDtoDashboardDeviceStatusBySpaceDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/ListDtoDashboardDeviceStatusByDeviceTypeDto'), require('../model/ListDtoDashboardDeviceStatusByNetworkSwitchDto'), require('../model/ListDtoDashboardDeviceStatusBySpaceDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DashboardsApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ListDtoDashboardDeviceStatusByDeviceTypeDto, root.GatewaySoftwareApi.ListDtoDashboardDeviceStatusByNetworkSwitchDto, root.GatewaySoftwareApi.ListDtoDashboardDeviceStatusBySpaceDto);
  }
}(this, function(ApiClient, ListDtoDashboardDeviceStatusByDeviceTypeDto, ListDtoDashboardDeviceStatusByNetworkSwitchDto, ListDtoDashboardDeviceStatusBySpaceDto) {
  'use strict';

  /**
   * Dashboards service.
   * @module api/DashboardsApi
   * @version v1
   */

  /**
   * Constructs a new DashboardsApi. 
   * @alias module:api/DashboardsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the dashboardsGetDeviceStatusByDeviceType operation.
     * @callback module:api/DashboardsApi~dashboardsGetDeviceStatusByDeviceTypeCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDashboardDeviceStatusByDeviceTypeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets device status by device type.
     * @param {Object} opts Optional parameters
     * @param {String} opts.spaceIds 
     * @param {module:api/DashboardsApi~dashboardsGetDeviceStatusByDeviceTypeCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDashboardDeviceStatusByDeviceTypeDto}
     */
    this.dashboardsGetDeviceStatusByDeviceType = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'spaceIds': opts['spaceIds']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDashboardDeviceStatusByDeviceTypeDto;

      return this.apiClient.callApi(
        '/dashboards/devicestatusbydevicetype', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the dashboardsGetDeviceStatusByNetworkSwitch operation.
     * @callback module:api/DashboardsApi~dashboardsGetDeviceStatusByNetworkSwitchCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDashboardDeviceStatusByNetworkSwitchDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets device status by network switch.
     * @param {module:api/DashboardsApi~dashboardsGetDeviceStatusByNetworkSwitchCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDashboardDeviceStatusByNetworkSwitchDto}
     */
    this.dashboardsGetDeviceStatusByNetworkSwitch = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDashboardDeviceStatusByNetworkSwitchDto;

      return this.apiClient.callApi(
        '/dashboards/devicestatusbynetworkswitch', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the dashboardsGetDeviceStatusBySpace operation.
     * @callback module:api/DashboardsApi~dashboardsGetDeviceStatusBySpaceCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDashboardDeviceStatusBySpaceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets device status by space.
     * @param {module:api/DashboardsApi~dashboardsGetDeviceStatusBySpaceCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDashboardDeviceStatusBySpaceDto}
     */
    this.dashboardsGetDeviceStatusBySpace = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDashboardDeviceStatusBySpaceDto;

      return this.apiClient.callApi(
        '/dashboards/devicestatusbyspace', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/ListDtoDashboardDeviceStatusByDeviceTypeDto":101,"../model/ListDtoDashboardDeviceStatusByNetworkSwitchDto":102,"../model/ListDtoDashboardDeviceStatusBySpaceDto":103}],15:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CreateDeviceNodeDto', 'model/DeviceNodeDto', 'model/ListDtoDeviceNodeDto', 'model/NodeDto', 'model/UpdateDeviceNodeDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CreateDeviceNodeDto'), require('../model/DeviceNodeDto'), require('../model/ListDtoDeviceNodeDto'), require('../model/NodeDto'), require('../model/UpdateDeviceNodeDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DeviceNodesApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.CreateDeviceNodeDto, root.GatewaySoftwareApi.DeviceNodeDto, root.GatewaySoftwareApi.ListDtoDeviceNodeDto, root.GatewaySoftwareApi.NodeDto, root.GatewaySoftwareApi.UpdateDeviceNodeDto);
  }
}(this, function(ApiClient, CreateDeviceNodeDto, DeviceNodeDto, ListDtoDeviceNodeDto, NodeDto, UpdateDeviceNodeDto) {
  'use strict';

  /**
   * DeviceNodes service.
   * @module api/DeviceNodesApi
   * @version v1
   */

  /**
   * Constructs a new DeviceNodesApi. 
   * @alias module:api/DeviceNodesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the deviceNodesDelete operation.
     * @callback module:api/DeviceNodesApi~deviceNodesDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a device node from the system
     * @param {Number} id the ID of the device node to be deleted
     * @param {module:api/DeviceNodesApi~deviceNodesDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.deviceNodesDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling deviceNodesDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/devicenodes/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the deviceNodesDeleteAll operation.
     * @callback module:api/DeviceNodesApi~deviceNodesDeleteAllCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * WARNING: Deletes all device nodes from the system.
     * @param {module:api/DeviceNodesApi~deviceNodesDeleteAllCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.deviceNodesDeleteAll = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/devicenodes/deleteall', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the deviceNodesDiscover operation.
     * @callback module:api/DeviceNodesApi~deviceNodesDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all device nodes in the system
     * @param {module:api/DeviceNodesApi~deviceNodesDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.deviceNodesDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/devicenodes/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the deviceNodesGet operation.
     * @callback module:api/DeviceNodesApi~deviceNodesGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDeviceNodeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all device nodes in the system
     * @param {module:api/DeviceNodesApi~deviceNodesGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDeviceNodeDto}
     */
    this.deviceNodesGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDeviceNodeDto;

      return this.apiClient.callApi(
        '/devicenodes', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the deviceNodesGetDeviceNode operation.
     * @callback module:api/DeviceNodesApi~deviceNodesGetDeviceNodeCallback
     * @param {String} error Error message, if any.
     * @param {module:model/DeviceNodeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a device node
     * @param {Number} id the ID of the device node to be retrieved
     * @param {module:api/DeviceNodesApi~deviceNodesGetDeviceNodeCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/DeviceNodeDto}
     */
    this.deviceNodesGetDeviceNode = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling deviceNodesGetDeviceNode");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = DeviceNodeDto;

      return this.apiClient.callApi(
        '/devicenodes/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the deviceNodesGetNode operation.
     * @callback module:api/DeviceNodesApi~deviceNodesGetNodeCallback
     * @param {String} error Error message, if any.
     * @param {module:model/NodeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the network node associated with the device node
     * @param {Number} id the ID of the device node
     * @param {module:api/DeviceNodesApi~deviceNodesGetNodeCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/NodeDto}
     */
    this.deviceNodesGetNode = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling deviceNodesGetNode");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = NodeDto;

      return this.apiClient.callApi(
        '/devicenodes/{id}/networknode', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the deviceNodesPost operation.
     * @callback module:api/DeviceNodesApi~deviceNodesPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a device node
     * @param {module:model/CreateDeviceNodeDto} deviceNode the device node to be created
     * @param {module:api/DeviceNodesApi~deviceNodesPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.deviceNodesPost = function(deviceNode, callback) {
      var postBody = deviceNode;

      // verify the required parameter 'deviceNode' is set
      if (deviceNode === undefined || deviceNode === null) {
        throw new Error("Missing the required parameter 'deviceNode' when calling deviceNodesPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/devicenodes', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the deviceNodesPut operation.
     * @callback module:api/DeviceNodesApi~deviceNodesPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a device node
     * @param {Number} id the ID of the device node to be updated
     * @param {module:model/UpdateDeviceNodeDto} deviceNode the updated values for the device node
     * @param {module:api/DeviceNodesApi~deviceNodesPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.deviceNodesPut = function(id, deviceNode, callback) {
      var postBody = deviceNode;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling deviceNodesPut");
      }

      // verify the required parameter 'deviceNode' is set
      if (deviceNode === undefined || deviceNode === null) {
        throw new Error("Missing the required parameter 'deviceNode' when calling deviceNodesPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/devicenodes/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/CreateDeviceNodeDto":45,"../model/DeviceNodeDto":85,"../model/ListDtoDeviceNodeDto":105,"../model/NodeDto":127,"../model/UpdateDeviceNodeDto":141}],16:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ListDtoDeviceDto', 'model/NodeDto', 'model/PaginatedListDevicesSearchResultDto', 'model/SpaceDto', 'model/UpdateDeviceDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/ListDtoDeviceDto'), require('../model/NodeDto'), require('../model/PaginatedListDevicesSearchResultDto'), require('../model/SpaceDto'), require('../model/UpdateDeviceDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DevicesApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ListDtoDeviceDto, root.GatewaySoftwareApi.NodeDto, root.GatewaySoftwareApi.PaginatedListDevicesSearchResultDto, root.GatewaySoftwareApi.SpaceDto, root.GatewaySoftwareApi.UpdateDeviceDto);
  }
}(this, function(ApiClient, ListDtoDeviceDto, NodeDto, PaginatedListDevicesSearchResultDto, SpaceDto, UpdateDeviceDto) {
  'use strict';

  /**
   * Devices service.
   * @module api/DevicesApi
   * @version v1
   */

  /**
   * Constructs a new DevicesApi. 
   * @alias module:api/DevicesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the devicesAll operation.
     * @callback module:api/DevicesApi~devicesAllCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDeviceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all devices in the system
     * @param {module:api/DevicesApi~devicesAllCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDeviceDto}
     */
    this.devicesAll = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDeviceDto;

      return this.apiClient.callApi(
        '/devices/all', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the devicesDeleteAll operation.
     * @callback module:api/DevicesApi~devicesDeleteAllCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * WARNING: Deletes all devices in the system
     * @param {module:api/DevicesApi~devicesDeleteAllCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.devicesDeleteAll = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/devices/deleteall', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the devicesDiscover operation.
     * @callback module:api/DevicesApi~devicesDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all devices on the network
     * @param {module:api/DevicesApi~devicesDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.devicesDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/devices/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the devicesGetNode operation.
     * @callback module:api/DevicesApi~devicesGetNodeCallback
     * @param {String} error Error message, if any.
     * @param {module:model/NodeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the network node associated with the device
     * @param {module:model/String} type the type of the device
     * @param {Number} id the ID of the device
     * @param {module:api/DevicesApi~devicesGetNodeCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/NodeDto}
     */
    this.devicesGetNode = function(type, id, callback) {
      var postBody = null;

      // verify the required parameter 'type' is set
      if (type === undefined || type === null) {
        throw new Error("Missing the required parameter 'type' when calling devicesGetNode");
      }

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling devicesGetNode");
      }


      var pathParams = {
        'type': type,
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = NodeDto;

      return this.apiClient.callApi(
        '/devices/{type}/{id}/networknode', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the devicesGetSpace operation.
     * @callback module:api/DevicesApi~devicesGetSpaceCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SpaceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the space that contains the device
     * @param {module:model/String} type the type of device
     * @param {Number} id the ID of the device
     * @param {module:api/DevicesApi~devicesGetSpaceCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SpaceDto}
     */
    this.devicesGetSpace = function(type, id, callback) {
      var postBody = null;

      // verify the required parameter 'type' is set
      if (type === undefined || type === null) {
        throw new Error("Missing the required parameter 'type' when calling devicesGetSpace");
      }

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling devicesGetSpace");
      }


      var pathParams = {
        'type': type,
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = SpaceDto;

      return this.apiClient.callApi(
        '/devices/{type}/{id}/space', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the devicesPut operation.
     * @callback module:api/DevicesApi~devicesPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Renames a device
     * @param {module:model/String} type the type of the device to be renamed
     * @param {Number} id the ID of the device to be renamed
     * @param {module:model/UpdateDeviceDto} device the device containing the new name
     * @param {module:api/DevicesApi~devicesPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.devicesPut = function(type, id, device, callback) {
      var postBody = device;

      // verify the required parameter 'type' is set
      if (type === undefined || type === null) {
        throw new Error("Missing the required parameter 'type' when calling devicesPut");
      }

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling devicesPut");
      }

      // verify the required parameter 'device' is set
      if (device === undefined || device === null) {
        throw new Error("Missing the required parameter 'device' when calling devicesPut");
      }


      var pathParams = {
        'type': type,
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/devices/{type}/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the devicesSearch operation.
     * @callback module:api/DevicesApi~devicesSearchCallback
     * @param {String} error Error message, if any.
     * @param {module:model/PaginatedListDevicesSearchResultDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Searches all devices in the system
     * @param {Object} opts Optional parameters
     * @param {Number} opts.page the results page
     * @param {Number} opts.pageSize the results page size
     * @param {String} opts.term the search term
     * @param {String} opts.types the devices types
     * @param {Boolean} opts.isOnline the device status
     * @param {String} opts.spaceIds the space IDs to include
     * @param {String} opts.networkSwitchNames the network switch names to include
     * @param {String} opts.networkSwitchIpAddresses the network switch IP addresses
     * @param {Boolean} opts.onlyDevicesWithLldp only include devices with LLDP
     * @param {String} opts.sortDir the sort direction
     * @param {String} opts.sortBy the sort order
     * @param {Date} opts.minDiscoveredDate the minimum discovered date
     * @param {Date} opts.maxDiscoveredDate the maximum discovered date
     * @param {module:api/DevicesApi~devicesSearchCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/PaginatedListDevicesSearchResultDto}
     */
    this.devicesSearch = function(opts, callback) {
      opts = opts || {};
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
        'page': opts['page'],
        'pageSize': opts['pageSize'],
        'term': opts['term'],
        'types': opts['types'],
        'isOnline': opts['isOnline'],
        'spaceIds': opts['spaceIds'],
        'networkSwitchNames': opts['networkSwitchNames'],
        'networkSwitchIpAddresses': opts['networkSwitchIpAddresses'],
        'onlyDevicesWithLldp': opts['onlyDevicesWithLldp'],
        'sortDir': opts['sortDir'],
        'sortBy': opts['sortBy'],
        'minDiscoveredDate': opts['minDiscoveredDate'],
        'maxDiscoveredDate': opts['maxDiscoveredDate']
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = PaginatedListDevicesSearchResultDto;

      return this.apiClient.callApi(
        '/devices/search', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the devicesUnassigned operation.
     * @callback module:api/DevicesApi~devicesUnassignedCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDeviceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all devices that are not assigned to a space
     * @param {module:api/DevicesApi~devicesUnassignedCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDeviceDto}
     */
    this.devicesUnassigned = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDeviceDto;

      return this.apiClient.callApi(
        '/devices/unassigned', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/ListDtoDeviceDto":104,"../model/NodeDto":127,"../model/PaginatedListDevicesSearchResultDto":128,"../model/SpaceDto":132,"../model/UpdateDeviceDto":140}],17:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CreateDimmerDto', 'model/CreateDimmerEventDto', 'model/DimmerDto', 'model/ListDtoDimmerDto', 'model/ListDtoEventDto', 'model/UpdateDimmerDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CreateDimmerDto'), require('../model/CreateDimmerEventDto'), require('../model/DimmerDto'), require('../model/ListDtoDimmerDto'), require('../model/ListDtoEventDto'), require('../model/UpdateDimmerDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DimmersApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.CreateDimmerDto, root.GatewaySoftwareApi.CreateDimmerEventDto, root.GatewaySoftwareApi.DimmerDto, root.GatewaySoftwareApi.ListDtoDimmerDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.UpdateDimmerDto);
  }
}(this, function(ApiClient, CreateDimmerDto, CreateDimmerEventDto, DimmerDto, ListDtoDimmerDto, ListDtoEventDto, UpdateDimmerDto) {
  'use strict';

  /**
   * Dimmers service.
   * @module api/DimmersApi
   * @version v1
   */

  /**
   * Constructs a new DimmersApi. 
   * @alias module:api/DimmersApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the dimmersDelete operation.
     * @callback module:api/DimmersApi~dimmersDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a dimmer from the system
     * @param {Number} id the ID of the dimmer to be deleted
     * @param {module:api/DimmersApi~dimmersDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.dimmersDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling dimmersDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/dimmers/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the dimmersDiscover operation.
     * @callback module:api/DimmersApi~dimmersDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all dimmers in the system
     * @param {module:api/DimmersApi~dimmersDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.dimmersDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/dimmers/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the dimmersEventPost operation.
     * @callback module:api/DimmersApi~dimmersEventPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a dimmer event
     * @param {Number} id the ID of the dimmer
     * @param {module:model/CreateDimmerEventDto} event the event to be created
     * @param {module:api/DimmersApi~dimmersEventPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.dimmersEventPost = function(id, event, callback) {
      var postBody = event;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling dimmersEventPost");
      }

      // verify the required parameter 'event' is set
      if (event === undefined || event === null) {
        throw new Error("Missing the required parameter 'event' when calling dimmersEventPost");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/dimmers/{id}/events', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the dimmersGet operation.
     * @callback module:api/DimmersApi~dimmersGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDimmerDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all dimmers in the system
     * @param {module:api/DimmersApi~dimmersGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDimmerDto}
     */
    this.dimmersGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDimmerDto;

      return this.apiClient.callApi(
        '/dimmers', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the dimmersGetDimmer operation.
     * @callback module:api/DimmersApi~dimmersGetDimmerCallback
     * @param {String} error Error message, if any.
     * @param {module:model/DimmerDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a dimmer
     * @param {Number} id the ID of the dimmer to be retrieved
     * @param {module:api/DimmersApi~dimmersGetDimmerCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/DimmerDto}
     */
    this.dimmersGetDimmer = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling dimmersGetDimmer");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = DimmerDto;

      return this.apiClient.callApi(
        '/dimmers/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the dimmersGetEvents operation.
     * @callback module:api/DimmersApi~dimmersGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of dimmer events
     * @param {Number} id the ID of the dimmer
     * @param {module:api/DimmersApi~dimmersGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.dimmersGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling dimmersGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/dimmers/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the dimmersPost operation.
     * @callback module:api/DimmersApi~dimmersPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a dimmer
     * @param {module:model/CreateDimmerDto} dimmer the dimmer to be created
     * @param {module:api/DimmersApi~dimmersPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.dimmersPost = function(dimmer, callback) {
      var postBody = dimmer;

      // verify the required parameter 'dimmer' is set
      if (dimmer === undefined || dimmer === null) {
        throw new Error("Missing the required parameter 'dimmer' when calling dimmersPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/dimmers', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the dimmersPut operation.
     * @callback module:api/DimmersApi~dimmersPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a dimmer
     * @param {Number} id the ID of the dimmer to be updated
     * @param {module:model/UpdateDimmerDto} dimmer a dimmer containing the new values
     * @param {module:api/DimmersApi~dimmersPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.dimmersPut = function(id, dimmer, callback) {
      var postBody = dimmer;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling dimmersPut");
      }

      // verify the required parameter 'dimmer' is set
      if (dimmer === undefined || dimmer === null) {
        throw new Error("Missing the required parameter 'dimmer' when calling dimmersPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/dimmers/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/CreateDimmerDto":46,"../model/CreateDimmerEventDto":47,"../model/DimmerDto":87,"../model/ListDtoDimmerDto":106,"../model/ListDtoEventDto":107,"../model/UpdateDimmerDto":142}],18:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.HealthApi = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';

  /**
   * Health service.
   * @module api/HealthApi
   * @version v1
   */

  /**
   * Constructs a new HealthApi. 
   * @alias module:api/HealthApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the healthPing operation.
     * @callback module:api/HealthApi~healthPingCallback
     * @param {String} error Error message, if any.
     * @param {Object} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Allows checking if the lighting server is available
     * @param {module:api/HealthApi~healthPingCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link Object}
     */
    this.healthPing = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = Object;

      return this.apiClient.callApi(
        '/health/ping', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10}],19:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.LicensingApi = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';

  /**
   * Licensing service.
   * @module api/LicensingApi
   * @version v1
   */

  /**
   * Constructs a new LicensingApi. 
   * @alias module:api/LicensingApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the licensingRefreshLicense operation.
     * @callback module:api/LicensingApi~licensingRefreshLicenseCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * @param {module:api/LicensingApi~licensingRefreshLicenseCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.licensingRefreshLicense = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/licensing/refresh', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10}],20:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CreateLightSensorDto', 'model/CreateLightSensorEventDto', 'model/LightSensorDto', 'model/ListDtoEventDto', 'model/ListDtoLightSensorDto', 'model/UpdateLightSensorDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CreateLightSensorDto'), require('../model/CreateLightSensorEventDto'), require('../model/LightSensorDto'), require('../model/ListDtoEventDto'), require('../model/ListDtoLightSensorDto'), require('../model/UpdateLightSensorDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.LightSensorsApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.CreateLightSensorDto, root.GatewaySoftwareApi.CreateLightSensorEventDto, root.GatewaySoftwareApi.LightSensorDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.ListDtoLightSensorDto, root.GatewaySoftwareApi.UpdateLightSensorDto);
  }
}(this, function(ApiClient, CreateLightSensorDto, CreateLightSensorEventDto, LightSensorDto, ListDtoEventDto, ListDtoLightSensorDto, UpdateLightSensorDto) {
  'use strict';

  /**
   * LightSensors service.
   * @module api/LightSensorsApi
   * @version v1
   */

  /**
   * Constructs a new LightSensorsApi. 
   * @alias module:api/LightSensorsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the lightSensorsDelete operation.
     * @callback module:api/LightSensorsApi~lightSensorsDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a light sensor from the system
     * @param {Number} id the ID of the light sensor to be deleted
     * @param {module:api/LightSensorsApi~lightSensorsDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightSensorsDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightSensorsDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lightsensors/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightSensorsDiscover operation.
     * @callback module:api/LightSensorsApi~lightSensorsDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all light sensors in the system
     * @param {module:api/LightSensorsApi~lightSensorsDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightSensorsDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lightsensors/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightSensorsEventPost operation.
     * @callback module:api/LightSensorsApi~lightSensorsEventPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a light sensor event
     * @param {Number} id the ID of the light sensor
     * @param {module:model/CreateLightSensorEventDto} event the event to be created
     * @param {module:api/LightSensorsApi~lightSensorsEventPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightSensorsEventPost = function(id, event, callback) {
      var postBody = event;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightSensorsEventPost");
      }

      // verify the required parameter 'event' is set
      if (event === undefined || event === null) {
        throw new Error("Missing the required parameter 'event' when calling lightSensorsEventPost");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lightsensors/{id}/events', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightSensorsGet operation.
     * @callback module:api/LightSensorsApi~lightSensorsGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoLightSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all light sensors in the system
     * @param {module:api/LightSensorsApi~lightSensorsGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoLightSensorDto}
     */
    this.lightSensorsGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoLightSensorDto;

      return this.apiClient.callApi(
        '/lightsensors', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightSensorsGetEvents operation.
     * @callback module:api/LightSensorsApi~lightSensorsGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of light sensor events
     * @param {Number} id the ID of the light sensor
     * @param {module:api/LightSensorsApi~lightSensorsGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.lightSensorsGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightSensorsGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/lightsensors/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightSensorsGetLightSensor operation.
     * @callback module:api/LightSensorsApi~lightSensorsGetLightSensorCallback
     * @param {String} error Error message, if any.
     * @param {module:model/LightSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a light sensor
     * @param {Number} id the ID of the light sensor to be retrieved
     * @param {module:api/LightSensorsApi~lightSensorsGetLightSensorCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/LightSensorDto}
     */
    this.lightSensorsGetLightSensor = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightSensorsGetLightSensor");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = LightSensorDto;

      return this.apiClient.callApi(
        '/lightsensors/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightSensorsPost operation.
     * @callback module:api/LightSensorsApi~lightSensorsPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a light sensor
     * @param {module:model/CreateLightSensorDto} lightSensor the light sensor to be created
     * @param {module:api/LightSensorsApi~lightSensorsPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightSensorsPost = function(lightSensor, callback) {
      var postBody = lightSensor;

      // verify the required parameter 'lightSensor' is set
      if (lightSensor === undefined || lightSensor === null) {
        throw new Error("Missing the required parameter 'lightSensor' when calling lightSensorsPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/lightsensors', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightSensorsPut operation.
     * @callback module:api/LightSensorsApi~lightSensorsPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a light sensor
     * @param {Number} id the ID of the light sensor to be updated
     * @param {module:model/UpdateLightSensorDto} lightSensor a light sensor containing the new values
     * @param {module:api/LightSensorsApi~lightSensorsPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightSensorsPut = function(id, lightSensor, callback) {
      var postBody = lightSensor;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightSensorsPut");
      }

      // verify the required parameter 'lightSensor' is set
      if (lightSensor === undefined || lightSensor === null) {
        throw new Error("Missing the required parameter 'lightSensor' when calling lightSensorsPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lightsensors/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/CreateLightSensorDto":49,"../model/CreateLightSensorEventDto":50,"../model/LightSensorDto":95,"../model/ListDtoEventDto":107,"../model/ListDtoLightSensorDto":109,"../model/UpdateLightSensorDto":144}],21:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/BatchLightingListDto', 'model/CreateLightDto', 'model/EmergencyLightingSettingsDto', 'model/LightDto', 'model/LightingDto', 'model/ListDtoEventDto', 'model/ListDtoLightDto', 'model/UpdateLightDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/BatchLightingListDto'), require('../model/CreateLightDto'), require('../model/EmergencyLightingSettingsDto'), require('../model/LightDto'), require('../model/LightingDto'), require('../model/ListDtoEventDto'), require('../model/ListDtoLightDto'), require('../model/UpdateLightDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.LightsApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.BatchLightingListDto, root.GatewaySoftwareApi.CreateLightDto, root.GatewaySoftwareApi.EmergencyLightingSettingsDto, root.GatewaySoftwareApi.LightDto, root.GatewaySoftwareApi.LightingDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.ListDtoLightDto, root.GatewaySoftwareApi.UpdateLightDto);
  }
}(this, function(ApiClient, BatchLightingListDto, CreateLightDto, EmergencyLightingSettingsDto, LightDto, LightingDto, ListDtoEventDto, ListDtoLightDto, UpdateLightDto) {
  'use strict';

  /**
   * Lights service.
   * @module api/LightsApi
   * @version v1
   */

  /**
   * Constructs a new LightsApi. 
   * @alias module:api/LightsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the lightsBatchLighting operation.
     * @callback module:api/LightsApi~lightsBatchLightingCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Sets lighting on multiple lights
     * @param {module:model/BatchLightingListDto} lighting the ID and lighting settings for each light
     * @param {module:api/LightsApi~lightsBatchLightingCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsBatchLighting = function(lighting, callback) {
      var postBody = lighting;

      // verify the required parameter 'lighting' is set
      if (lighting === undefined || lighting === null) {
        throw new Error("Missing the required parameter 'lighting' when calling lightsBatchLighting");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights/lighting', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsDelete operation.
     * @callback module:api/LightsApi~lightsDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a light from the system
     * @param {Number} id the ID of the light to be deleted
     * @param {module:api/LightsApi~lightsDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightsDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsDeleteEmergencySettings operation.
     * @callback module:api/LightsApi~lightsDeleteEmergencySettingsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes emergency light settings from a light
     * @param {Number} id the ID of the light
     * @param {module:api/LightsApi~lightsDeleteEmergencySettingsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsDeleteEmergencySettings = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightsDeleteEmergencySettings");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights/{id}/emergency-settings', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsDiscover operation.
     * @callback module:api/LightsApi~lightsDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all lights in the system
     * @param {module:api/LightsApi~lightsDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsGet operation.
     * @callback module:api/LightsApi~lightsGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoLightDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all lights in the system
     * @param {module:api/LightsApi~lightsGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoLightDto}
     */
    this.lightsGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoLightDto;

      return this.apiClient.callApi(
        '/lights', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsGetEvents operation.
     * @callback module:api/LightsApi~lightsGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of light events
     * @param {Number} id the ID of the light
     * @param {module:api/LightsApi~lightsGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.lightsGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightsGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/lights/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsGetLight operation.
     * @callback module:api/LightsApi~lightsGetLightCallback
     * @param {String} error Error message, if any.
     * @param {module:model/LightDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a light
     * @param {Number} id the ID of the light to be retrieved
     * @param {module:api/LightsApi~lightsGetLightCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/LightDto}
     */
    this.lightsGetLight = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightsGetLight");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = LightDto;

      return this.apiClient.callApi(
        '/lights/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsLighting operation.
     * @callback module:api/LightsApi~lightsLightingCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Dims a light to a specified level
     * @param {Number} id the ID of the light to be dimmed
     * @param {module:model/LightingDto} lighting the new lighting settings for the light
     * @param {module:api/LightsApi~lightsLightingCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsLighting = function(id, lighting, callback) {
      var postBody = lighting;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightsLighting");
      }

      // verify the required parameter 'lighting' is set
      if (lighting === undefined || lighting === null) {
        throw new Error("Missing the required parameter 'lighting' when calling lightsLighting");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights/{id}/lighting', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsPost operation.
     * @callback module:api/LightsApi~lightsPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a light
     * @param {module:model/CreateLightDto} light the light to be created
     * @param {module:api/LightsApi~lightsPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsPost = function(light, callback) {
      var postBody = light;

      // verify the required parameter 'light' is set
      if (light === undefined || light === null) {
        throw new Error("Missing the required parameter 'light' when calling lightsPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsPostEmergencySettings operation.
     * @callback module:api/LightsApi~lightsPostEmergencySettingsCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Sets a light as an emergency light
     * @param {Number} id the ID of the light
     * @param {module:model/EmergencyLightingSettingsDto} settings the emergency light settings
     * @param {module:api/LightsApi~lightsPostEmergencySettingsCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsPostEmergencySettings = function(id, settings, callback) {
      var postBody = settings;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightsPostEmergencySettings");
      }

      // verify the required parameter 'settings' is set
      if (settings === undefined || settings === null) {
        throw new Error("Missing the required parameter 'settings' when calling lightsPostEmergencySettings");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights/{id}/emergency-settings', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsPut operation.
     * @callback module:api/LightsApi~lightsPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a light
     * @param {Number} id the ID of the light to be updated
     * @param {module:model/UpdateLightDto} light a light containing the new values
     * @param {module:api/LightsApi~lightsPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsPut = function(id, light, callback) {
      var postBody = light;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightsPut");
      }

      // verify the required parameter 'light' is set
      if (light === undefined || light === null) {
        throw new Error("Missing the required parameter 'light' when calling lightsPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsTurnOff operation.
     * @callback module:api/LightsApi~lightsTurnOffCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Turns off a light
     * @param {Number} id the ID of the light to be turned off
     * @param {module:api/LightsApi~lightsTurnOffCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsTurnOff = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightsTurnOff");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights/{id}/turnoff', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the lightsTurnOn operation.
     * @callback module:api/LightsApi~lightsTurnOnCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Turns on a light
     * @param {Number} id the ID of the light to be turned on
     * @param {module:api/LightsApi~lightsTurnOnCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.lightsTurnOn = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling lightsTurnOn");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/lights/{id}/turnon', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/BatchLightingListDto":41,"../model/CreateLightDto":48,"../model/EmergencyLightingSettingsDto":88,"../model/LightDto":94,"../model/LightingDto":96,"../model/ListDtoEventDto":107,"../model/ListDtoLightDto":108,"../model/UpdateLightDto":143}],22:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CreateMotionSensorDto', 'model/CreateMotionSensorEventDto', 'model/ListDtoEventDto', 'model/ListDtoMotionSensorDto', 'model/MotionSensorDto', 'model/UpdateMotionSensorDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CreateMotionSensorDto'), require('../model/CreateMotionSensorEventDto'), require('../model/ListDtoEventDto'), require('../model/ListDtoMotionSensorDto'), require('../model/MotionSensorDto'), require('../model/UpdateMotionSensorDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.MotionSensorsApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.CreateMotionSensorDto, root.GatewaySoftwareApi.CreateMotionSensorEventDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.ListDtoMotionSensorDto, root.GatewaySoftwareApi.MotionSensorDto, root.GatewaySoftwareApi.UpdateMotionSensorDto);
  }
}(this, function(ApiClient, CreateMotionSensorDto, CreateMotionSensorEventDto, ListDtoEventDto, ListDtoMotionSensorDto, MotionSensorDto, UpdateMotionSensorDto) {
  'use strict';

  /**
   * MotionSensors service.
   * @module api/MotionSensorsApi
   * @version v1
   */

  /**
   * Constructs a new MotionSensorsApi. 
   * @alias module:api/MotionSensorsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the motionSensorsDelete operation.
     * @callback module:api/MotionSensorsApi~motionSensorsDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a motion sensor from the system
     * @param {Number} id the ID of the motion sensor to be deleted
     * @param {module:api/MotionSensorsApi~motionSensorsDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.motionSensorsDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling motionSensorsDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/motionsensors/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the motionSensorsDiscover operation.
     * @callback module:api/MotionSensorsApi~motionSensorsDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all motion sensors in the system
     * @param {module:api/MotionSensorsApi~motionSensorsDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.motionSensorsDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/motionsensors/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the motionSensorsEventPost operation.
     * @callback module:api/MotionSensorsApi~motionSensorsEventPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a motion sensor event
     * @param {Number} id the ID of the motion sensor
     * @param {module:model/CreateMotionSensorEventDto} event the event to be created
     * @param {module:api/MotionSensorsApi~motionSensorsEventPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.motionSensorsEventPost = function(id, event, callback) {
      var postBody = event;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling motionSensorsEventPost");
      }

      // verify the required parameter 'event' is set
      if (event === undefined || event === null) {
        throw new Error("Missing the required parameter 'event' when calling motionSensorsEventPost");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/motionsensors/{id}/events', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the motionSensorsGet operation.
     * @callback module:api/MotionSensorsApi~motionSensorsGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoMotionSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all motion sensors in the system
     * @param {module:api/MotionSensorsApi~motionSensorsGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoMotionSensorDto}
     */
    this.motionSensorsGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoMotionSensorDto;

      return this.apiClient.callApi(
        '/motionsensors', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the motionSensorsGetEvents operation.
     * @callback module:api/MotionSensorsApi~motionSensorsGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of motion sensor events
     * @param {Number} id the ID of the motion sensor
     * @param {module:api/MotionSensorsApi~motionSensorsGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.motionSensorsGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling motionSensorsGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/motionsensors/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the motionSensorsGetMotionSensor operation.
     * @callback module:api/MotionSensorsApi~motionSensorsGetMotionSensorCallback
     * @param {String} error Error message, if any.
     * @param {module:model/MotionSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a motion sensor
     * @param {Number} id the ID of the motion sensor to be retrieved
     * @param {module:api/MotionSensorsApi~motionSensorsGetMotionSensorCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/MotionSensorDto}
     */
    this.motionSensorsGetMotionSensor = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling motionSensorsGetMotionSensor");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = MotionSensorDto;

      return this.apiClient.callApi(
        '/motionsensors/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the motionSensorsPost operation.
     * @callback module:api/MotionSensorsApi~motionSensorsPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a motion sensor
     * @param {module:model/CreateMotionSensorDto} motionSensor the motion sensor to be created
     * @param {module:api/MotionSensorsApi~motionSensorsPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.motionSensorsPost = function(motionSensor, callback) {
      var postBody = motionSensor;

      // verify the required parameter 'motionSensor' is set
      if (motionSensor === undefined || motionSensor === null) {
        throw new Error("Missing the required parameter 'motionSensor' when calling motionSensorsPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/motionsensors', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the motionSensorsPut operation.
     * @callback module:api/MotionSensorsApi~motionSensorsPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a motion sensor
     * @param {Number} id the ID of the motion sensor to be updated
     * @param {module:model/UpdateMotionSensorDto} motionSensor a motion sensor containing the new values
     * @param {module:api/MotionSensorsApi~motionSensorsPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.motionSensorsPut = function(id, motionSensor, callback) {
      var postBody = motionSensor;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling motionSensorsPut");
      }

      // verify the required parameter 'motionSensor' is set
      if (motionSensor === undefined || motionSensor === null) {
        throw new Error("Missing the required parameter 'motionSensor' when calling motionSensorsPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/motionsensors/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/CreateMotionSensorDto":51,"../model/CreateMotionSensorEventDto":52,"../model/ListDtoEventDto":107,"../model/ListDtoMotionSensorDto":110,"../model/MotionSensorDto":125,"../model/UpdateMotionSensorDto":145}],23:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CreateNetworkNodeDto', 'model/ListDtoDeviceDto', 'model/ListDtoDeviceNodeDto', 'model/ListDtoNodeDto', 'model/NodeDto', 'model/UpdateNetworkNodeDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CreateNetworkNodeDto'), require('../model/ListDtoDeviceDto'), require('../model/ListDtoDeviceNodeDto'), require('../model/ListDtoNodeDto'), require('../model/NodeDto'), require('../model/UpdateNetworkNodeDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.NetworkNodesApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.CreateNetworkNodeDto, root.GatewaySoftwareApi.ListDtoDeviceDto, root.GatewaySoftwareApi.ListDtoDeviceNodeDto, root.GatewaySoftwareApi.ListDtoNodeDto, root.GatewaySoftwareApi.NodeDto, root.GatewaySoftwareApi.UpdateNetworkNodeDto);
  }
}(this, function(ApiClient, CreateNetworkNodeDto, ListDtoDeviceDto, ListDtoDeviceNodeDto, ListDtoNodeDto, NodeDto, UpdateNetworkNodeDto) {
  'use strict';

  /**
   * NetworkNodes service.
   * @module api/NetworkNodesApi
   * @version v1
   */

  /**
   * Constructs a new NetworkNodesApi. 
   * @alias module:api/NetworkNodesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the networkNodesDelete operation.
     * @callback module:api/NetworkNodesApi~networkNodesDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a network node from the system
     * @param {Number} id the ID of the network node to be deleted
     * @param {module:api/NetworkNodesApi~networkNodesDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.networkNodesDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling networkNodesDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/networknodes/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the networkNodesDeleteAll operation.
     * @callback module:api/NetworkNodesApi~networkNodesDeleteAllCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * WARNING: Deletes all network nodes from the system.
     * @param {module:api/NetworkNodesApi~networkNodesDeleteAllCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.networkNodesDeleteAll = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/networknodes/deleteall', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the networkNodesDiscover operation.
     * @callback module:api/NetworkNodesApi~networkNodesDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all network nodes in the system
     * @param {module:api/NetworkNodesApi~networkNodesDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.networkNodesDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/networknodes/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the networkNodesGet operation.
     * @callback module:api/NetworkNodesApi~networkNodesGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoNodeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all network nodes in the system
     * @param {module:api/NetworkNodesApi~networkNodesGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoNodeDto}
     */
    this.networkNodesGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoNodeDto;

      return this.apiClient.callApi(
        '/networknodes', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the networkNodesGetDeviceNodes operation.
     * @callback module:api/NetworkNodesApi~networkNodesGetDeviceNodesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDeviceNodeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of device nodes attached to a network node
     * @param {Number} id the ID of the network node
     * @param {module:api/NetworkNodesApi~networkNodesGetDeviceNodesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDeviceNodeDto}
     */
    this.networkNodesGetDeviceNodes = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling networkNodesGetDeviceNodes");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDeviceNodeDto;

      return this.apiClient.callApi(
        '/networknodes/{id}/devicenodes', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the networkNodesGetDevices operation.
     * @callback module:api/NetworkNodesApi~networkNodesGetDevicesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDeviceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of devices attached to a network node
     * @param {Number} id the ID of the network node
     * @param {module:api/NetworkNodesApi~networkNodesGetDevicesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDeviceDto}
     */
    this.networkNodesGetDevices = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling networkNodesGetDevices");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDeviceDto;

      return this.apiClient.callApi(
        '/networknodes/{id}/devices', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the networkNodesGetNode operation.
     * @callback module:api/NetworkNodesApi~networkNodesGetNodeCallback
     * @param {String} error Error message, if any.
     * @param {module:model/NodeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a network node
     * @param {Number} id the ID of the network node to be retrieved
     * @param {module:api/NetworkNodesApi~networkNodesGetNodeCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/NodeDto}
     */
    this.networkNodesGetNode = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling networkNodesGetNode");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = NodeDto;

      return this.apiClient.callApi(
        '/networknodes/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the networkNodesPost operation.
     * @callback module:api/NetworkNodesApi~networkNodesPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a network node
     * @param {module:model/CreateNetworkNodeDto} networkNode the network node to be created
     * @param {module:api/NetworkNodesApi~networkNodesPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.networkNodesPost = function(networkNode, callback) {
      var postBody = networkNode;

      // verify the required parameter 'networkNode' is set
      if (networkNode === undefined || networkNode === null) {
        throw new Error("Missing the required parameter 'networkNode' when calling networkNodesPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/networknodes', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the networkNodesPut operation.
     * @callback module:api/NetworkNodesApi~networkNodesPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a network node
     * @param {Number} id the ID of the network node to be updated
     * @param {module:model/UpdateNetworkNodeDto} networkNode the updated values for the network node
     * @param {module:api/NetworkNodesApi~networkNodesPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.networkNodesPut = function(id, networkNode, callback) {
      var postBody = networkNode;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling networkNodesPut");
      }

      // verify the required parameter 'networkNode' is set
      if (networkNode === undefined || networkNode === null) {
        throw new Error("Missing the required parameter 'networkNode' when calling networkNodesPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/networknodes/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/CreateNetworkNodeDto":53,"../model/ListDtoDeviceDto":104,"../model/ListDtoDeviceNodeDto":105,"../model/ListDtoNodeDto":111,"../model/NodeDto":127,"../model/UpdateNetworkNodeDto":146}],24:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ListDtoPolicyDto', 'model/PolicyDto', 'model/UpdatePolicyDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/ListDtoPolicyDto'), require('../model/PolicyDto'), require('../model/UpdatePolicyDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.PoliciesApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ListDtoPolicyDto, root.GatewaySoftwareApi.PolicyDto, root.GatewaySoftwareApi.UpdatePolicyDto);
  }
}(this, function(ApiClient, ListDtoPolicyDto, PolicyDto, UpdatePolicyDto) {
  'use strict';

  /**
   * Policies service.
   * @module api/PoliciesApi
   * @version v1
   */

  /**
   * Constructs a new PoliciesApi. 
   * @alias module:api/PoliciesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the policiesGet operation.
     * @callback module:api/PoliciesApi~policiesGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoPolicyDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets all policies in the system
     * @param {module:api/PoliciesApi~policiesGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoPolicyDto}
     */
    this.policiesGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoPolicyDto;

      return this.apiClient.callApi(
        '/policies', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the policiesGetPolicy operation.
     * @callback module:api/PoliciesApi~policiesGetPolicyCallback
     * @param {String} error Error message, if any.
     * @param {module:model/PolicyDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a policy
     * @param {Number} id the ID of the policy to be retrieved
     * @param {module:api/PoliciesApi~policiesGetPolicyCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/PolicyDto}
     */
    this.policiesGetPolicy = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling policiesGetPolicy");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = PolicyDto;

      return this.apiClient.callApi(
        '/policies/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the policiesPut operation.
     * @callback module:api/PoliciesApi~policiesPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a policy
     * @param {Number} id the ID of the policy to be updated
     * @param {module:model/UpdatePolicyDto} policy the updated values for the policy
     * @param {module:api/PoliciesApi~policiesPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.policiesPut = function(id, policy, callback) {
      var postBody = policy;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling policiesPut");
      }

      // verify the required parameter 'policy' is set
      if (policy === undefined || policy === null) {
        throw new Error("Missing the required parameter 'policy' when calling policiesPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/policies/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/ListDtoPolicyDto":112,"../model/PolicyDto":129,"../model/UpdatePolicyDto":147}],25:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CreateRelayDto', 'model/ListDtoEventDto', 'model/ListDtoRelayDto', 'model/RelayDto', 'model/UpdateRelayDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CreateRelayDto'), require('../model/ListDtoEventDto'), require('../model/ListDtoRelayDto'), require('../model/RelayDto'), require('../model/UpdateRelayDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.RelaysApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.CreateRelayDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.ListDtoRelayDto, root.GatewaySoftwareApi.RelayDto, root.GatewaySoftwareApi.UpdateRelayDto);
  }
}(this, function(ApiClient, CreateRelayDto, ListDtoEventDto, ListDtoRelayDto, RelayDto, UpdateRelayDto) {
  'use strict';

  /**
   * Relays service.
   * @module api/RelaysApi
   * @version v1
   */

  /**
   * Constructs a new RelaysApi. 
   * @alias module:api/RelaysApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the relaysCloseRelay operation.
     * @callback module:api/RelaysApi~relaysCloseRelayCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Closes the relay
     * @param {Number} id the ID of the relay to be closed
     * @param {module:api/RelaysApi~relaysCloseRelayCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.relaysCloseRelay = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling relaysCloseRelay");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/relays/{id}/close', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the relaysDelete operation.
     * @callback module:api/RelaysApi~relaysDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a relay from the system
     * @param {Number} id the ID of the relay to be deleted
     * @param {module:api/RelaysApi~relaysDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.relaysDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling relaysDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/relays/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the relaysDiscover operation.
     * @callback module:api/RelaysApi~relaysDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all relays in the system
     * @param {module:api/RelaysApi~relaysDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.relaysDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/relays/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the relaysGet operation.
     * @callback module:api/RelaysApi~relaysGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoRelayDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all relays in the system
     * @param {module:api/RelaysApi~relaysGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoRelayDto}
     */
    this.relaysGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoRelayDto;

      return this.apiClient.callApi(
        '/relays', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the relaysGetEvents operation.
     * @callback module:api/RelaysApi~relaysGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of relay events
     * @param {Number} id the ID of the relay
     * @param {module:api/RelaysApi~relaysGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.relaysGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling relaysGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/relays/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the relaysGetRelay operation.
     * @callback module:api/RelaysApi~relaysGetRelayCallback
     * @param {String} error Error message, if any.
     * @param {module:model/RelayDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a relay
     * @param {Number} id the ID of the relay to be retrieved
     * @param {module:api/RelaysApi~relaysGetRelayCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/RelayDto}
     */
    this.relaysGetRelay = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling relaysGetRelay");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = RelayDto;

      return this.apiClient.callApi(
        '/relays/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the relaysOpenRelay operation.
     * @callback module:api/RelaysApi~relaysOpenRelayCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Opens the relay
     * @param {Number} id the ID of the relay to be opened
     * @param {module:api/RelaysApi~relaysOpenRelayCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.relaysOpenRelay = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling relaysOpenRelay");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/relays/{id}/open', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the relaysPost operation.
     * @callback module:api/RelaysApi~relaysPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a relay
     * @param {module:model/CreateRelayDto} relay the relay to be created
     * @param {module:api/RelaysApi~relaysPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.relaysPost = function(relay, callback) {
      var postBody = relay;

      // verify the required parameter 'relay' is set
      if (relay === undefined || relay === null) {
        throw new Error("Missing the required parameter 'relay' when calling relaysPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/relays', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the relaysPut operation.
     * @callback module:api/RelaysApi~relaysPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a relay
     * @param {Number} id the ID of the relay to be updated
     * @param {module:model/UpdateRelayDto} relay a relay containing the new values
     * @param {module:api/RelaysApi~relaysPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.relaysPut = function(id, relay, callback) {
      var postBody = relay;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling relaysPut");
      }

      // verify the required parameter 'relay' is set
      if (relay === undefined || relay === null) {
        throw new Error("Missing the required parameter 'relay' when calling relaysPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/relays/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/CreateRelayDto":55,"../model/ListDtoEventDto":107,"../model/ListDtoRelayDto":113,"../model/RelayDto":130,"../model/UpdateRelayDto":148}],26:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ActionSetDto', 'model/CreateScheduleDto', 'model/ListDtoEventDto', 'model/ListDtoScheduleDto', 'model/ScheduleDto', 'model/UpdateScheduleActionSetDto', 'model/UpdateScheduleDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/ActionSetDto'), require('../model/CreateScheduleDto'), require('../model/ListDtoEventDto'), require('../model/ListDtoScheduleDto'), require('../model/ScheduleDto'), require('../model/UpdateScheduleActionSetDto'), require('../model/UpdateScheduleDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.SchedulesApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ActionSetDto, root.GatewaySoftwareApi.CreateScheduleDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.ListDtoScheduleDto, root.GatewaySoftwareApi.ScheduleDto, root.GatewaySoftwareApi.UpdateScheduleActionSetDto, root.GatewaySoftwareApi.UpdateScheduleDto);
  }
}(this, function(ApiClient, ActionSetDto, CreateScheduleDto, ListDtoEventDto, ListDtoScheduleDto, ScheduleDto, UpdateScheduleActionSetDto, UpdateScheduleDto) {
  'use strict';

  /**
   * Schedules service.
   * @module api/SchedulesApi
   * @version v1
   */

  /**
   * Constructs a new SchedulesApi. 
   * @alias module:api/SchedulesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the schedulesDelete operation.
     * @callback module:api/SchedulesApi~schedulesDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a schedule from the system
     * @param {Number} id the ID of the schedule to be deleted
     * @param {module:api/SchedulesApi~schedulesDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.schedulesDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling schedulesDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/schedules/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the schedulesDeleteActionSet operation.
     * @callback module:api/SchedulesApi~schedulesDeleteActionSetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Unsets the action set assigned to the schedule
     * @param {Number} id the ID of the schedule
     * @param {module:api/SchedulesApi~schedulesDeleteActionSetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.schedulesDeleteActionSet = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling schedulesDeleteActionSet");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/schedules/{id}/actionset', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the schedulesGet operation.
     * @callback module:api/SchedulesApi~schedulesGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoScheduleDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of schedules in the system
     * @param {module:api/SchedulesApi~schedulesGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoScheduleDto}
     */
    this.schedulesGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoScheduleDto;

      return this.apiClient.callApi(
        '/schedules', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the schedulesGetActionSet operation.
     * @callback module:api/SchedulesApi~schedulesGetActionSetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ActionSetDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the action set assigned to the specified schedule
     * @param {Number} id the ID of schedule
     * @param {module:api/SchedulesApi~schedulesGetActionSetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ActionSetDto}
     */
    this.schedulesGetActionSet = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling schedulesGetActionSet");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ActionSetDto;

      return this.apiClient.callApi(
        '/schedules/{id}/actionset', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the schedulesGetEvents operation.
     * @callback module:api/SchedulesApi~schedulesGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of schedule events
     * @param {Number} id the ID of the schedule
     * @param {module:api/SchedulesApi~schedulesGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.schedulesGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling schedulesGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/schedules/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the schedulesGetSchedule operation.
     * @callback module:api/SchedulesApi~schedulesGetScheduleCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ScheduleDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a schedule
     * @param {Number} id the ID of the schedule to be retrieved
     * @param {module:api/SchedulesApi~schedulesGetScheduleCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ScheduleDto}
     */
    this.schedulesGetSchedule = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling schedulesGetSchedule");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ScheduleDto;

      return this.apiClient.callApi(
        '/schedules/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the schedulesPost operation.
     * @callback module:api/SchedulesApi~schedulesPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a schedule
     * @param {module:model/CreateScheduleDto} schedule the schedule to be created
     * @param {module:api/SchedulesApi~schedulesPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.schedulesPost = function(schedule, callback) {
      var postBody = schedule;

      // verify the required parameter 'schedule' is set
      if (schedule === undefined || schedule === null) {
        throw new Error("Missing the required parameter 'schedule' when calling schedulesPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/schedules', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the schedulesPut operation.
     * @callback module:api/SchedulesApi~schedulesPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a schedule
     * @param {Number} id the ID of the schedule to be updated
     * @param {module:model/UpdateScheduleDto} schedule the updated values for the schedule
     * @param {module:api/SchedulesApi~schedulesPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.schedulesPut = function(id, schedule, callback) {
      var postBody = schedule;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling schedulesPut");
      }

      // verify the required parameter 'schedule' is set
      if (schedule === undefined || schedule === null) {
        throw new Error("Missing the required parameter 'schedule' when calling schedulesPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/schedules/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the schedulesPutActionSet operation.
     * @callback module:api/SchedulesApi~schedulesPutActionSetCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Sets the action set assigned to the schedule
     * @param {Number} id the ID of the schedule
     * @param {module:model/UpdateScheduleActionSetDto} actionSet the action set
     * @param {module:api/SchedulesApi~schedulesPutActionSetCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.schedulesPutActionSet = function(id, actionSet, callback) {
      var postBody = actionSet;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling schedulesPutActionSet");
      }

      // verify the required parameter 'actionSet' is set
      if (actionSet === undefined || actionSet === null) {
        throw new Error("Missing the required parameter 'actionSet' when calling schedulesPutActionSet");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/schedules/{id}/actionset', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/ActionSetDto":35,"../model/CreateScheduleDto":56,"../model/ListDtoEventDto":107,"../model/ListDtoScheduleDto":114,"../model/ScheduleDto":131,"../model/UpdateScheduleActionSetDto":149,"../model/UpdateScheduleDto":150}],27:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ListDtoSpaceTypeDto', 'model/PolicyDto', 'model/SpaceTypeDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/ListDtoSpaceTypeDto'), require('../model/PolicyDto'), require('../model/SpaceTypeDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.SpaceTypesApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ListDtoSpaceTypeDto, root.GatewaySoftwareApi.PolicyDto, root.GatewaySoftwareApi.SpaceTypeDto);
  }
}(this, function(ApiClient, ListDtoSpaceTypeDto, PolicyDto, SpaceTypeDto) {
  'use strict';

  /**
   * SpaceTypes service.
   * @module api/SpaceTypesApi
   * @version v1
   */

  /**
   * Constructs a new SpaceTypesApi. 
   * @alias module:api/SpaceTypesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the spaceTypesGet operation.
     * @callback module:api/SpaceTypesApi~spaceTypesGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoSpaceTypeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of space types in the system
     * @param {module:api/SpaceTypesApi~spaceTypesGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoSpaceTypeDto}
     */
    this.spaceTypesGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoSpaceTypeDto;

      return this.apiClient.callApi(
        '/spacetypes', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spaceTypesGetPolicy operation.
     * @callback module:api/SpaceTypesApi~spaceTypesGetPolicyCallback
     * @param {String} error Error message, if any.
     * @param {module:model/PolicyDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the policy of a space type
     * @param {Number} id the ID of the space type
     * @param {module:api/SpaceTypesApi~spaceTypesGetPolicyCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/PolicyDto}
     */
    this.spaceTypesGetPolicy = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spaceTypesGetPolicy");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = PolicyDto;

      return this.apiClient.callApi(
        '/spacetypes/{id}/policy', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spaceTypesGetSpaceType operation.
     * @callback module:api/SpaceTypesApi~spaceTypesGetSpaceTypeCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SpaceTypeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a space type
     * @param {Number} id the ID of the space type to be retrieved
     * @param {module:api/SpaceTypesApi~spaceTypesGetSpaceTypeCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SpaceTypeDto}
     */
    this.spaceTypesGetSpaceType = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spaceTypesGetSpaceType");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = SpaceTypeDto;

      return this.apiClient.callApi(
        '/spacetypes/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/ListDtoSpaceTypeDto":116,"../model/PolicyDto":129,"../model/SpaceTypeDto":134}],28:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/AddDeviceToSpaceDto', 'model/CreatePolicyDto', 'model/CreateSpaceDto', 'model/CreateZoneDto', 'model/LightingDto', 'model/ListDtoActivePolicyValueDto', 'model/ListDtoDeviceDto', 'model/ListDtoDimmerDto', 'model/ListDtoEventDto', 'model/ListDtoLightDto', 'model/ListDtoLightSensorDto', 'model/ListDtoMotionSensorDto', 'model/ListDtoRelayDto', 'model/ListDtoSpaceDto', 'model/ListDtoSwitchDto', 'model/ListDtoTemperatureSensorDto', 'model/ListDtoZoneDto', 'model/PolicyDto', 'model/SpaceDto', 'model/SpaceTimerDto', 'model/SpaceTypeDto', 'model/UpdatePolicyDto', 'model/UpdateSpaceDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/AddDeviceToSpaceDto'), require('../model/CreatePolicyDto'), require('../model/CreateSpaceDto'), require('../model/CreateZoneDto'), require('../model/LightingDto'), require('../model/ListDtoActivePolicyValueDto'), require('../model/ListDtoDeviceDto'), require('../model/ListDtoDimmerDto'), require('../model/ListDtoEventDto'), require('../model/ListDtoLightDto'), require('../model/ListDtoLightSensorDto'), require('../model/ListDtoMotionSensorDto'), require('../model/ListDtoRelayDto'), require('../model/ListDtoSpaceDto'), require('../model/ListDtoSwitchDto'), require('../model/ListDtoTemperatureSensorDto'), require('../model/ListDtoZoneDto'), require('../model/PolicyDto'), require('../model/SpaceDto'), require('../model/SpaceTimerDto'), require('../model/SpaceTypeDto'), require('../model/UpdatePolicyDto'), require('../model/UpdateSpaceDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.SpacesApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.AddDeviceToSpaceDto, root.GatewaySoftwareApi.CreatePolicyDto, root.GatewaySoftwareApi.CreateSpaceDto, root.GatewaySoftwareApi.CreateZoneDto, root.GatewaySoftwareApi.LightingDto, root.GatewaySoftwareApi.ListDtoActivePolicyValueDto, root.GatewaySoftwareApi.ListDtoDeviceDto, root.GatewaySoftwareApi.ListDtoDimmerDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.ListDtoLightDto, root.GatewaySoftwareApi.ListDtoLightSensorDto, root.GatewaySoftwareApi.ListDtoMotionSensorDto, root.GatewaySoftwareApi.ListDtoRelayDto, root.GatewaySoftwareApi.ListDtoSpaceDto, root.GatewaySoftwareApi.ListDtoSwitchDto, root.GatewaySoftwareApi.ListDtoTemperatureSensorDto, root.GatewaySoftwareApi.ListDtoZoneDto, root.GatewaySoftwareApi.PolicyDto, root.GatewaySoftwareApi.SpaceDto, root.GatewaySoftwareApi.SpaceTimerDto, root.GatewaySoftwareApi.SpaceTypeDto, root.GatewaySoftwareApi.UpdatePolicyDto, root.GatewaySoftwareApi.UpdateSpaceDto);
  }
}(this, function(ApiClient, AddDeviceToSpaceDto, CreatePolicyDto, CreateSpaceDto, CreateZoneDto, LightingDto, ListDtoActivePolicyValueDto, ListDtoDeviceDto, ListDtoDimmerDto, ListDtoEventDto, ListDtoLightDto, ListDtoLightSensorDto, ListDtoMotionSensorDto, ListDtoRelayDto, ListDtoSpaceDto, ListDtoSwitchDto, ListDtoTemperatureSensorDto, ListDtoZoneDto, PolicyDto, SpaceDto, SpaceTimerDto, SpaceTypeDto, UpdatePolicyDto, UpdateSpaceDto) {
  'use strict';

  /**
   * Spaces service.
   * @module api/SpacesApi
   * @version v1
   */

  /**
   * Constructs a new SpacesApi. 
   * @alias module:api/SpacesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the spacesDelete operation.
     * @callback module:api/SpacesApi~spacesDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a space from the system
     * @param {Number} id the ID of the space to be deleted
     * @param {module:api/SpacesApi~spacesDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesDeleteDimmer operation.
     * @callback module:api/SpacesApi~spacesDeleteDimmerCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes a dimmer from a space
     * @param {Number} id the ID of the space
     * @param {Number} deviceId the ID of the dimmer to remove
     * @param {module:api/SpacesApi~spacesDeleteDimmerCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesDeleteDimmer = function(id, deviceId, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesDeleteDimmer");
      }

      // verify the required parameter 'deviceId' is set
      if (deviceId === undefined || deviceId === null) {
        throw new Error("Missing the required parameter 'deviceId' when calling spacesDeleteDimmer");
      }


      var pathParams = {
        'id': id,
        'deviceId': deviceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/dimmers/{deviceId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesDeleteLight operation.
     * @callback module:api/SpacesApi~spacesDeleteLightCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes a light from a space
     * @param {Number} id the ID of the space
     * @param {Number} deviceId the ID of the light to remove
     * @param {module:api/SpacesApi~spacesDeleteLightCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesDeleteLight = function(id, deviceId, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesDeleteLight");
      }

      // verify the required parameter 'deviceId' is set
      if (deviceId === undefined || deviceId === null) {
        throw new Error("Missing the required parameter 'deviceId' when calling spacesDeleteLight");
      }


      var pathParams = {
        'id': id,
        'deviceId': deviceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/lights/{deviceId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesDeleteLightSensor operation.
     * @callback module:api/SpacesApi~spacesDeleteLightSensorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes a light sensor from a space
     * @param {Number} id the ID of the space
     * @param {Number} deviceId the ID of the light sensor to remove
     * @param {module:api/SpacesApi~spacesDeleteLightSensorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesDeleteLightSensor = function(id, deviceId, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesDeleteLightSensor");
      }

      // verify the required parameter 'deviceId' is set
      if (deviceId === undefined || deviceId === null) {
        throw new Error("Missing the required parameter 'deviceId' when calling spacesDeleteLightSensor");
      }


      var pathParams = {
        'id': id,
        'deviceId': deviceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/lightsensors/{deviceId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesDeleteMotionSensor operation.
     * @callback module:api/SpacesApi~spacesDeleteMotionSensorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes a motion sensor from a space
     * @param {Number} id the ID of the space
     * @param {Number} deviceId the ID of the motion sensor to remove
     * @param {module:api/SpacesApi~spacesDeleteMotionSensorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesDeleteMotionSensor = function(id, deviceId, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesDeleteMotionSensor");
      }

      // verify the required parameter 'deviceId' is set
      if (deviceId === undefined || deviceId === null) {
        throw new Error("Missing the required parameter 'deviceId' when calling spacesDeleteMotionSensor");
      }


      var pathParams = {
        'id': id,
        'deviceId': deviceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/motionsensors/{deviceId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesDeletePolicy operation.
     * @callback module:api/SpacesApi~spacesDeletePolicyCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a policy for a space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesDeletePolicyCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesDeletePolicy = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesDeletePolicy");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/policy', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesDeleteRelay operation.
     * @callback module:api/SpacesApi~spacesDeleteRelayCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes a relay from a space
     * @param {Number} id the ID of the space
     * @param {Number} deviceId the ID of the relay to remove
     * @param {module:api/SpacesApi~spacesDeleteRelayCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesDeleteRelay = function(id, deviceId, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesDeleteRelay");
      }

      // verify the required parameter 'deviceId' is set
      if (deviceId === undefined || deviceId === null) {
        throw new Error("Missing the required parameter 'deviceId' when calling spacesDeleteRelay");
      }


      var pathParams = {
        'id': id,
        'deviceId': deviceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/relays/{deviceId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesDeleteSwitch operation.
     * @callback module:api/SpacesApi~spacesDeleteSwitchCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes a switch from a space
     * @param {Number} id the ID of the space
     * @param {Number} deviceId the ID of the switch to remove
     * @param {module:api/SpacesApi~spacesDeleteSwitchCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesDeleteSwitch = function(id, deviceId, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesDeleteSwitch");
      }

      // verify the required parameter 'deviceId' is set
      if (deviceId === undefined || deviceId === null) {
        throw new Error("Missing the required parameter 'deviceId' when calling spacesDeleteSwitch");
      }


      var pathParams = {
        'id': id,
        'deviceId': deviceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/switches/{deviceId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesDeleteTemperatureSensor operation.
     * @callback module:api/SpacesApi~spacesDeleteTemperatureSensorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes a temperature sensor from a space
     * @param {Number} id the ID of the space
     * @param {Number} deviceId the ID of the temperature sensor to remove
     * @param {module:api/SpacesApi~spacesDeleteTemperatureSensorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesDeleteTemperatureSensor = function(id, deviceId, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesDeleteTemperatureSensor");
      }

      // verify the required parameter 'deviceId' is set
      if (deviceId === undefined || deviceId === null) {
        throw new Error("Missing the required parameter 'deviceId' when calling spacesDeleteTemperatureSensor");
      }


      var pathParams = {
        'id': id,
        'deviceId': deviceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/temperaturesensors/{deviceId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGet operation.
     * @callback module:api/SpacesApi~spacesGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoSpaceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of spaces in the system
     * @param {module:api/SpacesApi~spacesGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoSpaceDto}
     */
    this.spacesGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoSpaceDto;

      return this.apiClient.callApi(
        '/spaces', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetActivePolicy operation.
     * @callback module:api/SpacesApi~spacesGetActivePolicyCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoActivePolicyValueDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of the active policy values for the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetActivePolicyCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoActivePolicyValueDto}
     */
    this.spacesGetActivePolicy = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetActivePolicy");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoActivePolicyValueDto;

      return this.apiClient.callApi(
        '/spaces/{id}/activepolicy', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetAllSpaceEvents operation.
     * @callback module:api/SpacesApi~spacesGetAllSpaceEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all events for the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetAllSpaceEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.spacesGetAllSpaceEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetAllSpaceEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/spaces/{id}/events/all', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetDevices operation.
     * @callback module:api/SpacesApi~spacesGetDevicesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDeviceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of devices contained in a space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetDevicesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDeviceDto}
     */
    this.spacesGetDevices = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetDevices");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDeviceDto;

      return this.apiClient.callApi(
        '/spaces/{id}/devices', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetDimmers operation.
     * @callback module:api/SpacesApi~spacesGetDimmersCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDimmerDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of dimmers in the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetDimmersCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDimmerDto}
     */
    this.spacesGetDimmers = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetDimmers");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDimmerDto;

      return this.apiClient.callApi(
        '/spaces/{id}/dimmers', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetLightSensors operation.
     * @callback module:api/SpacesApi~spacesGetLightSensorsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoLightSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of light sensors in the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetLightSensorsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoLightSensorDto}
     */
    this.spacesGetLightSensors = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetLightSensors");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoLightSensorDto;

      return this.apiClient.callApi(
        '/spaces/{id}/lightsensors', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetLights operation.
     * @callback module:api/SpacesApi~spacesGetLightsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoLightDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of lights in the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetLightsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoLightDto}
     */
    this.spacesGetLights = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetLights");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoLightDto;

      return this.apiClient.callApi(
        '/spaces/{id}/lights', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetMotionSensors operation.
     * @callback module:api/SpacesApi~spacesGetMotionSensorsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoMotionSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of motion sensors in the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetMotionSensorsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoMotionSensorDto}
     */
    this.spacesGetMotionSensors = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetMotionSensors");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoMotionSensorDto;

      return this.apiClient.callApi(
        '/spaces/{id}/motionsensors', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetRelays operation.
     * @callback module:api/SpacesApi~spacesGetRelaysCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoRelayDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of relays in the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetRelaysCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoRelayDto}
     */
    this.spacesGetRelays = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetRelays");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoRelayDto;

      return this.apiClient.callApi(
        '/spaces/{id}/relays', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetSpace operation.
     * @callback module:api/SpacesApi~spacesGetSpaceCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SpaceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a space
     * @param {Number} id the ID of the space to be retrieved
     * @param {module:api/SpacesApi~spacesGetSpaceCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SpaceDto}
     */
    this.spacesGetSpace = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetSpace");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = SpaceDto;

      return this.apiClient.callApi(
        '/spaces/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetSpaceEvents operation.
     * @callback module:api/SpacesApi~spacesGetSpaceEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of recent events for the space.
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetSpaceEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.spacesGetSpaceEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetSpaceEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/spaces/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetSpacePolicy operation.
     * @callback module:api/SpacesApi~spacesGetSpacePolicyCallback
     * @param {String} error Error message, if any.
     * @param {module:model/PolicyDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a policy for a space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetSpacePolicyCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/PolicyDto}
     */
    this.spacesGetSpacePolicy = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetSpacePolicy");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = PolicyDto;

      return this.apiClient.callApi(
        '/spaces/{id}/policy', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetSwitches operation.
     * @callback module:api/SpacesApi~spacesGetSwitchesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoSwitchDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of switches in the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetSwitchesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoSwitchDto}
     */
    this.spacesGetSwitches = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetSwitches");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoSwitchDto;

      return this.apiClient.callApi(
        '/spaces/{id}/switches', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetTemperatureSensors operation.
     * @callback module:api/SpacesApi~spacesGetTemperatureSensorsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoTemperatureSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of temperature sensors contained in a space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetTemperatureSensorsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoTemperatureSensorDto}
     */
    this.spacesGetTemperatureSensors = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetTemperatureSensors");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoTemperatureSensorDto;

      return this.apiClient.callApi(
        '/spaces/{id}/temperaturesensors', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetTimer operation.
     * @callback module:api/SpacesApi~spacesGetTimerCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SpaceTimerDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the vacancy timer for the space if one exists
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetTimerCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SpaceTimerDto}
     */
    this.spacesGetTimer = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetTimer");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = SpaceTimerDto;

      return this.apiClient.callApi(
        '/spaces/{id}/timer', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetType operation.
     * @callback module:api/SpacesApi~spacesGetTypeCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SpaceTypeDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the type of the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetTypeCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SpaceTypeDto}
     */
    this.spacesGetType = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetType");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = SpaceTypeDto;

      return this.apiClient.callApi(
        '/spaces/{id}/spacetype', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesGetZones operation.
     * @callback module:api/SpacesApi~spacesGetZonesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoZoneDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of zones contained in a space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesGetZonesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoZoneDto}
     */
    this.spacesGetZones = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesGetZones");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoZoneDto;

      return this.apiClient.callApi(
        '/spaces/{id}/zones', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesLighting operation.
     * @callback module:api/SpacesApi~spacesLightingCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Sets the level of the lights in a space
     * @param {Number} id the ID of the space
     * @param {module:model/LightingDto} lighting the lighting values to use for the space
     * @param {module:api/SpacesApi~spacesLightingCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesLighting = function(id, lighting, callback) {
      var postBody = lighting;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesLighting");
      }

      // verify the required parameter 'lighting' is set
      if (lighting === undefined || lighting === null) {
        throw new Error("Missing the required parameter 'lighting' when calling spacesLighting");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/lighting', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPost operation.
     * @callback module:api/SpacesApi~spacesPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a space
     * @param {module:model/CreateSpaceDto} space the space to be created
     * @param {module:api/SpacesApi~spacesPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPost = function(space, callback) {
      var postBody = space;

      // verify the required parameter 'space' is set
      if (space === undefined || space === null) {
        throw new Error("Missing the required parameter 'space' when calling spacesPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPostClearZoneConfig operation.
     * @callback module:api/SpacesApi~spacesPostClearZoneConfigCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Exits the zone configuration mode for the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesPostClearZoneConfigCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPostClearZoneConfig = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesPostClearZoneConfig");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/zones/config/exit', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPostPolicy operation.
     * @callback module:api/SpacesApi~spacesPostPolicyCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a policy for a space
     * @param {Number} id the ID of the space
     * @param {module:model/CreatePolicyDto} policy the policy to be created for the space
     * @param {module:api/SpacesApi~spacesPostPolicyCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPostPolicy = function(id, policy, callback) {
      var postBody = policy;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesPostPolicy");
      }

      // verify the required parameter 'policy' is set
      if (policy === undefined || policy === null) {
        throw new Error("Missing the required parameter 'policy' when calling spacesPostPolicy");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/policy', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPostSaveZoneConfig operation.
     * @callback module:api/SpacesApi~spacesPostSaveZoneConfigCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Saves the zone configuration
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesPostSaveZoneConfigCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPostSaveZoneConfig = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesPostSaveZoneConfig");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/zones/config/save', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPostSetZoneConfig operation.
     * @callback module:api/SpacesApi~spacesPostSetZoneConfigCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Enters the zone configuration mode for the space
     * @param {Number} id the ID of the space
     * @param {module:api/SpacesApi~spacesPostSetZoneConfigCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPostSetZoneConfig = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesPostSetZoneConfig");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/zones/config/enter', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPostZone operation.
     * @callback module:api/SpacesApi~spacesPostZoneCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a new zone within a space
     * @param {Number} id the ID of the space
     * @param {module:model/CreateZoneDto} zone the zone to be created
     * @param {module:api/SpacesApi~spacesPostZoneCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPostZone = function(id, zone, callback) {
      var postBody = zone;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesPostZone");
      }

      // verify the required parameter 'zone' is set
      if (zone === undefined || zone === null) {
        throw new Error("Missing the required parameter 'zone' when calling spacesPostZone");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/zones', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPut operation.
     * @callback module:api/SpacesApi~spacesPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a space
     * @param {Number} id the ID of the space to be updated
     * @param {module:model/UpdateSpaceDto} space the updated values for the space
     * @param {module:api/SpacesApi~spacesPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPut = function(id, space, callback) {
      var postBody = space;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesPut");
      }

      // verify the required parameter 'space' is set
      if (space === undefined || space === null) {
        throw new Error("Missing the required parameter 'space' when calling spacesPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPutDevices operation.
     * @callback module:api/SpacesApi~spacesPutDevicesCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Adds a device to a space
     * @param {Number} id the ID of the space
     * @param {module:model/AddDeviceToSpaceDto} device the device to be added to the space and a value indicting which attached devices to include
     * @param {module:api/SpacesApi~spacesPutDevicesCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPutDevices = function(id, device, callback) {
      var postBody = device;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesPutDevices");
      }

      // verify the required parameter 'device' is set
      if (device === undefined || device === null) {
        throw new Error("Missing the required parameter 'device' when calling spacesPutDevices");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/devices', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPutPolicy operation.
     * @callback module:api/SpacesApi~spacesPutPolicyCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a policy for a space
     * @param {Number} id the ID of the space
     * @param {module:model/UpdatePolicyDto} policy the policy to be updated
     * @param {module:api/SpacesApi~spacesPutPolicyCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPutPolicy = function(id, policy, callback) {
      var postBody = policy;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesPutPolicy");
      }

      // verify the required parameter 'policy' is set
      if (policy === undefined || policy === null) {
        throw new Error("Missing the required parameter 'policy' when calling spacesPutPolicy");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/policy', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesPutType operation.
     * @callback module:api/SpacesApi~spacesPutTypeCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Sets the type of the space
     * @param {Number} id the ID of the space
     * @param {module:model/SpaceTypeDto} spaceType the space type to be set
     * @param {module:api/SpacesApi~spacesPutTypeCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesPutType = function(id, spaceType, callback) {
      var postBody = spaceType;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesPutType");
      }

      // verify the required parameter 'spaceType' is set
      if (spaceType === undefined || spaceType === null) {
        throw new Error("Missing the required parameter 'spaceType' when calling spacesPutType");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/spacetype', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesSynchronize operation.
     * @callback module:api/SpacesApi~spacesSynchronizeCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Synchronizes the state of all lights with the state of their space
     * @param {module:api/SpacesApi~spacesSynchronizeCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesSynchronize = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/synchronize', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesTurnOff operation.
     * @callback module:api/SpacesApi~spacesTurnOffCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Turns off all lights in a space
     * @param {Number} id the ID of the space to be turned off
     * @param {module:api/SpacesApi~spacesTurnOffCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesTurnOff = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesTurnOff");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/turnoff', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the spacesTurnOn operation.
     * @callback module:api/SpacesApi~spacesTurnOnCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Turns on all lights in a space
     * @param {Number} id the ID of the space to be turned on
     * @param {module:api/SpacesApi~spacesTurnOnCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.spacesTurnOn = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling spacesTurnOn");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/spaces/{id}/turnon', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/AddDeviceToSpaceDto":37,"../model/CreatePolicyDto":54,"../model/CreateSpaceDto":57,"../model/CreateZoneDto":63,"../model/LightingDto":96,"../model/ListDtoActivePolicyValueDto":99,"../model/ListDtoDeviceDto":104,"../model/ListDtoDimmerDto":106,"../model/ListDtoEventDto":107,"../model/ListDtoLightDto":108,"../model/ListDtoLightSensorDto":109,"../model/ListDtoMotionSensorDto":110,"../model/ListDtoRelayDto":113,"../model/ListDtoSpaceDto":115,"../model/ListDtoSwitchDto":118,"../model/ListDtoTemperatureSensorDto":119,"../model/ListDtoZoneDto":121,"../model/PolicyDto":129,"../model/SpaceDto":132,"../model/SpaceTimerDto":133,"../model/SpaceTypeDto":134,"../model/UpdatePolicyDto":147,"../model/UpdateSpaceDto":151}],29:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CreateSwitchDto', 'model/CreateSwitchEventDto', 'model/ListDtoEventDto', 'model/ListDtoSwitchDto', 'model/SwitchDto', 'model/UpdateSwitchDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CreateSwitchDto'), require('../model/CreateSwitchEventDto'), require('../model/ListDtoEventDto'), require('../model/ListDtoSwitchDto'), require('../model/SwitchDto'), require('../model/UpdateSwitchDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.SwitchesApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.CreateSwitchDto, root.GatewaySoftwareApi.CreateSwitchEventDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.ListDtoSwitchDto, root.GatewaySoftwareApi.SwitchDto, root.GatewaySoftwareApi.UpdateSwitchDto);
  }
}(this, function(ApiClient, CreateSwitchDto, CreateSwitchEventDto, ListDtoEventDto, ListDtoSwitchDto, SwitchDto, UpdateSwitchDto) {
  'use strict';

  /**
   * Switches service.
   * @module api/SwitchesApi
   * @version v1
   */

  /**
   * Constructs a new SwitchesApi. 
   * @alias module:api/SwitchesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the switchesDelete operation.
     * @callback module:api/SwitchesApi~switchesDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a switch from the system
     * @param {Number} id the ID of the switch to be deleted
     * @param {module:api/SwitchesApi~switchesDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.switchesDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling switchesDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/switches/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the switchesDiscover operation.
     * @callback module:api/SwitchesApi~switchesDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all switches in the system
     * @param {module:api/SwitchesApi~switchesDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.switchesDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/switches/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the switchesEventPost operation.
     * @callback module:api/SwitchesApi~switchesEventPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a switch event
     * @param {Number} id the ID of the switch
     * @param {module:model/CreateSwitchEventDto} event the event to be created
     * @param {module:api/SwitchesApi~switchesEventPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.switchesEventPost = function(id, event, callback) {
      var postBody = event;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling switchesEventPost");
      }

      // verify the required parameter 'event' is set
      if (event === undefined || event === null) {
        throw new Error("Missing the required parameter 'event' when calling switchesEventPost");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/switches/{id}/events', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the switchesGet operation.
     * @callback module:api/SwitchesApi~switchesGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoSwitchDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all switches in the system
     * @param {module:api/SwitchesApi~switchesGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoSwitchDto}
     */
    this.switchesGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoSwitchDto;

      return this.apiClient.callApi(
        '/switches', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the switchesGetEvents operation.
     * @callback module:api/SwitchesApi~switchesGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of switch events
     * @param {Number} id the ID of the switch
     * @param {module:api/SwitchesApi~switchesGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.switchesGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling switchesGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/switches/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the switchesGetSwitch operation.
     * @callback module:api/SwitchesApi~switchesGetSwitchCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SwitchDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a switch
     * @param {Number} id the ID of the switch to be retrieved
     * @param {module:api/SwitchesApi~switchesGetSwitchCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SwitchDto}
     */
    this.switchesGetSwitch = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling switchesGetSwitch");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = SwitchDto;

      return this.apiClient.callApi(
        '/switches/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the switchesPost operation.
     * @callback module:api/SwitchesApi~switchesPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a switch
     * @param {module:model/CreateSwitchDto} _switch the switch to be created
     * @param {module:api/SwitchesApi~switchesPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.switchesPost = function(_switch, callback) {
      var postBody = _switch;

      // verify the required parameter '_switch' is set
      if (_switch === undefined || _switch === null) {
        throw new Error("Missing the required parameter '_switch' when calling switchesPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/switches', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the switchesPut operation.
     * @callback module:api/SwitchesApi~switchesPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a switch
     * @param {Number} id the ID of the switch to be updated
     * @param {module:model/UpdateSwitchDto} _switch a switch containing the new values
     * @param {module:api/SwitchesApi~switchesPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.switchesPut = function(id, _switch, callback) {
      var postBody = _switch;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling switchesPut");
      }

      // verify the required parameter '_switch' is set
      if (_switch === undefined || _switch === null) {
        throw new Error("Missing the required parameter '_switch' when calling switchesPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/switches/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/CreateSwitchDto":58,"../model/CreateSwitchEventDto":59,"../model/ListDtoEventDto":107,"../model/ListDtoSwitchDto":118,"../model/SwitchDto":135,"../model/UpdateSwitchDto":152}],30:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CreateTemperatureSensorDto', 'model/CreateTemperatureSensorEventDto', 'model/ListDtoEventDto', 'model/ListDtoTemperatureSensorDto', 'model/TemperatureSensorDto', 'model/UpdateTemperatureSensorDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CreateTemperatureSensorDto'), require('../model/CreateTemperatureSensorEventDto'), require('../model/ListDtoEventDto'), require('../model/ListDtoTemperatureSensorDto'), require('../model/TemperatureSensorDto'), require('../model/UpdateTemperatureSensorDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.TemperatureSensorsApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.CreateTemperatureSensorDto, root.GatewaySoftwareApi.CreateTemperatureSensorEventDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.ListDtoTemperatureSensorDto, root.GatewaySoftwareApi.TemperatureSensorDto, root.GatewaySoftwareApi.UpdateTemperatureSensorDto);
  }
}(this, function(ApiClient, CreateTemperatureSensorDto, CreateTemperatureSensorEventDto, ListDtoEventDto, ListDtoTemperatureSensorDto, TemperatureSensorDto, UpdateTemperatureSensorDto) {
  'use strict';

  /**
   * TemperatureSensors service.
   * @module api/TemperatureSensorsApi
   * @version v1
   */

  /**
   * Constructs a new TemperatureSensorsApi. 
   * @alias module:api/TemperatureSensorsApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the temperatureSensorsDelete operation.
     * @callback module:api/TemperatureSensorsApi~temperatureSensorsDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a temperature sensor from the system
     * @param {Number} id the ID of the temperature sensor to be deleted
     * @param {module:api/TemperatureSensorsApi~temperatureSensorsDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.temperatureSensorsDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling temperatureSensorsDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/temperaturesensors/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the temperatureSensorsDiscover operation.
     * @callback module:api/TemperatureSensorsApi~temperatureSensorsDiscoverCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Discovers all temperature sensors in the system
     * @param {module:api/TemperatureSensorsApi~temperatureSensorsDiscoverCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.temperatureSensorsDiscover = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/temperaturesensors/discover', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the temperatureSensorsEventPost operation.
     * @callback module:api/TemperatureSensorsApi~temperatureSensorsEventPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a temperature sensor event
     * @param {Number} id the ID of the temperature sensor
     * @param {module:model/CreateTemperatureSensorEventDto} event the event to be created
     * @param {module:api/TemperatureSensorsApi~temperatureSensorsEventPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.temperatureSensorsEventPost = function(id, event, callback) {
      var postBody = event;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling temperatureSensorsEventPost");
      }

      // verify the required parameter 'event' is set
      if (event === undefined || event === null) {
        throw new Error("Missing the required parameter 'event' when calling temperatureSensorsEventPost");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/temperaturesensors/{id}/events', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the temperatureSensorsGet operation.
     * @callback module:api/TemperatureSensorsApi~temperatureSensorsGetCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoTemperatureSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all temperature sensors in the system
     * @param {module:api/TemperatureSensorsApi~temperatureSensorsGetCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoTemperatureSensorDto}
     */
    this.temperatureSensorsGet = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoTemperatureSensorDto;

      return this.apiClient.callApi(
        '/temperaturesensors', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the temperatureSensorsGetEvents operation.
     * @callback module:api/TemperatureSensorsApi~temperatureSensorsGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of temperature sensor events
     * @param {Number} id the ID of the temperature sensor
     * @param {module:api/TemperatureSensorsApi~temperatureSensorsGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.temperatureSensorsGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling temperatureSensorsGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/temperaturesensors/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the temperatureSensorsGetTemperatureSensor operation.
     * @callback module:api/TemperatureSensorsApi~temperatureSensorsGetTemperatureSensorCallback
     * @param {String} error Error message, if any.
     * @param {module:model/TemperatureSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a temperature sensor
     * @param {Number} id the ID of the temperature sensor to be retrieved
     * @param {module:api/TemperatureSensorsApi~temperatureSensorsGetTemperatureSensorCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/TemperatureSensorDto}
     */
    this.temperatureSensorsGetTemperatureSensor = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling temperatureSensorsGetTemperatureSensor");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = TemperatureSensorDto;

      return this.apiClient.callApi(
        '/temperaturesensors/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the temperatureSensorsPost operation.
     * @callback module:api/TemperatureSensorsApi~temperatureSensorsPostCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Creates a temperature sensor
     * @param {module:model/CreateTemperatureSensorDto} temperatureSensor the temperature sensor to be created
     * @param {module:api/TemperatureSensorsApi~temperatureSensorsPostCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.temperatureSensorsPost = function(temperatureSensor, callback) {
      var postBody = temperatureSensor;

      // verify the required parameter 'temperatureSensor' is set
      if (temperatureSensor === undefined || temperatureSensor === null) {
        throw new Error("Missing the required parameter 'temperatureSensor' when calling temperatureSensorsPost");
      }


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/temperaturesensors', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the temperatureSensorsPut operation.
     * @callback module:api/TemperatureSensorsApi~temperatureSensorsPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a temperature sensor
     * @param {Number} id the ID of the temperature sensor to be updated
     * @param {module:model/UpdateTemperatureSensorDto} temperatureSensor a temperature sensor containing the new values
     * @param {module:api/TemperatureSensorsApi~temperatureSensorsPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.temperatureSensorsPut = function(id, temperatureSensor, callback) {
      var postBody = temperatureSensor;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling temperatureSensorsPut");
      }

      // verify the required parameter 'temperatureSensor' is set
      if (temperatureSensor === undefined || temperatureSensor === null) {
        throw new Error("Missing the required parameter 'temperatureSensor' when calling temperatureSensorsPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/temperaturesensors/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/CreateTemperatureSensorDto":60,"../model/CreateTemperatureSensorEventDto":61,"../model/ListDtoEventDto":107,"../model/ListDtoTemperatureSensorDto":119,"../model/TemperatureSensorDto":136,"../model/UpdateTemperatureSensorDto":153}],31:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/CreateWebHookDto', 'model/ListDtoString', 'model/ListDtoWebHookDto', 'model/UpdateWebHookDto', 'model/WebHookDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/CreateWebHookDto'), require('../model/ListDtoString'), require('../model/ListDtoWebHookDto'), require('../model/UpdateWebHookDto'), require('../model/WebHookDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.WebHooksApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.CreateWebHookDto, root.GatewaySoftwareApi.ListDtoString, root.GatewaySoftwareApi.ListDtoWebHookDto, root.GatewaySoftwareApi.UpdateWebHookDto, root.GatewaySoftwareApi.WebHookDto);
  }
}(this, function(ApiClient, CreateWebHookDto, ListDtoString, ListDtoWebHookDto, UpdateWebHookDto, WebHookDto) {
  'use strict';

  /**
   * WebHooks service.
   * @module api/WebHooksApi
   * @version v1
   */

  /**
   * Constructs a new WebHooksApi. 
   * @alias module:api/WebHooksApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the webHooksDelete operation.
     * @callback module:api/WebHooksApi~webHooksDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Unregisters a web hook
     * @param {Number} applicationKeyId the ID of the application key
     * @param {Number} webHookId the ID of the web hook
     * @param {module:api/WebHooksApi~webHooksDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.webHooksDelete = function(applicationKeyId, webHookId, callback) {
      var postBody = null;

      // verify the required parameter 'applicationKeyId' is set
      if (applicationKeyId === undefined || applicationKeyId === null) {
        throw new Error("Missing the required parameter 'applicationKeyId' when calling webHooksDelete");
      }

      // verify the required parameter 'webHookId' is set
      if (webHookId === undefined || webHookId === null) {
        throw new Error("Missing the required parameter 'webHookId' when calling webHooksDelete");
      }


      var pathParams = {
        'applicationKeyId': applicationKeyId,
        'webHookId': webHookId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/applicationkeys/{applicationKeyId}/webhooks/{webHookId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the webHooksGetAll operation.
     * @callback module:api/WebHooksApi~webHooksGetAllCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoWebHookDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of all web hooks in the system
     * @param {Number} applicationKeyId the ID of the application key
     * @param {module:api/WebHooksApi~webHooksGetAllCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoWebHookDto}
     */
    this.webHooksGetAll = function(applicationKeyId, callback) {
      var postBody = null;

      // verify the required parameter 'applicationKeyId' is set
      if (applicationKeyId === undefined || applicationKeyId === null) {
        throw new Error("Missing the required parameter 'applicationKeyId' when calling webHooksGetAll");
      }


      var pathParams = {
        'applicationKeyId': applicationKeyId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoWebHookDto;

      return this.apiClient.callApi(
        '/applicationkeys/{applicationKeyId}/webhooks', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the webHooksGetById operation.
     * @callback module:api/WebHooksApi~webHooksGetByIdCallback
     * @param {String} error Error message, if any.
     * @param {module:model/WebHookDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a web hook
     * @param {Number} applicationKeyId the ID of the application key
     * @param {Number} webHookId the ID of the web hook
     * @param {module:api/WebHooksApi~webHooksGetByIdCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/WebHookDto}
     */
    this.webHooksGetById = function(applicationKeyId, webHookId, callback) {
      var postBody = null;

      // verify the required parameter 'applicationKeyId' is set
      if (applicationKeyId === undefined || applicationKeyId === null) {
        throw new Error("Missing the required parameter 'applicationKeyId' when calling webHooksGetById");
      }

      // verify the required parameter 'webHookId' is set
      if (webHookId === undefined || webHookId === null) {
        throw new Error("Missing the required parameter 'webHookId' when calling webHooksGetById");
      }


      var pathParams = {
        'applicationKeyId': applicationKeyId,
        'webHookId': webHookId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = WebHookDto;

      return this.apiClient.callApi(
        '/applicationkeys/{applicationKeyId}/webhooks/{webHookId}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the webHooksRegister operation.
     * @callback module:api/WebHooksApi~webHooksRegisterCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Registers a web hook
     * @param {Number} applicationKeyId the ID of the application key
     * @param {module:model/CreateWebHookDto} webHook the web hook to register
     * @param {module:api/WebHooksApi~webHooksRegisterCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.webHooksRegister = function(applicationKeyId, webHook, callback) {
      var postBody = webHook;

      // verify the required parameter 'applicationKeyId' is set
      if (applicationKeyId === undefined || applicationKeyId === null) {
        throw new Error("Missing the required parameter 'applicationKeyId' when calling webHooksRegister");
      }

      // verify the required parameter 'webHook' is set
      if (webHook === undefined || webHook === null) {
        throw new Error("Missing the required parameter 'webHook' when calling webHooksRegister");
      }


      var pathParams = {
        'applicationKeyId': applicationKeyId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = ['application/json', 'text/json'];
      var returnType = null;

      return this.apiClient.callApi(
        '/applicationkeys/{applicationKeyId}/webhooks', 'POST',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the webHooksSupportedEvents operation.
     * @callback module:api/WebHooksApi~webHooksSupportedEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoString} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of supported web hook events
     * @param {module:api/WebHooksApi~webHooksSupportedEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoString}
     */
    this.webHooksSupportedEvents = function(callback) {
      var postBody = null;


      var pathParams = {
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoString;

      return this.apiClient.callApi(
        '/webhooks/supported-events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the webHooksUpdate operation.
     * @callback module:api/WebHooksApi~webHooksUpdateCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a web hook
     * @param {Number} applicationKeyId the ID of the application key
     * @param {Number} webHookId the ID of the web hook
     * @param {module:model/UpdateWebHookDto} webHook a web hook containing the new values
     * @param {module:api/WebHooksApi~webHooksUpdateCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.webHooksUpdate = function(applicationKeyId, webHookId, webHook, callback) {
      var postBody = webHook;

      // verify the required parameter 'applicationKeyId' is set
      if (applicationKeyId === undefined || applicationKeyId === null) {
        throw new Error("Missing the required parameter 'applicationKeyId' when calling webHooksUpdate");
      }

      // verify the required parameter 'webHookId' is set
      if (webHookId === undefined || webHookId === null) {
        throw new Error("Missing the required parameter 'webHookId' when calling webHooksUpdate");
      }

      // verify the required parameter 'webHook' is set
      if (webHook === undefined || webHook === null) {
        throw new Error("Missing the required parameter 'webHook' when calling webHooksUpdate");
      }


      var pathParams = {
        'applicationKeyId': applicationKeyId,
        'webHookId': webHookId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/applicationkeys/{applicationKeyId}/webhooks/{webHookId}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/CreateWebHookDto":62,"../model/ListDtoString":117,"../model/ListDtoWebHookDto":120,"../model/UpdateWebHookDto":154,"../model/WebHookDto":157}],32:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/AddDeviceToZoneDto', 'model/LightSensorDto', 'model/ListDtoDeviceDto', 'model/ListDtoEventDto', 'model/SpaceDto', 'model/UpdateZoneDto', 'model/ZoneDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('../model/AddDeviceToZoneDto'), require('../model/LightSensorDto'), require('../model/ListDtoDeviceDto'), require('../model/ListDtoEventDto'), require('../model/SpaceDto'), require('../model/UpdateZoneDto'), require('../model/ZoneDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ZonesApi = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.AddDeviceToZoneDto, root.GatewaySoftwareApi.LightSensorDto, root.GatewaySoftwareApi.ListDtoDeviceDto, root.GatewaySoftwareApi.ListDtoEventDto, root.GatewaySoftwareApi.SpaceDto, root.GatewaySoftwareApi.UpdateZoneDto, root.GatewaySoftwareApi.ZoneDto);
  }
}(this, function(ApiClient, AddDeviceToZoneDto, LightSensorDto, ListDtoDeviceDto, ListDtoEventDto, SpaceDto, UpdateZoneDto, ZoneDto) {
  'use strict';

  /**
   * Zones service.
   * @module api/ZonesApi
   * @version v1
   */

  /**
   * Constructs a new ZonesApi. 
   * @alias module:api/ZonesApi
   * @class
   * @param {module:ApiClient} apiClient Optional API client implementation to use,
   * default to {@link module:ApiClient#instance} if unspecified.
   */
  var exports = function(apiClient) {
    this.apiClient = apiClient || ApiClient.instance;


    /**
     * Callback function to receive the result of the zonesDelete operation.
     * @callback module:api/ZonesApi~zonesDeleteCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Deletes a zone from the system
     * @param {Number} id the ID of the zone to be deleted
     * @param {module:api/ZonesApi~zonesDeleteCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.zonesDelete = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesDelete");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/zones/{id}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesDeleteLight operation.
     * @callback module:api/ZonesApi~zonesDeleteLightCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes a light from a zone
     * @param {Number} id the ID of the zone
     * @param {Number} deviceId the ID of the light to be removed
     * @param {module:api/ZonesApi~zonesDeleteLightCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.zonesDeleteLight = function(id, deviceId, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesDeleteLight");
      }

      // verify the required parameter 'deviceId' is set
      if (deviceId === undefined || deviceId === null) {
        throw new Error("Missing the required parameter 'deviceId' when calling zonesDeleteLight");
      }


      var pathParams = {
        'id': id,
        'deviceId': deviceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/zones/{id}/lights/{deviceId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesDeleteLightSensor operation.
     * @callback module:api/ZonesApi~zonesDeleteLightSensorCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Removes a light sensor from a zone
     * @param {Number} id the ID of the zone
     * @param {Number} deviceId the ID of the light sensor to be removed
     * @param {module:api/ZonesApi~zonesDeleteLightSensorCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.zonesDeleteLightSensor = function(id, deviceId, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesDeleteLightSensor");
      }

      // verify the required parameter 'deviceId' is set
      if (deviceId === undefined || deviceId === null) {
        throw new Error("Missing the required parameter 'deviceId' when calling zonesDeleteLightSensor");
      }


      var pathParams = {
        'id': id,
        'deviceId': deviceId
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/zones/{id}/lightsensors/{deviceId}', 'DELETE',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesGetAssignableDevices operation.
     * @callback module:api/ZonesApi~zonesGetAssignableDevicesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDeviceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of devices that can be added to a zone
     * @param {Number} id the ID of the zone
     * @param {module:api/ZonesApi~zonesGetAssignableDevicesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDeviceDto}
     */
    this.zonesGetAssignableDevices = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesGetAssignableDevices");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDeviceDto;

      return this.apiClient.callApi(
        '/zones/{id}/assignabledevices', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesGetDevices operation.
     * @callback module:api/ZonesApi~zonesGetDevicesCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoDeviceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of devices contained in a zone
     * @param {Number} id the ID of the zone
     * @param {module:api/ZonesApi~zonesGetDevicesCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoDeviceDto}
     */
    this.zonesGetDevices = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesGetDevices");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoDeviceDto;

      return this.apiClient.callApi(
        '/zones/{id}/devices', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesGetEvents operation.
     * @callback module:api/ZonesApi~zonesGetEventsCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ListDtoEventDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a list of zone events
     * @param {Number} id the ID of the zone
     * @param {module:api/ZonesApi~zonesGetEventsCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ListDtoEventDto}
     */
    this.zonesGetEvents = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesGetEvents");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ListDtoEventDto;

      return this.apiClient.callApi(
        '/zones/{id}/events', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesGetLightSensor operation.
     * @callback module:api/ZonesApi~zonesGetLightSensorCallback
     * @param {String} error Error message, if any.
     * @param {module:model/LightSensorDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the light sensor contained in a zone
     * @param {Number} id the ID of the zone
     * @param {module:api/ZonesApi~zonesGetLightSensorCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/LightSensorDto}
     */
    this.zonesGetLightSensor = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesGetLightSensor");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = LightSensorDto;

      return this.apiClient.callApi(
        '/zones/{id}/lightsensor', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesGetSpace operation.
     * @callback module:api/ZonesApi~zonesGetSpaceCallback
     * @param {String} error Error message, if any.
     * @param {module:model/SpaceDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets the space containing a zone
     * @param {Number} id the ID of the zone
     * @param {module:api/ZonesApi~zonesGetSpaceCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/SpaceDto}
     */
    this.zonesGetSpace = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesGetSpace");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = SpaceDto;

      return this.apiClient.callApi(
        '/zones/{id}/space', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesGetZone operation.
     * @callback module:api/ZonesApi~zonesGetZoneCallback
     * @param {String} error Error message, if any.
     * @param {module:model/ZoneDto} data The data returned by the service call.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Gets a zone
     * @param {Number} id the ID of the zone to be returned
     * @param {module:api/ZonesApi~zonesGetZoneCallback} callback The callback function, accepting three arguments: error, data, response
     * data is of type: {@link module:model/ZoneDto}
     */
    this.zonesGetZone = function(id, callback) {
      var postBody = null;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesGetZone");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = [];
      var accepts = ['application/json', 'text/json'];
      var returnType = ZoneDto;

      return this.apiClient.callApi(
        '/zones/{id}', 'GET',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesPut operation.
     * @callback module:api/ZonesApi~zonesPutCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Updates a zone
     * @param {Number} id the ID of the zone to be updated
     * @param {module:model/UpdateZoneDto} zone the updated values for the zone
     * @param {module:api/ZonesApi~zonesPutCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.zonesPut = function(id, zone, callback) {
      var postBody = zone;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesPut");
      }

      // verify the required parameter 'zone' is set
      if (zone === undefined || zone === null) {
        throw new Error("Missing the required parameter 'zone' when calling zonesPut");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/zones/{id}', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }

    /**
     * Callback function to receive the result of the zonesPutDevices operation.
     * @callback module:api/ZonesApi~zonesPutDevicesCallback
     * @param {String} error Error message, if any.
     * @param data This operation does not return a value.
     * @param {String} response The complete HTTP response.
     */

    /**
     * Adds a device to a zone
     * @param {Number} id the ID of the zone
     * @param {module:model/AddDeviceToZoneDto} device the device to be added to the zone
     * @param {module:api/ZonesApi~zonesPutDevicesCallback} callback The callback function, accepting three arguments: error, data, response
     */
    this.zonesPutDevices = function(id, device, callback) {
      var postBody = device;

      // verify the required parameter 'id' is set
      if (id === undefined || id === null) {
        throw new Error("Missing the required parameter 'id' when calling zonesPutDevices");
      }

      // verify the required parameter 'device' is set
      if (device === undefined || device === null) {
        throw new Error("Missing the required parameter 'device' when calling zonesPutDevices");
      }


      var pathParams = {
        'id': id
      };
      var queryParams = {
      };
      var headerParams = {
      };
      var formParams = {
      };

      var authNames = [];
      var contentTypes = ['application/json', 'text/json', 'application/x-www-form-urlencoded'];
      var accepts = [];
      var returnType = null;

      return this.apiClient.callApi(
        '/zones/{id}/devices', 'PUT',
        pathParams, queryParams, headerParams, formParams, postBody,
        authNames, contentTypes, accepts, returnType, callback
      );
    }
  };

  return exports;
}));

},{"../ApiClient":10,"../model/AddDeviceToZoneDto":38,"../model/LightSensorDto":95,"../model/ListDtoDeviceDto":104,"../model/ListDtoEventDto":107,"../model/SpaceDto":132,"../model/UpdateZoneDto":155,"../model/ZoneDto":158}],33:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ActionDto', 'model/ActionSetDto', 'model/ActivePolicyValueDto', 'model/AddDeviceToSpaceDto', 'model/AddDeviceToZoneDto', 'model/ApplicationKeyDto', 'model/BatchLightingDto', 'model/BatchLightingListDto', 'model/CreateActionDto', 'model/CreateActionSetDto', 'model/CreateApplicationKeyDto', 'model/CreateDeviceNodeDto', 'model/CreateDimmerDto', 'model/CreateDimmerEventDto', 'model/CreateLightDto', 'model/CreateLightSensorDto', 'model/CreateLightSensorEventDto', 'model/CreateMotionSensorDto', 'model/CreateMotionSensorEventDto', 'model/CreateNetworkNodeDto', 'model/CreatePolicyDto', 'model/CreateRelayDto', 'model/CreateScheduleDto', 'model/CreateSpaceDto', 'model/CreateSwitchDto', 'model/CreateSwitchEventDto', 'model/CreateTemperatureSensorDto', 'model/CreateTemperatureSensorEventDto', 'model/CreateWebHookDto', 'model/CreateZoneDto', 'model/CreatedAtRouteNegotiatedContentResultActionDto', 'model/CreatedAtRouteNegotiatedContentResultActionSetDto', 'model/CreatedAtRouteNegotiatedContentResultApplicationKeyDto', 'model/CreatedAtRouteNegotiatedContentResultDeviceNodeDto', 'model/CreatedAtRouteNegotiatedContentResultDimmerDto', 'model/CreatedAtRouteNegotiatedContentResultLightDto', 'model/CreatedAtRouteNegotiatedContentResultLightSensorDto', 'model/CreatedAtRouteNegotiatedContentResultMotionSensorDto', 'model/CreatedAtRouteNegotiatedContentResultNodeDto', 'model/CreatedAtRouteNegotiatedContentResultPolicyDto', 'model/CreatedAtRouteNegotiatedContentResultScheduleDto', 'model/CreatedAtRouteNegotiatedContentResultSpaceDto', 'model/CreatedAtRouteNegotiatedContentResultSwitchDto', 'model/CreatedAtRouteNegotiatedContentResultTemperatureSensorDto', 'model/CreatedAtRouteNegotiatedContentResultWebHookDto', 'model/CreatedAtRouteNegotiatedContentResultZoneDto', 'model/DashboardDeviceStatusByDeviceTypeDto', 'model/DashboardDeviceStatusByNetworkSwitchDto', 'model/DashboardDeviceStatusBySpaceDto', 'model/DecoderFallback', 'model/DeviceDto', 'model/DeviceNodeDto', 'model/DevicesSearchResultDto', 'model/DimmerDto', 'model/EmergencyLightingSettingsDto', 'model/EncoderFallback', 'model/Encoding', 'model/EventDto', 'model/IContentNegotiator', 'model/IRequiredMemberSelector', 'model/LightDto', 'model/LightSensorDto', 'model/LightingDto', 'model/ListDtoActionDto', 'model/ListDtoActionSetDto', 'model/ListDtoActivePolicyValueDto', 'model/ListDtoApplicationKeyDto', 'model/ListDtoDashboardDeviceStatusByDeviceTypeDto', 'model/ListDtoDashboardDeviceStatusByNetworkSwitchDto', 'model/ListDtoDashboardDeviceStatusBySpaceDto', 'model/ListDtoDeviceDto', 'model/ListDtoDeviceNodeDto', 'model/ListDtoDimmerDto', 'model/ListDtoEventDto', 'model/ListDtoLightDto', 'model/ListDtoLightSensorDto', 'model/ListDtoMotionSensorDto', 'model/ListDtoNodeDto', 'model/ListDtoPolicyDto', 'model/ListDtoRelayDto', 'model/ListDtoScheduleDto', 'model/ListDtoSpaceDto', 'model/ListDtoSpaceTypeDto', 'model/ListDtoString', 'model/ListDtoSwitchDto', 'model/ListDtoTemperatureSensorDto', 'model/ListDtoWebHookDto', 'model/ListDtoZoneDto', 'model/MediaTypeFormatter', 'model/MediaTypeHeaderValue', 'model/MediaTypeMapping', 'model/MotionSensorDto', 'model/NameValueHeaderValue', 'model/NodeDto', 'model/PaginatedListDevicesSearchResultDto', 'model/PolicyDto', 'model/RelayDto', 'model/ScheduleDto', 'model/SpaceDto', 'model/SpaceTimerDto', 'model/SpaceTypeDto', 'model/SwitchDto', 'model/TemperatureSensorDto', 'model/UpdateActionDto', 'model/UpdateActionSetDto', 'model/UpdateApplicationKeyDto', 'model/UpdateDeviceDto', 'model/UpdateDeviceNodeDto', 'model/UpdateDimmerDto', 'model/UpdateLightDto', 'model/UpdateLightSensorDto', 'model/UpdateMotionSensorDto', 'model/UpdateNetworkNodeDto', 'model/UpdatePolicyDto', 'model/UpdateRelayDto', 'model/UpdateScheduleActionSetDto', 'model/UpdateScheduleDto', 'model/UpdateSpaceDto', 'model/UpdateSwitchDto', 'model/UpdateTemperatureSensorDto', 'model/UpdateWebHookDto', 'model/UpdateZoneDto', 'model/UrlHelper', 'model/WebHookDto', 'model/ZoneDto', 'api/ActionSetsApi', 'api/ActionsApi', 'api/ApplicationKeysApi', 'api/DashboardsApi', 'api/DeviceNodesApi', 'api/DevicesApi', 'api/DimmersApi', 'api/HealthApi', 'api/LicensingApi', 'api/LightSensorsApi', 'api/LightsApi', 'api/MotionSensorsApi', 'api/NetworkNodesApi', 'api/PoliciesApi', 'api/RelaysApi', 'api/SchedulesApi', 'api/SpaceTypesApi', 'api/SpacesApi', 'api/SwitchesApi', 'api/TemperatureSensorsApi', 'api/WebHooksApi', 'api/ZonesApi'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('./ApiClient'), require('./model/ActionDto'), require('./model/ActionSetDto'), require('./model/ActivePolicyValueDto'), require('./model/AddDeviceToSpaceDto'), require('./model/AddDeviceToZoneDto'), require('./model/ApplicationKeyDto'), require('./model/BatchLightingDto'), require('./model/BatchLightingListDto'), require('./model/CreateActionDto'), require('./model/CreateActionSetDto'), require('./model/CreateApplicationKeyDto'), require('./model/CreateDeviceNodeDto'), require('./model/CreateDimmerDto'), require('./model/CreateDimmerEventDto'), require('./model/CreateLightDto'), require('./model/CreateLightSensorDto'), require('./model/CreateLightSensorEventDto'), require('./model/CreateMotionSensorDto'), require('./model/CreateMotionSensorEventDto'), require('./model/CreateNetworkNodeDto'), require('./model/CreatePolicyDto'), require('./model/CreateRelayDto'), require('./model/CreateScheduleDto'), require('./model/CreateSpaceDto'), require('./model/CreateSwitchDto'), require('./model/CreateSwitchEventDto'), require('./model/CreateTemperatureSensorDto'), require('./model/CreateTemperatureSensorEventDto'), require('./model/CreateWebHookDto'), require('./model/CreateZoneDto'), require('./model/CreatedAtRouteNegotiatedContentResultActionDto'), require('./model/CreatedAtRouteNegotiatedContentResultActionSetDto'), require('./model/CreatedAtRouteNegotiatedContentResultApplicationKeyDto'), require('./model/CreatedAtRouteNegotiatedContentResultDeviceNodeDto'), require('./model/CreatedAtRouteNegotiatedContentResultDimmerDto'), require('./model/CreatedAtRouteNegotiatedContentResultLightDto'), require('./model/CreatedAtRouteNegotiatedContentResultLightSensorDto'), require('./model/CreatedAtRouteNegotiatedContentResultMotionSensorDto'), require('./model/CreatedAtRouteNegotiatedContentResultNodeDto'), require('./model/CreatedAtRouteNegotiatedContentResultPolicyDto'), require('./model/CreatedAtRouteNegotiatedContentResultScheduleDto'), require('./model/CreatedAtRouteNegotiatedContentResultSpaceDto'), require('./model/CreatedAtRouteNegotiatedContentResultSwitchDto'), require('./model/CreatedAtRouteNegotiatedContentResultTemperatureSensorDto'), require('./model/CreatedAtRouteNegotiatedContentResultWebHookDto'), require('./model/CreatedAtRouteNegotiatedContentResultZoneDto'), require('./model/DashboardDeviceStatusByDeviceTypeDto'), require('./model/DashboardDeviceStatusByNetworkSwitchDto'), require('./model/DashboardDeviceStatusBySpaceDto'), require('./model/DecoderFallback'), require('./model/DeviceDto'), require('./model/DeviceNodeDto'), require('./model/DevicesSearchResultDto'), require('./model/DimmerDto'), require('./model/EmergencyLightingSettingsDto'), require('./model/EncoderFallback'), require('./model/Encoding'), require('./model/EventDto'), require('./model/IContentNegotiator'), require('./model/IRequiredMemberSelector'), require('./model/LightDto'), require('./model/LightSensorDto'), require('./model/LightingDto'), require('./model/ListDtoActionDto'), require('./model/ListDtoActionSetDto'), require('./model/ListDtoActivePolicyValueDto'), require('./model/ListDtoApplicationKeyDto'), require('./model/ListDtoDashboardDeviceStatusByDeviceTypeDto'), require('./model/ListDtoDashboardDeviceStatusByNetworkSwitchDto'), require('./model/ListDtoDashboardDeviceStatusBySpaceDto'), require('./model/ListDtoDeviceDto'), require('./model/ListDtoDeviceNodeDto'), require('./model/ListDtoDimmerDto'), require('./model/ListDtoEventDto'), require('./model/ListDtoLightDto'), require('./model/ListDtoLightSensorDto'), require('./model/ListDtoMotionSensorDto'), require('./model/ListDtoNodeDto'), require('./model/ListDtoPolicyDto'), require('./model/ListDtoRelayDto'), require('./model/ListDtoScheduleDto'), require('./model/ListDtoSpaceDto'), require('./model/ListDtoSpaceTypeDto'), require('./model/ListDtoString'), require('./model/ListDtoSwitchDto'), require('./model/ListDtoTemperatureSensorDto'), require('./model/ListDtoWebHookDto'), require('./model/ListDtoZoneDto'), require('./model/MediaTypeFormatter'), require('./model/MediaTypeHeaderValue'), require('./model/MediaTypeMapping'), require('./model/MotionSensorDto'), require('./model/NameValueHeaderValue'), require('./model/NodeDto'), require('./model/PaginatedListDevicesSearchResultDto'), require('./model/PolicyDto'), require('./model/RelayDto'), require('./model/ScheduleDto'), require('./model/SpaceDto'), require('./model/SpaceTimerDto'), require('./model/SpaceTypeDto'), require('./model/SwitchDto'), require('./model/TemperatureSensorDto'), require('./model/UpdateActionDto'), require('./model/UpdateActionSetDto'), require('./model/UpdateApplicationKeyDto'), require('./model/UpdateDeviceDto'), require('./model/UpdateDeviceNodeDto'), require('./model/UpdateDimmerDto'), require('./model/UpdateLightDto'), require('./model/UpdateLightSensorDto'), require('./model/UpdateMotionSensorDto'), require('./model/UpdateNetworkNodeDto'), require('./model/UpdatePolicyDto'), require('./model/UpdateRelayDto'), require('./model/UpdateScheduleActionSetDto'), require('./model/UpdateScheduleDto'), require('./model/UpdateSpaceDto'), require('./model/UpdateSwitchDto'), require('./model/UpdateTemperatureSensorDto'), require('./model/UpdateWebHookDto'), require('./model/UpdateZoneDto'), require('./model/UrlHelper'), require('./model/WebHookDto'), require('./model/ZoneDto'), require('./api/ActionSetsApi'), require('./api/ActionsApi'), require('./api/ApplicationKeysApi'), require('./api/DashboardsApi'), require('./api/DeviceNodesApi'), require('./api/DevicesApi'), require('./api/DimmersApi'), require('./api/HealthApi'), require('./api/LicensingApi'), require('./api/LightSensorsApi'), require('./api/LightsApi'), require('./api/MotionSensorsApi'), require('./api/NetworkNodesApi'), require('./api/PoliciesApi'), require('./api/RelaysApi'), require('./api/SchedulesApi'), require('./api/SpaceTypesApi'), require('./api/SpacesApi'), require('./api/SwitchesApi'), require('./api/TemperatureSensorsApi'), require('./api/WebHooksApi'), require('./api/ZonesApi'));
  }
}(function(ApiClient, ActionDto, ActionSetDto, ActivePolicyValueDto, AddDeviceToSpaceDto, AddDeviceToZoneDto, ApplicationKeyDto, BatchLightingDto, BatchLightingListDto, CreateActionDto, CreateActionSetDto, CreateApplicationKeyDto, CreateDeviceNodeDto, CreateDimmerDto, CreateDimmerEventDto, CreateLightDto, CreateLightSensorDto, CreateLightSensorEventDto, CreateMotionSensorDto, CreateMotionSensorEventDto, CreateNetworkNodeDto, CreatePolicyDto, CreateRelayDto, CreateScheduleDto, CreateSpaceDto, CreateSwitchDto, CreateSwitchEventDto, CreateTemperatureSensorDto, CreateTemperatureSensorEventDto, CreateWebHookDto, CreateZoneDto, CreatedAtRouteNegotiatedContentResultActionDto, CreatedAtRouteNegotiatedContentResultActionSetDto, CreatedAtRouteNegotiatedContentResultApplicationKeyDto, CreatedAtRouteNegotiatedContentResultDeviceNodeDto, CreatedAtRouteNegotiatedContentResultDimmerDto, CreatedAtRouteNegotiatedContentResultLightDto, CreatedAtRouteNegotiatedContentResultLightSensorDto, CreatedAtRouteNegotiatedContentResultMotionSensorDto, CreatedAtRouteNegotiatedContentResultNodeDto, CreatedAtRouteNegotiatedContentResultPolicyDto, CreatedAtRouteNegotiatedContentResultScheduleDto, CreatedAtRouteNegotiatedContentResultSpaceDto, CreatedAtRouteNegotiatedContentResultSwitchDto, CreatedAtRouteNegotiatedContentResultTemperatureSensorDto, CreatedAtRouteNegotiatedContentResultWebHookDto, CreatedAtRouteNegotiatedContentResultZoneDto, DashboardDeviceStatusByDeviceTypeDto, DashboardDeviceStatusByNetworkSwitchDto, DashboardDeviceStatusBySpaceDto, DecoderFallback, DeviceDto, DeviceNodeDto, DevicesSearchResultDto, DimmerDto, EmergencyLightingSettingsDto, EncoderFallback, Encoding, EventDto, IContentNegotiator, IRequiredMemberSelector, LightDto, LightSensorDto, LightingDto, ListDtoActionDto, ListDtoActionSetDto, ListDtoActivePolicyValueDto, ListDtoApplicationKeyDto, ListDtoDashboardDeviceStatusByDeviceTypeDto, ListDtoDashboardDeviceStatusByNetworkSwitchDto, ListDtoDashboardDeviceStatusBySpaceDto, ListDtoDeviceDto, ListDtoDeviceNodeDto, ListDtoDimmerDto, ListDtoEventDto, ListDtoLightDto, ListDtoLightSensorDto, ListDtoMotionSensorDto, ListDtoNodeDto, ListDtoPolicyDto, ListDtoRelayDto, ListDtoScheduleDto, ListDtoSpaceDto, ListDtoSpaceTypeDto, ListDtoString, ListDtoSwitchDto, ListDtoTemperatureSensorDto, ListDtoWebHookDto, ListDtoZoneDto, MediaTypeFormatter, MediaTypeHeaderValue, MediaTypeMapping, MotionSensorDto, NameValueHeaderValue, NodeDto, PaginatedListDevicesSearchResultDto, PolicyDto, RelayDto, ScheduleDto, SpaceDto, SpaceTimerDto, SpaceTypeDto, SwitchDto, TemperatureSensorDto, UpdateActionDto, UpdateActionSetDto, UpdateApplicationKeyDto, UpdateDeviceDto, UpdateDeviceNodeDto, UpdateDimmerDto, UpdateLightDto, UpdateLightSensorDto, UpdateMotionSensorDto, UpdateNetworkNodeDto, UpdatePolicyDto, UpdateRelayDto, UpdateScheduleActionSetDto, UpdateScheduleDto, UpdateSpaceDto, UpdateSwitchDto, UpdateTemperatureSensorDto, UpdateWebHookDto, UpdateZoneDto, UrlHelper, WebHookDto, ZoneDto, ActionSetsApi, ActionsApi, ApplicationKeysApi, DashboardsApi, DeviceNodesApi, DevicesApi, DimmersApi, HealthApi, LicensingApi, LightSensorsApi, LightsApi, MotionSensorsApi, NetworkNodesApi, PoliciesApi, RelaysApi, SchedulesApi, SpaceTypesApi, SpacesApi, SwitchesApi, TemperatureSensorsApi, WebHooksApi, ZonesApi) {
  'use strict';

  /**
   * ERROR_UNKNOWN.<br>
   * The <code>index</code> module provides access to constructors for all the classes which comprise the public API.
   * <p>
   * An AMD (recommended!) or CommonJS application will generally do something equivalent to the following:
   * <pre>
   * var GatewaySoftwareApi = require('index'); // See note below*.
   * var xxxSvc = new GatewaySoftwareApi.XxxApi(); // Allocate the API class we're going to use.
   * var yyyModel = new GatewaySoftwareApi.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * <em>*NOTE: For a top-level AMD script, use require(['index'], function(){...})
   * and put the application logic within the callback function.</em>
   * </p>
   * <p>
   * A non-AMD browser application (discouraged) might do something like this:
   * <pre>
   * var xxxSvc = new GatewaySoftwareApi.XxxApi(); // Allocate the API class we're going to use.
   * var yyy = new GatewaySoftwareApi.Yyy(); // Construct a model instance.
   * yyyModel.someProperty = 'someValue';
   * ...
   * var zzz = xxxSvc.doSomething(yyyModel); // Invoke the service.
   * ...
   * </pre>
   * </p>
   * @module index
   * @version v1
   */
  var exports = {
    /**
     * The ApiClient constructor.
     * @property {module:ApiClient}
     */
    ApiClient: ApiClient,
    /**
     * The ActionDto model constructor.
     * @property {module:model/ActionDto}
     */
    ActionDto: ActionDto,
    /**
     * The ActionSetDto model constructor.
     * @property {module:model/ActionSetDto}
     */
    ActionSetDto: ActionSetDto,
    /**
     * The ActivePolicyValueDto model constructor.
     * @property {module:model/ActivePolicyValueDto}
     */
    ActivePolicyValueDto: ActivePolicyValueDto,
    /**
     * The AddDeviceToSpaceDto model constructor.
     * @property {module:model/AddDeviceToSpaceDto}
     */
    AddDeviceToSpaceDto: AddDeviceToSpaceDto,
    /**
     * The AddDeviceToZoneDto model constructor.
     * @property {module:model/AddDeviceToZoneDto}
     */
    AddDeviceToZoneDto: AddDeviceToZoneDto,
    /**
     * The ApplicationKeyDto model constructor.
     * @property {module:model/ApplicationKeyDto}
     */
    ApplicationKeyDto: ApplicationKeyDto,
    /**
     * The BatchLightingDto model constructor.
     * @property {module:model/BatchLightingDto}
     */
    BatchLightingDto: BatchLightingDto,
    /**
     * The BatchLightingListDto model constructor.
     * @property {module:model/BatchLightingListDto}
     */
    BatchLightingListDto: BatchLightingListDto,
    /**
     * The CreateActionDto model constructor.
     * @property {module:model/CreateActionDto}
     */
    CreateActionDto: CreateActionDto,
    /**
     * The CreateActionSetDto model constructor.
     * @property {module:model/CreateActionSetDto}
     */
    CreateActionSetDto: CreateActionSetDto,
    /**
     * The CreateApplicationKeyDto model constructor.
     * @property {module:model/CreateApplicationKeyDto}
     */
    CreateApplicationKeyDto: CreateApplicationKeyDto,
    /**
     * The CreateDeviceNodeDto model constructor.
     * @property {module:model/CreateDeviceNodeDto}
     */
    CreateDeviceNodeDto: CreateDeviceNodeDto,
    /**
     * The CreateDimmerDto model constructor.
     * @property {module:model/CreateDimmerDto}
     */
    CreateDimmerDto: CreateDimmerDto,
    /**
     * The CreateDimmerEventDto model constructor.
     * @property {module:model/CreateDimmerEventDto}
     */
    CreateDimmerEventDto: CreateDimmerEventDto,
    /**
     * The CreateLightDto model constructor.
     * @property {module:model/CreateLightDto}
     */
    CreateLightDto: CreateLightDto,
    /**
     * The CreateLightSensorDto model constructor.
     * @property {module:model/CreateLightSensorDto}
     */
    CreateLightSensorDto: CreateLightSensorDto,
    /**
     * The CreateLightSensorEventDto model constructor.
     * @property {module:model/CreateLightSensorEventDto}
     */
    CreateLightSensorEventDto: CreateLightSensorEventDto,
    /**
     * The CreateMotionSensorDto model constructor.
     * @property {module:model/CreateMotionSensorDto}
     */
    CreateMotionSensorDto: CreateMotionSensorDto,
    /**
     * The CreateMotionSensorEventDto model constructor.
     * @property {module:model/CreateMotionSensorEventDto}
     */
    CreateMotionSensorEventDto: CreateMotionSensorEventDto,
    /**
     * The CreateNetworkNodeDto model constructor.
     * @property {module:model/CreateNetworkNodeDto}
     */
    CreateNetworkNodeDto: CreateNetworkNodeDto,
    /**
     * The CreatePolicyDto model constructor.
     * @property {module:model/CreatePolicyDto}
     */
    CreatePolicyDto: CreatePolicyDto,
    /**
     * The CreateRelayDto model constructor.
     * @property {module:model/CreateRelayDto}
     */
    CreateRelayDto: CreateRelayDto,
    /**
     * The CreateScheduleDto model constructor.
     * @property {module:model/CreateScheduleDto}
     */
    CreateScheduleDto: CreateScheduleDto,
    /**
     * The CreateSpaceDto model constructor.
     * @property {module:model/CreateSpaceDto}
     */
    CreateSpaceDto: CreateSpaceDto,
    /**
     * The CreateSwitchDto model constructor.
     * @property {module:model/CreateSwitchDto}
     */
    CreateSwitchDto: CreateSwitchDto,
    /**
     * The CreateSwitchEventDto model constructor.
     * @property {module:model/CreateSwitchEventDto}
     */
    CreateSwitchEventDto: CreateSwitchEventDto,
    /**
     * The CreateTemperatureSensorDto model constructor.
     * @property {module:model/CreateTemperatureSensorDto}
     */
    CreateTemperatureSensorDto: CreateTemperatureSensorDto,
    /**
     * The CreateTemperatureSensorEventDto model constructor.
     * @property {module:model/CreateTemperatureSensorEventDto}
     */
    CreateTemperatureSensorEventDto: CreateTemperatureSensorEventDto,
    /**
     * The CreateWebHookDto model constructor.
     * @property {module:model/CreateWebHookDto}
     */
    CreateWebHookDto: CreateWebHookDto,
    /**
     * The CreateZoneDto model constructor.
     * @property {module:model/CreateZoneDto}
     */
    CreateZoneDto: CreateZoneDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultActionDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultActionDto}
     */
    CreatedAtRouteNegotiatedContentResultActionDto: CreatedAtRouteNegotiatedContentResultActionDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultActionSetDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultActionSetDto}
     */
    CreatedAtRouteNegotiatedContentResultActionSetDto: CreatedAtRouteNegotiatedContentResultActionSetDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultApplicationKeyDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultApplicationKeyDto}
     */
    CreatedAtRouteNegotiatedContentResultApplicationKeyDto: CreatedAtRouteNegotiatedContentResultApplicationKeyDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultDeviceNodeDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultDeviceNodeDto}
     */
    CreatedAtRouteNegotiatedContentResultDeviceNodeDto: CreatedAtRouteNegotiatedContentResultDeviceNodeDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultDimmerDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultDimmerDto}
     */
    CreatedAtRouteNegotiatedContentResultDimmerDto: CreatedAtRouteNegotiatedContentResultDimmerDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultLightDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultLightDto}
     */
    CreatedAtRouteNegotiatedContentResultLightDto: CreatedAtRouteNegotiatedContentResultLightDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultLightSensorDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultLightSensorDto}
     */
    CreatedAtRouteNegotiatedContentResultLightSensorDto: CreatedAtRouteNegotiatedContentResultLightSensorDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultMotionSensorDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultMotionSensorDto}
     */
    CreatedAtRouteNegotiatedContentResultMotionSensorDto: CreatedAtRouteNegotiatedContentResultMotionSensorDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultNodeDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultNodeDto}
     */
    CreatedAtRouteNegotiatedContentResultNodeDto: CreatedAtRouteNegotiatedContentResultNodeDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultPolicyDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultPolicyDto}
     */
    CreatedAtRouteNegotiatedContentResultPolicyDto: CreatedAtRouteNegotiatedContentResultPolicyDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultScheduleDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultScheduleDto}
     */
    CreatedAtRouteNegotiatedContentResultScheduleDto: CreatedAtRouteNegotiatedContentResultScheduleDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultSpaceDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultSpaceDto}
     */
    CreatedAtRouteNegotiatedContentResultSpaceDto: CreatedAtRouteNegotiatedContentResultSpaceDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultSwitchDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultSwitchDto}
     */
    CreatedAtRouteNegotiatedContentResultSwitchDto: CreatedAtRouteNegotiatedContentResultSwitchDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultTemperatureSensorDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultTemperatureSensorDto}
     */
    CreatedAtRouteNegotiatedContentResultTemperatureSensorDto: CreatedAtRouteNegotiatedContentResultTemperatureSensorDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultWebHookDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultWebHookDto}
     */
    CreatedAtRouteNegotiatedContentResultWebHookDto: CreatedAtRouteNegotiatedContentResultWebHookDto,
    /**
     * The CreatedAtRouteNegotiatedContentResultZoneDto model constructor.
     * @property {module:model/CreatedAtRouteNegotiatedContentResultZoneDto}
     */
    CreatedAtRouteNegotiatedContentResultZoneDto: CreatedAtRouteNegotiatedContentResultZoneDto,
    /**
     * The DashboardDeviceStatusByDeviceTypeDto model constructor.
     * @property {module:model/DashboardDeviceStatusByDeviceTypeDto}
     */
    DashboardDeviceStatusByDeviceTypeDto: DashboardDeviceStatusByDeviceTypeDto,
    /**
     * The DashboardDeviceStatusByNetworkSwitchDto model constructor.
     * @property {module:model/DashboardDeviceStatusByNetworkSwitchDto}
     */
    DashboardDeviceStatusByNetworkSwitchDto: DashboardDeviceStatusByNetworkSwitchDto,
    /**
     * The DashboardDeviceStatusBySpaceDto model constructor.
     * @property {module:model/DashboardDeviceStatusBySpaceDto}
     */
    DashboardDeviceStatusBySpaceDto: DashboardDeviceStatusBySpaceDto,
    /**
     * The DecoderFallback model constructor.
     * @property {module:model/DecoderFallback}
     */
    DecoderFallback: DecoderFallback,
    /**
     * The DeviceDto model constructor.
     * @property {module:model/DeviceDto}
     */
    DeviceDto: DeviceDto,
    /**
     * The DeviceNodeDto model constructor.
     * @property {module:model/DeviceNodeDto}
     */
    DeviceNodeDto: DeviceNodeDto,
    /**
     * The DevicesSearchResultDto model constructor.
     * @property {module:model/DevicesSearchResultDto}
     */
    DevicesSearchResultDto: DevicesSearchResultDto,
    /**
     * The DimmerDto model constructor.
     * @property {module:model/DimmerDto}
     */
    DimmerDto: DimmerDto,
    /**
     * The EmergencyLightingSettingsDto model constructor.
     * @property {module:model/EmergencyLightingSettingsDto}
     */
    EmergencyLightingSettingsDto: EmergencyLightingSettingsDto,
    /**
     * The EncoderFallback model constructor.
     * @property {module:model/EncoderFallback}
     */
    EncoderFallback: EncoderFallback,
    /**
     * The Encoding model constructor.
     * @property {module:model/Encoding}
     */
    Encoding: Encoding,
    /**
     * The EventDto model constructor.
     * @property {module:model/EventDto}
     */
    EventDto: EventDto,
    /**
     * The IContentNegotiator model constructor.
     * @property {module:model/IContentNegotiator}
     */
    IContentNegotiator: IContentNegotiator,
    /**
     * The IRequiredMemberSelector model constructor.
     * @property {module:model/IRequiredMemberSelector}
     */
    IRequiredMemberSelector: IRequiredMemberSelector,
    /**
     * The LightDto model constructor.
     * @property {module:model/LightDto}
     */
    LightDto: LightDto,
    /**
     * The LightSensorDto model constructor.
     * @property {module:model/LightSensorDto}
     */
    LightSensorDto: LightSensorDto,
    /**
     * The LightingDto model constructor.
     * @property {module:model/LightingDto}
     */
    LightingDto: LightingDto,
    /**
     * The ListDtoActionDto model constructor.
     * @property {module:model/ListDtoActionDto}
     */
    ListDtoActionDto: ListDtoActionDto,
    /**
     * The ListDtoActionSetDto model constructor.
     * @property {module:model/ListDtoActionSetDto}
     */
    ListDtoActionSetDto: ListDtoActionSetDto,
    /**
     * The ListDtoActivePolicyValueDto model constructor.
     * @property {module:model/ListDtoActivePolicyValueDto}
     */
    ListDtoActivePolicyValueDto: ListDtoActivePolicyValueDto,
    /**
     * The ListDtoApplicationKeyDto model constructor.
     * @property {module:model/ListDtoApplicationKeyDto}
     */
    ListDtoApplicationKeyDto: ListDtoApplicationKeyDto,
    /**
     * The ListDtoDashboardDeviceStatusByDeviceTypeDto model constructor.
     * @property {module:model/ListDtoDashboardDeviceStatusByDeviceTypeDto}
     */
    ListDtoDashboardDeviceStatusByDeviceTypeDto: ListDtoDashboardDeviceStatusByDeviceTypeDto,
    /**
     * The ListDtoDashboardDeviceStatusByNetworkSwitchDto model constructor.
     * @property {module:model/ListDtoDashboardDeviceStatusByNetworkSwitchDto}
     */
    ListDtoDashboardDeviceStatusByNetworkSwitchDto: ListDtoDashboardDeviceStatusByNetworkSwitchDto,
    /**
     * The ListDtoDashboardDeviceStatusBySpaceDto model constructor.
     * @property {module:model/ListDtoDashboardDeviceStatusBySpaceDto}
     */
    ListDtoDashboardDeviceStatusBySpaceDto: ListDtoDashboardDeviceStatusBySpaceDto,
    /**
     * The ListDtoDeviceDto model constructor.
     * @property {module:model/ListDtoDeviceDto}
     */
    ListDtoDeviceDto: ListDtoDeviceDto,
    /**
     * The ListDtoDeviceNodeDto model constructor.
     * @property {module:model/ListDtoDeviceNodeDto}
     */
    ListDtoDeviceNodeDto: ListDtoDeviceNodeDto,
    /**
     * The ListDtoDimmerDto model constructor.
     * @property {module:model/ListDtoDimmerDto}
     */
    ListDtoDimmerDto: ListDtoDimmerDto,
    /**
     * The ListDtoEventDto model constructor.
     * @property {module:model/ListDtoEventDto}
     */
    ListDtoEventDto: ListDtoEventDto,
    /**
     * The ListDtoLightDto model constructor.
     * @property {module:model/ListDtoLightDto}
     */
    ListDtoLightDto: ListDtoLightDto,
    /**
     * The ListDtoLightSensorDto model constructor.
     * @property {module:model/ListDtoLightSensorDto}
     */
    ListDtoLightSensorDto: ListDtoLightSensorDto,
    /**
     * The ListDtoMotionSensorDto model constructor.
     * @property {module:model/ListDtoMotionSensorDto}
     */
    ListDtoMotionSensorDto: ListDtoMotionSensorDto,
    /**
     * The ListDtoNodeDto model constructor.
     * @property {module:model/ListDtoNodeDto}
     */
    ListDtoNodeDto: ListDtoNodeDto,
    /**
     * The ListDtoPolicyDto model constructor.
     * @property {module:model/ListDtoPolicyDto}
     */
    ListDtoPolicyDto: ListDtoPolicyDto,
    /**
     * The ListDtoRelayDto model constructor.
     * @property {module:model/ListDtoRelayDto}
     */
    ListDtoRelayDto: ListDtoRelayDto,
    /**
     * The ListDtoScheduleDto model constructor.
     * @property {module:model/ListDtoScheduleDto}
     */
    ListDtoScheduleDto: ListDtoScheduleDto,
    /**
     * The ListDtoSpaceDto model constructor.
     * @property {module:model/ListDtoSpaceDto}
     */
    ListDtoSpaceDto: ListDtoSpaceDto,
    /**
     * The ListDtoSpaceTypeDto model constructor.
     * @property {module:model/ListDtoSpaceTypeDto}
     */
    ListDtoSpaceTypeDto: ListDtoSpaceTypeDto,
    /**
     * The ListDtoString model constructor.
     * @property {module:model/ListDtoString}
     */
    ListDtoString: ListDtoString,
    /**
     * The ListDtoSwitchDto model constructor.
     * @property {module:model/ListDtoSwitchDto}
     */
    ListDtoSwitchDto: ListDtoSwitchDto,
    /**
     * The ListDtoTemperatureSensorDto model constructor.
     * @property {module:model/ListDtoTemperatureSensorDto}
     */
    ListDtoTemperatureSensorDto: ListDtoTemperatureSensorDto,
    /**
     * The ListDtoWebHookDto model constructor.
     * @property {module:model/ListDtoWebHookDto}
     */
    ListDtoWebHookDto: ListDtoWebHookDto,
    /**
     * The ListDtoZoneDto model constructor.
     * @property {module:model/ListDtoZoneDto}
     */
    ListDtoZoneDto: ListDtoZoneDto,
    /**
     * The MediaTypeFormatter model constructor.
     * @property {module:model/MediaTypeFormatter}
     */
    MediaTypeFormatter: MediaTypeFormatter,
    /**
     * The MediaTypeHeaderValue model constructor.
     * @property {module:model/MediaTypeHeaderValue}
     */
    MediaTypeHeaderValue: MediaTypeHeaderValue,
    /**
     * The MediaTypeMapping model constructor.
     * @property {module:model/MediaTypeMapping}
     */
    MediaTypeMapping: MediaTypeMapping,
    /**
     * The MotionSensorDto model constructor.
     * @property {module:model/MotionSensorDto}
     */
    MotionSensorDto: MotionSensorDto,
    /**
     * The NameValueHeaderValue model constructor.
     * @property {module:model/NameValueHeaderValue}
     */
    NameValueHeaderValue: NameValueHeaderValue,
    /**
     * The NodeDto model constructor.
     * @property {module:model/NodeDto}
     */
    NodeDto: NodeDto,
    /**
     * The PaginatedListDevicesSearchResultDto model constructor.
     * @property {module:model/PaginatedListDevicesSearchResultDto}
     */
    PaginatedListDevicesSearchResultDto: PaginatedListDevicesSearchResultDto,
    /**
     * The PolicyDto model constructor.
     * @property {module:model/PolicyDto}
     */
    PolicyDto: PolicyDto,
    /**
     * The RelayDto model constructor.
     * @property {module:model/RelayDto}
     */
    RelayDto: RelayDto,
    /**
     * The ScheduleDto model constructor.
     * @property {module:model/ScheduleDto}
     */
    ScheduleDto: ScheduleDto,
    /**
     * The SpaceDto model constructor.
     * @property {module:model/SpaceDto}
     */
    SpaceDto: SpaceDto,
    /**
     * The SpaceTimerDto model constructor.
     * @property {module:model/SpaceTimerDto}
     */
    SpaceTimerDto: SpaceTimerDto,
    /**
     * The SpaceTypeDto model constructor.
     * @property {module:model/SpaceTypeDto}
     */
    SpaceTypeDto: SpaceTypeDto,
    /**
     * The SwitchDto model constructor.
     * @property {module:model/SwitchDto}
     */
    SwitchDto: SwitchDto,
    /**
     * The TemperatureSensorDto model constructor.
     * @property {module:model/TemperatureSensorDto}
     */
    TemperatureSensorDto: TemperatureSensorDto,
    /**
     * The UpdateActionDto model constructor.
     * @property {module:model/UpdateActionDto}
     */
    UpdateActionDto: UpdateActionDto,
    /**
     * The UpdateActionSetDto model constructor.
     * @property {module:model/UpdateActionSetDto}
     */
    UpdateActionSetDto: UpdateActionSetDto,
    /**
     * The UpdateApplicationKeyDto model constructor.
     * @property {module:model/UpdateApplicationKeyDto}
     */
    UpdateApplicationKeyDto: UpdateApplicationKeyDto,
    /**
     * The UpdateDeviceDto model constructor.
     * @property {module:model/UpdateDeviceDto}
     */
    UpdateDeviceDto: UpdateDeviceDto,
    /**
     * The UpdateDeviceNodeDto model constructor.
     * @property {module:model/UpdateDeviceNodeDto}
     */
    UpdateDeviceNodeDto: UpdateDeviceNodeDto,
    /**
     * The UpdateDimmerDto model constructor.
     * @property {module:model/UpdateDimmerDto}
     */
    UpdateDimmerDto: UpdateDimmerDto,
    /**
     * The UpdateLightDto model constructor.
     * @property {module:model/UpdateLightDto}
     */
    UpdateLightDto: UpdateLightDto,
    /**
     * The UpdateLightSensorDto model constructor.
     * @property {module:model/UpdateLightSensorDto}
     */
    UpdateLightSensorDto: UpdateLightSensorDto,
    /**
     * The UpdateMotionSensorDto model constructor.
     * @property {module:model/UpdateMotionSensorDto}
     */
    UpdateMotionSensorDto: UpdateMotionSensorDto,
    /**
     * The UpdateNetworkNodeDto model constructor.
     * @property {module:model/UpdateNetworkNodeDto}
     */
    UpdateNetworkNodeDto: UpdateNetworkNodeDto,
    /**
     * The UpdatePolicyDto model constructor.
     * @property {module:model/UpdatePolicyDto}
     */
    UpdatePolicyDto: UpdatePolicyDto,
    /**
     * The UpdateRelayDto model constructor.
     * @property {module:model/UpdateRelayDto}
     */
    UpdateRelayDto: UpdateRelayDto,
    /**
     * The UpdateScheduleActionSetDto model constructor.
     * @property {module:model/UpdateScheduleActionSetDto}
     */
    UpdateScheduleActionSetDto: UpdateScheduleActionSetDto,
    /**
     * The UpdateScheduleDto model constructor.
     * @property {module:model/UpdateScheduleDto}
     */
    UpdateScheduleDto: UpdateScheduleDto,
    /**
     * The UpdateSpaceDto model constructor.
     * @property {module:model/UpdateSpaceDto}
     */
    UpdateSpaceDto: UpdateSpaceDto,
    /**
     * The UpdateSwitchDto model constructor.
     * @property {module:model/UpdateSwitchDto}
     */
    UpdateSwitchDto: UpdateSwitchDto,
    /**
     * The UpdateTemperatureSensorDto model constructor.
     * @property {module:model/UpdateTemperatureSensorDto}
     */
    UpdateTemperatureSensorDto: UpdateTemperatureSensorDto,
    /**
     * The UpdateWebHookDto model constructor.
     * @property {module:model/UpdateWebHookDto}
     */
    UpdateWebHookDto: UpdateWebHookDto,
    /**
     * The UpdateZoneDto model constructor.
     * @property {module:model/UpdateZoneDto}
     */
    UpdateZoneDto: UpdateZoneDto,
    /**
     * The UrlHelper model constructor.
     * @property {module:model/UrlHelper}
     */
    UrlHelper: UrlHelper,
    /**
     * The WebHookDto model constructor.
     * @property {module:model/WebHookDto}
     */
    WebHookDto: WebHookDto,
    /**
     * The ZoneDto model constructor.
     * @property {module:model/ZoneDto}
     */
    ZoneDto: ZoneDto,
    /**
     * The ActionSetsApi service constructor.
     * @property {module:api/ActionSetsApi}
     */
    ActionSetsApi: ActionSetsApi,
    /**
     * The ActionsApi service constructor.
     * @property {module:api/ActionsApi}
     */
    ActionsApi: ActionsApi,
    /**
     * The ApplicationKeysApi service constructor.
     * @property {module:api/ApplicationKeysApi}
     */
    ApplicationKeysApi: ApplicationKeysApi,
    /**
     * The DashboardsApi service constructor.
     * @property {module:api/DashboardsApi}
     */
    DashboardsApi: DashboardsApi,
    /**
     * The DeviceNodesApi service constructor.
     * @property {module:api/DeviceNodesApi}
     */
    DeviceNodesApi: DeviceNodesApi,
    /**
     * The DevicesApi service constructor.
     * @property {module:api/DevicesApi}
     */
    DevicesApi: DevicesApi,
    /**
     * The DimmersApi service constructor.
     * @property {module:api/DimmersApi}
     */
    DimmersApi: DimmersApi,
    /**
     * The HealthApi service constructor.
     * @property {module:api/HealthApi}
     */
    HealthApi: HealthApi,
    /**
     * The LicensingApi service constructor.
     * @property {module:api/LicensingApi}
     */
    LicensingApi: LicensingApi,
    /**
     * The LightSensorsApi service constructor.
     * @property {module:api/LightSensorsApi}
     */
    LightSensorsApi: LightSensorsApi,
    /**
     * The LightsApi service constructor.
     * @property {module:api/LightsApi}
     */
    LightsApi: LightsApi,
    /**
     * The MotionSensorsApi service constructor.
     * @property {module:api/MotionSensorsApi}
     */
    MotionSensorsApi: MotionSensorsApi,
    /**
     * The NetworkNodesApi service constructor.
     * @property {module:api/NetworkNodesApi}
     */
    NetworkNodesApi: NetworkNodesApi,
    /**
     * The PoliciesApi service constructor.
     * @property {module:api/PoliciesApi}
     */
    PoliciesApi: PoliciesApi,
    /**
     * The RelaysApi service constructor.
     * @property {module:api/RelaysApi}
     */
    RelaysApi: RelaysApi,
    /**
     * The SchedulesApi service constructor.
     * @property {module:api/SchedulesApi}
     */
    SchedulesApi: SchedulesApi,
    /**
     * The SpaceTypesApi service constructor.
     * @property {module:api/SpaceTypesApi}
     */
    SpaceTypesApi: SpaceTypesApi,
    /**
     * The SpacesApi service constructor.
     * @property {module:api/SpacesApi}
     */
    SpacesApi: SpacesApi,
    /**
     * The SwitchesApi service constructor.
     * @property {module:api/SwitchesApi}
     */
    SwitchesApi: SwitchesApi,
    /**
     * The TemperatureSensorsApi service constructor.
     * @property {module:api/TemperatureSensorsApi}
     */
    TemperatureSensorsApi: TemperatureSensorsApi,
    /**
     * The WebHooksApi service constructor.
     * @property {module:api/WebHooksApi}
     */
    WebHooksApi: WebHooksApi,
    /**
     * The ZonesApi service constructor.
     * @property {module:api/ZonesApi}
     */
    ZonesApi: ZonesApi
  };

  return exports;
}));

},{"./ApiClient":10,"./api/ActionSetsApi":11,"./api/ActionsApi":12,"./api/ApplicationKeysApi":13,"./api/DashboardsApi":14,"./api/DeviceNodesApi":15,"./api/DevicesApi":16,"./api/DimmersApi":17,"./api/HealthApi":18,"./api/LicensingApi":19,"./api/LightSensorsApi":20,"./api/LightsApi":21,"./api/MotionSensorsApi":22,"./api/NetworkNodesApi":23,"./api/PoliciesApi":24,"./api/RelaysApi":25,"./api/SchedulesApi":26,"./api/SpaceTypesApi":27,"./api/SpacesApi":28,"./api/SwitchesApi":29,"./api/TemperatureSensorsApi":30,"./api/WebHooksApi":31,"./api/ZonesApi":32,"./model/ActionDto":34,"./model/ActionSetDto":35,"./model/ActivePolicyValueDto":36,"./model/AddDeviceToSpaceDto":37,"./model/AddDeviceToZoneDto":38,"./model/ApplicationKeyDto":39,"./model/BatchLightingDto":40,"./model/BatchLightingListDto":41,"./model/CreateActionDto":42,"./model/CreateActionSetDto":43,"./model/CreateApplicationKeyDto":44,"./model/CreateDeviceNodeDto":45,"./model/CreateDimmerDto":46,"./model/CreateDimmerEventDto":47,"./model/CreateLightDto":48,"./model/CreateLightSensorDto":49,"./model/CreateLightSensorEventDto":50,"./model/CreateMotionSensorDto":51,"./model/CreateMotionSensorEventDto":52,"./model/CreateNetworkNodeDto":53,"./model/CreatePolicyDto":54,"./model/CreateRelayDto":55,"./model/CreateScheduleDto":56,"./model/CreateSpaceDto":57,"./model/CreateSwitchDto":58,"./model/CreateSwitchEventDto":59,"./model/CreateTemperatureSensorDto":60,"./model/CreateTemperatureSensorEventDto":61,"./model/CreateWebHookDto":62,"./model/CreateZoneDto":63,"./model/CreatedAtRouteNegotiatedContentResultActionDto":64,"./model/CreatedAtRouteNegotiatedContentResultActionSetDto":65,"./model/CreatedAtRouteNegotiatedContentResultApplicationKeyDto":66,"./model/CreatedAtRouteNegotiatedContentResultDeviceNodeDto":67,"./model/CreatedAtRouteNegotiatedContentResultDimmerDto":68,"./model/CreatedAtRouteNegotiatedContentResultLightDto":69,"./model/CreatedAtRouteNegotiatedContentResultLightSensorDto":70,"./model/CreatedAtRouteNegotiatedContentResultMotionSensorDto":71,"./model/CreatedAtRouteNegotiatedContentResultNodeDto":72,"./model/CreatedAtRouteNegotiatedContentResultPolicyDto":73,"./model/CreatedAtRouteNegotiatedContentResultScheduleDto":74,"./model/CreatedAtRouteNegotiatedContentResultSpaceDto":75,"./model/CreatedAtRouteNegotiatedContentResultSwitchDto":76,"./model/CreatedAtRouteNegotiatedContentResultTemperatureSensorDto":77,"./model/CreatedAtRouteNegotiatedContentResultWebHookDto":78,"./model/CreatedAtRouteNegotiatedContentResultZoneDto":79,"./model/DashboardDeviceStatusByDeviceTypeDto":80,"./model/DashboardDeviceStatusByNetworkSwitchDto":81,"./model/DashboardDeviceStatusBySpaceDto":82,"./model/DecoderFallback":83,"./model/DeviceDto":84,"./model/DeviceNodeDto":85,"./model/DevicesSearchResultDto":86,"./model/DimmerDto":87,"./model/EmergencyLightingSettingsDto":88,"./model/EncoderFallback":89,"./model/Encoding":90,"./model/EventDto":91,"./model/IContentNegotiator":92,"./model/IRequiredMemberSelector":93,"./model/LightDto":94,"./model/LightSensorDto":95,"./model/LightingDto":96,"./model/ListDtoActionDto":97,"./model/ListDtoActionSetDto":98,"./model/ListDtoActivePolicyValueDto":99,"./model/ListDtoApplicationKeyDto":100,"./model/ListDtoDashboardDeviceStatusByDeviceTypeDto":101,"./model/ListDtoDashboardDeviceStatusByNetworkSwitchDto":102,"./model/ListDtoDashboardDeviceStatusBySpaceDto":103,"./model/ListDtoDeviceDto":104,"./model/ListDtoDeviceNodeDto":105,"./model/ListDtoDimmerDto":106,"./model/ListDtoEventDto":107,"./model/ListDtoLightDto":108,"./model/ListDtoLightSensorDto":109,"./model/ListDtoMotionSensorDto":110,"./model/ListDtoNodeDto":111,"./model/ListDtoPolicyDto":112,"./model/ListDtoRelayDto":113,"./model/ListDtoScheduleDto":114,"./model/ListDtoSpaceDto":115,"./model/ListDtoSpaceTypeDto":116,"./model/ListDtoString":117,"./model/ListDtoSwitchDto":118,"./model/ListDtoTemperatureSensorDto":119,"./model/ListDtoWebHookDto":120,"./model/ListDtoZoneDto":121,"./model/MediaTypeFormatter":122,"./model/MediaTypeHeaderValue":123,"./model/MediaTypeMapping":124,"./model/MotionSensorDto":125,"./model/NameValueHeaderValue":126,"./model/NodeDto":127,"./model/PaginatedListDevicesSearchResultDto":128,"./model/PolicyDto":129,"./model/RelayDto":130,"./model/ScheduleDto":131,"./model/SpaceDto":132,"./model/SpaceTimerDto":133,"./model/SpaceTypeDto":134,"./model/SwitchDto":135,"./model/TemperatureSensorDto":136,"./model/UpdateActionDto":137,"./model/UpdateActionSetDto":138,"./model/UpdateApplicationKeyDto":139,"./model/UpdateDeviceDto":140,"./model/UpdateDeviceNodeDto":141,"./model/UpdateDimmerDto":142,"./model/UpdateLightDto":143,"./model/UpdateLightSensorDto":144,"./model/UpdateMotionSensorDto":145,"./model/UpdateNetworkNodeDto":146,"./model/UpdatePolicyDto":147,"./model/UpdateRelayDto":148,"./model/UpdateScheduleActionSetDto":149,"./model/UpdateScheduleDto":150,"./model/UpdateSpaceDto":151,"./model/UpdateSwitchDto":152,"./model/UpdateTemperatureSensorDto":153,"./model/UpdateWebHookDto":154,"./model/UpdateZoneDto":155,"./model/UrlHelper":156,"./model/WebHookDto":157,"./model/ZoneDto":158}],34:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ActionDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ActionDto model module.
   * @module model/ActionDto
   * @version v1
   */

  /**
   * Constructs a new <code>ActionDto</code>.
   * @alias module:model/ActionDto
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>ActionDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ActionDto} obj Optional instance to populate.
   * @return {module:model/ActionDto} The populated <code>ActionDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('spaceId')) {
        obj['spaceId'] = ApiClient.convertToType(data['spaceId'], 'Number');
      }
      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * @member {Number} spaceId
   */
  exports.prototype['spaceId'] = undefined;
  /**
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],35:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ActionSetDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ActionSetDto model module.
   * @module model/ActionSetDto
   * @version v1
   */

  /**
   * Constructs a new <code>ActionSetDto</code>.
   * @alias module:model/ActionSetDto
   * @class
   * @param name {String} 
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;
  };

  /**
   * Constructs a <code>ActionSetDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ActionSetDto} obj Optional instance to populate.
   * @return {module:model/ActionSetDto} The populated <code>ActionSetDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],36:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ActivePolicyValueDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ActivePolicyValueDto model module.
   * @module model/ActivePolicyValueDto
   * @version v1
   */

  /**
   * Constructs a new <code>ActivePolicyValueDto</code>.
   * @alias module:model/ActivePolicyValueDto
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>ActivePolicyValueDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ActivePolicyValueDto} obj Optional instance to populate.
   * @return {module:model/ActivePolicyValueDto} The populated <code>ActivePolicyValueDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'Number');
      }
      if (data.hasOwnProperty('policyId')) {
        obj['policyId'] = ApiClient.convertToType(data['policyId'], 'Number');
      }
      if (data.hasOwnProperty('policyType')) {
        obj['policyType'] = ApiClient.convertToType(data['policyType'], 'String');
      }
      if (data.hasOwnProperty('policyName')) {
        obj['policyName'] = ApiClient.convertToType(data['policyName'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {Number} value
   */
  exports.prototype['value'] = undefined;
  /**
   * @member {Number} policyId
   */
  exports.prototype['policyId'] = undefined;
  /**
   * @member {String} policyType
   */
  exports.prototype['policyType'] = undefined;
  /**
   * @member {String} policyName
   */
  exports.prototype['policyName'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],37:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.AddDeviceToSpaceDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The AddDeviceToSpaceDto model module.
   * @module model/AddDeviceToSpaceDto
   * @version v1
   */

  /**
   * Constructs a new <code>AddDeviceToSpaceDto</code>.
   * The device
   * @alias module:model/AddDeviceToSpaceDto
   * @class
   * @param deviceId {Number} The device ID
   * @param deviceType {module:model/AddDeviceToSpaceDto.DeviceTypeEnum} The device type
   * @param includeAttachedDevices {module:model/AddDeviceToSpaceDto.IncludeAttachedDevicesEnum} Specifies whether other attached devices should also be added to the space
   */
  var exports = function(deviceId, deviceType, includeAttachedDevices) {
    var _this = this;

    _this['deviceId'] = deviceId;
    _this['deviceType'] = deviceType;
    _this['includeAttachedDevices'] = includeAttachedDevices;
  };

  /**
   * Constructs a <code>AddDeviceToSpaceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/AddDeviceToSpaceDto} obj Optional instance to populate.
   * @return {module:model/AddDeviceToSpaceDto} The populated <code>AddDeviceToSpaceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('deviceId')) {
        obj['deviceId'] = ApiClient.convertToType(data['deviceId'], 'Number');
      }
      if (data.hasOwnProperty('deviceType')) {
        obj['deviceType'] = ApiClient.convertToType(data['deviceType'], 'String');
      }
      if (data.hasOwnProperty('includeAttachedDevices')) {
        obj['includeAttachedDevices'] = ApiClient.convertToType(data['includeAttachedDevices'], 'String');
      }
    }
    return obj;
  }

  /**
   * The device ID
   * @member {Number} deviceId
   */
  exports.prototype['deviceId'] = undefined;
  /**
   * The device type
   * @member {module:model/AddDeviceToSpaceDto.DeviceTypeEnum} deviceType
   */
  exports.prototype['deviceType'] = undefined;
  /**
   * Specifies whether other attached devices should also be added to the space
   * @member {module:model/AddDeviceToSpaceDto.IncludeAttachedDevicesEnum} includeAttachedDevices
   */
  exports.prototype['includeAttachedDevices'] = undefined;


  /**
   * Allowed values for the <code>deviceType</code> property.
   * @enum {String}
   * @readonly
   */
  exports.DeviceTypeEnum = {
    /**
     * value: "Light"
     * @const
     */
    "Light": "Light",
    /**
     * value: "Switch"
     * @const
     */
    "Switch": "Switch",
    /**
     * value: "Dimmer"
     * @const
     */
    "Dimmer": "Dimmer",
    /**
     * value: "MotionSensor"
     * @const
     */
    "MotionSensor": "MotionSensor",
    /**
     * value: "LightSensor"
     * @const
     */
    "LightSensor": "LightSensor",
    /**
     * value: "TemperatureSensor"
     * @const
     */
    "TemperatureSensor": "TemperatureSensor",
    /**
     * value: "Relay"
     * @const
     */
    "Relay": "Relay"  };

  /**
   * Allowed values for the <code>includeAttachedDevices</code> property.
   * @enum {String}
   * @readonly
   */
  exports.IncludeAttachedDevicesEnum = {
    /**
     * value: "None"
     * @const
     */
    "None": "None",
    /**
     * value: "AllOnNode"
     * @const
     */
    "AllOnNode": "AllOnNode",
    /**
     * value: "AllOnChain"
     * @const
     */
    "AllOnChain": "AllOnChain"  };


  return exports;
}));



},{"../ApiClient":10}],38:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.AddDeviceToZoneDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The AddDeviceToZoneDto model module.
   * @module model/AddDeviceToZoneDto
   * @version v1
   */

  /**
   * Constructs a new <code>AddDeviceToZoneDto</code>.
   * The device
   * @alias module:model/AddDeviceToZoneDto
   * @class
   * @param deviceId {Number} The device ID
   * @param deviceType {module:model/AddDeviceToZoneDto.DeviceTypeEnum} The device type
   */
  var exports = function(deviceId, deviceType) {
    var _this = this;

    _this['deviceId'] = deviceId;
    _this['deviceType'] = deviceType;
  };

  /**
   * Constructs a <code>AddDeviceToZoneDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/AddDeviceToZoneDto} obj Optional instance to populate.
   * @return {module:model/AddDeviceToZoneDto} The populated <code>AddDeviceToZoneDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('deviceId')) {
        obj['deviceId'] = ApiClient.convertToType(data['deviceId'], 'Number');
      }
      if (data.hasOwnProperty('deviceType')) {
        obj['deviceType'] = ApiClient.convertToType(data['deviceType'], 'String');
      }
    }
    return obj;
  }

  /**
   * The device ID
   * @member {Number} deviceId
   */
  exports.prototype['deviceId'] = undefined;
  /**
   * The device type
   * @member {module:model/AddDeviceToZoneDto.DeviceTypeEnum} deviceType
   */
  exports.prototype['deviceType'] = undefined;


  /**
   * Allowed values for the <code>deviceType</code> property.
   * @enum {String}
   * @readonly
   */
  exports.DeviceTypeEnum = {
    /**
     * value: "Light"
     * @const
     */
    "Light": "Light",
    /**
     * value: "Switch"
     * @const
     */
    "Switch": "Switch",
    /**
     * value: "Dimmer"
     * @const
     */
    "Dimmer": "Dimmer",
    /**
     * value: "MotionSensor"
     * @const
     */
    "MotionSensor": "MotionSensor",
    /**
     * value: "LightSensor"
     * @const
     */
    "LightSensor": "LightSensor",
    /**
     * value: "TemperatureSensor"
     * @const
     */
    "TemperatureSensor": "TemperatureSensor",
    /**
     * value: "Relay"
     * @const
     */
    "Relay": "Relay"  };


  return exports;
}));



},{"../ApiClient":10}],39:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ApplicationKeyDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ApplicationKeyDto model module.
   * @module model/ApplicationKeyDto
   * @version v1
   */

  /**
   * Constructs a new <code>ApplicationKeyDto</code>.
   * @alias module:model/ApplicationKeyDto
   * @class
   */
  var exports = function() {
    var _this = this;




  };

  /**
   * Constructs a <code>ApplicationKeyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ApplicationKeyDto} obj Optional instance to populate.
   * @return {module:model/ApplicationKeyDto} The populated <code>ApplicationKeyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('key')) {
        obj['key'] = ApiClient.convertToType(data['key'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} key
   */
  exports.prototype['key'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],40:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.BatchLightingDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The BatchLightingDto model module.
   * @module model/BatchLightingDto
   * @version v1
   */

  /**
   * Constructs a new <code>BatchLightingDto</code>.
   * @alias module:model/BatchLightingDto
   * @class
   */
  var exports = function() {
    var _this = this;







  };

  /**
   * Constructs a <code>BatchLightingDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/BatchLightingDto} obj Optional instance to populate.
   * @return {module:model/BatchLightingDto} The populated <code>BatchLightingDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
      if (data.hasOwnProperty('kelvin')) {
        obj['kelvin'] = ApiClient.convertToType(data['kelvin'], 'Number');
      }
      if (data.hasOwnProperty('behavior')) {
        obj['behavior'] = ApiClient.convertToType(data['behavior'], 'String');
      }
      if (data.hasOwnProperty('curveType')) {
        obj['curveType'] = ApiClient.convertToType(data['curveType'], 'String');
      }
      if (data.hasOwnProperty('duration')) {
        obj['duration'] = ApiClient.convertToType(data['duration'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The light ID
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * The lighting level
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;
  /**
   * The color temperature of the lighitng in Kelvin
   * @member {Number} kelvin
   */
  exports.prototype['kelvin'] = undefined;
  /**
   * The smooth ramp behavior
   * @member {module:model/BatchLightingDto.BehaviorEnum} behavior
   */
  exports.prototype['behavior'] = undefined;
  /**
   * The smooth ramp curve type
   * @member {module:model/BatchLightingDto.CurveTypeEnum} curveType
   */
  exports.prototype['curveType'] = undefined;
  /**
   * The smooth ramp duration in milliseconds
   * @member {Number} duration
   */
  exports.prototype['duration'] = undefined;


  /**
   * Allowed values for the <code>behavior</code> property.
   * @enum {String}
   * @readonly
   */
  exports.BehaviorEnum = {
    /**
     * value: "ConstantDuration"
     * @const
     */
    "ConstantDuration": "ConstantDuration",
    /**
     * value: "Variable"
     * @const
     */
    "Variable": "Variable",
    /**
     * value: "ConstantRate"
     * @const
     */
    "ConstantRate": "ConstantRate"  };

  /**
   * Allowed values for the <code>curveType</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CurveTypeEnum = {
    /**
     * value: "None"
     * @const
     */
    "None": "None",
    /**
     * value: "Linear"
     * @const
     */
    "Linear": "Linear",
    /**
     * value: "SquareLaw"
     * @const
     */
    "SquareLaw": "SquareLaw",
    /**
     * value: "Dali"
     * @const
     */
    "Dali": "Dali"  };


  return exports;
}));



},{"../ApiClient":10}],41:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/BatchLightingDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./BatchLightingDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.BatchLightingListDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.BatchLightingDto);
  }
}(this, function(ApiClient, BatchLightingDto) {
  'use strict';




  /**
   * The BatchLightingListDto model module.
   * @module model/BatchLightingListDto
   * @version v1
   */

  /**
   * Constructs a new <code>BatchLightingListDto</code>.
   * @alias module:model/BatchLightingListDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>BatchLightingListDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/BatchLightingListDto} obj Optional instance to populate.
   * @return {module:model/BatchLightingListDto} The populated <code>BatchLightingListDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [BatchLightingDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/BatchLightingDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./BatchLightingDto":40}],42:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateActionDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateActionDto model module.
   * @module model/CreateActionDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateActionDto</code>.
   * The action
   * @alias module:model/CreateActionDto
   * @class
   * @param type {module:model/CreateActionDto.TypeEnum} The action type
   * @param spaceId {Number} The space ID
   * @param level {Number} The level
   */
  var exports = function(type, spaceId, level) {
    var _this = this;

    _this['type'] = type;
    _this['spaceId'] = spaceId;
    _this['level'] = level;
  };

  /**
   * Constructs a <code>CreateActionDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateActionDto} obj Optional instance to populate.
   * @return {module:model/CreateActionDto} The populated <code>CreateActionDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('spaceId')) {
        obj['spaceId'] = ApiClient.convertToType(data['spaceId'], 'Number');
      }
      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The action type
   * @member {module:model/CreateActionDto.TypeEnum} type
   */
  exports.prototype['type'] = undefined;
  /**
   * The space ID
   * @member {Number} spaceId
   */
  exports.prototype['spaceId'] = undefined;
  /**
   * The level
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;


  /**
   * Allowed values for the <code>type</code> property.
   * @enum {String}
   * @readonly
   */
  exports.TypeEnum = {
    /**
     * value: "TurnOff"
     * @const
     */
    "TurnOff": "TurnOff",
    /**
     * value: "TurnOn"
     * @const
     */
    "TurnOn": "TurnOn",
    /**
     * value: "Dim"
     * @const
     */
    "Dim": "Dim"  };


  return exports;
}));



},{"../ApiClient":10}],43:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateActionSetDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateActionSetDto model module.
   * @module model/CreateActionSetDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateActionSetDto</code>.
   * The action set
   * @alias module:model/CreateActionSetDto
   * @class
   * @param name {String} The action set name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>CreateActionSetDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateActionSetDto} obj Optional instance to populate.
   * @return {module:model/CreateActionSetDto} The populated <code>CreateActionSetDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * The action set name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],44:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateApplicationKeyDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateApplicationKeyDto model module.
   * @module model/CreateApplicationKeyDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateApplicationKeyDto</code>.
   * The application key
   * @alias module:model/CreateApplicationKeyDto
   * @class
   * @param name {String} The application key name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>CreateApplicationKeyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateApplicationKeyDto} obj Optional instance to populate.
   * @return {module:model/CreateApplicationKeyDto} The populated <code>CreateApplicationKeyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * The application key name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],45:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateDeviceNodeDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateDeviceNodeDto model module.
   * @module model/CreateDeviceNodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateDeviceNodeDto</code>.
   * The device node
   * @alias module:model/CreateDeviceNodeDto
   * @class
   * @param externalId {String} The external system's ID for this device node
   * @param name {String} The device name
   */
  var exports = function(externalId, name) {
    var _this = this;

    _this['externalId'] = externalId;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>CreateDeviceNodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateDeviceNodeDto} obj Optional instance to populate.
   * @return {module:model/CreateDeviceNodeDto} The populated <code>CreateDeviceNodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The external system's ID for this device node
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],46:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateDimmerDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateDimmerDto model module.
   * @module model/CreateDimmerDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateDimmerDto</code>.
   * The dimmer
   * @alias module:model/CreateDimmerDto
   * @class
   * @param externalId {String} The external system's ID for this dimmer
   * @param name {String} The device name
   */
  var exports = function(externalId, name) {
    var _this = this;

    _this['externalId'] = externalId;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>CreateDimmerDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateDimmerDto} obj Optional instance to populate.
   * @return {module:model/CreateDimmerDto} The populated <code>CreateDimmerDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The external system's ID for this dimmer
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],47:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateDimmerEventDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateDimmerEventDto model module.
   * @module model/CreateDimmerEventDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateDimmerEventDto</code>.
   * @alias module:model/CreateDimmerEventDto
   * @class
   * @param level {Number} The dimmer level (0-100)
   */
  var exports = function(level) {
    var _this = this;

    _this['level'] = level;
  };

  /**
   * Constructs a <code>CreateDimmerEventDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateDimmerEventDto} obj Optional instance to populate.
   * @return {module:model/CreateDimmerEventDto} The populated <code>CreateDimmerEventDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The dimmer level (0-100)
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],48:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateLightDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateLightDto model module.
   * @module model/CreateLightDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateLightDto</code>.
   * The light
   * @alias module:model/CreateLightDto
   * @class
   * @param externalId {String} The external system's ID for this light
   * @param lightType {String} The type of light (Individual, Tunable, Rgb)
   * @param minLevel {Number} The minimum light level (0-10000)
   * @param maxLevel {Number} The maximum light level (0-10000)
   * @param name {String} The device name
   */
  var exports = function(externalId, lightType, minLevel, maxLevel, name) {
    var _this = this;

    _this['externalId'] = externalId;
    _this['lightType'] = lightType;


    _this['minLevel'] = minLevel;
    _this['maxLevel'] = maxLevel;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>CreateLightDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateLightDto} obj Optional instance to populate.
   * @return {module:model/CreateLightDto} The populated <code>CreateLightDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('lightType')) {
        obj['lightType'] = ApiClient.convertToType(data['lightType'], 'String');
      }
      if (data.hasOwnProperty('minimumKelvin')) {
        obj['minimumKelvin'] = ApiClient.convertToType(data['minimumKelvin'], 'Number');
      }
      if (data.hasOwnProperty('maximumKelvin')) {
        obj['maximumKelvin'] = ApiClient.convertToType(data['maximumKelvin'], 'Number');
      }
      if (data.hasOwnProperty('minLevel')) {
        obj['minLevel'] = ApiClient.convertToType(data['minLevel'], 'Number');
      }
      if (data.hasOwnProperty('maxLevel')) {
        obj['maxLevel'] = ApiClient.convertToType(data['maxLevel'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The external system's ID for this light
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * The type of light (Individual, Tunable, Rgb)
   * @member {String} lightType
   */
  exports.prototype['lightType'] = undefined;
  /**
   * The minimum Kelvin value of the light or null
   * @member {Number} minimumKelvin
   */
  exports.prototype['minimumKelvin'] = undefined;
  /**
   * The maximum Kelvin value of the light or null
   * @member {Number} maximumKelvin
   */
  exports.prototype['maximumKelvin'] = undefined;
  /**
   * The minimum light level (0-10000)
   * @member {Number} minLevel
   */
  exports.prototype['minLevel'] = undefined;
  /**
   * The maximum light level (0-10000)
   * @member {Number} maxLevel
   */
  exports.prototype['maxLevel'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],49:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateLightSensorDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateLightSensorDto model module.
   * @module model/CreateLightSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateLightSensorDto</code>.
   * The light sensor
   * @alias module:model/CreateLightSensorDto
   * @class
   * @param externalId {String} The external system's ID for this light sensor
   * @param minSensorLevel {Number} The minimum sensor level
   * @param maxSensorLevel {Number} The maximum sensor level
   * @param minIlluminance {Number} The minimum illuminance
   * @param maxIlluminance {Number} The maximum illuminance
   * @param name {String} The device name
   */
  var exports = function(externalId, minSensorLevel, maxSensorLevel, minIlluminance, maxIlluminance, name) {
    var _this = this;

    _this['externalId'] = externalId;
    _this['minSensorLevel'] = minSensorLevel;
    _this['maxSensorLevel'] = maxSensorLevel;
    _this['minIlluminance'] = minIlluminance;
    _this['maxIlluminance'] = maxIlluminance;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>CreateLightSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateLightSensorDto} obj Optional instance to populate.
   * @return {module:model/CreateLightSensorDto} The populated <code>CreateLightSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('minSensorLevel')) {
        obj['minSensorLevel'] = ApiClient.convertToType(data['minSensorLevel'], 'Number');
      }
      if (data.hasOwnProperty('maxSensorLevel')) {
        obj['maxSensorLevel'] = ApiClient.convertToType(data['maxSensorLevel'], 'Number');
      }
      if (data.hasOwnProperty('minIlluminance')) {
        obj['minIlluminance'] = ApiClient.convertToType(data['minIlluminance'], 'Number');
      }
      if (data.hasOwnProperty('maxIlluminance')) {
        obj['maxIlluminance'] = ApiClient.convertToType(data['maxIlluminance'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The external system's ID for this light sensor
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * The minimum sensor level
   * @member {Number} minSensorLevel
   */
  exports.prototype['minSensorLevel'] = undefined;
  /**
   * The maximum sensor level
   * @member {Number} maxSensorLevel
   */
  exports.prototype['maxSensorLevel'] = undefined;
  /**
   * The minimum illuminance
   * @member {Number} minIlluminance
   */
  exports.prototype['minIlluminance'] = undefined;
  /**
   * The maximum illuminance
   * @member {Number} maxIlluminance
   */
  exports.prototype['maxIlluminance'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],50:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateLightSensorEventDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateLightSensorEventDto model module.
   * @module model/CreateLightSensorEventDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateLightSensorEventDto</code>.
   * The light sensor event
   * @alias module:model/CreateLightSensorEventDto
   * @class
   * @param sensorLevel {Number} The sensor level
   */
  var exports = function(sensorLevel) {
    var _this = this;

    _this['sensorLevel'] = sensorLevel;
  };

  /**
   * Constructs a <code>CreateLightSensorEventDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateLightSensorEventDto} obj Optional instance to populate.
   * @return {module:model/CreateLightSensorEventDto} The populated <code>CreateLightSensorEventDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('sensorLevel')) {
        obj['sensorLevel'] = ApiClient.convertToType(data['sensorLevel'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The sensor level
   * @member {Number} sensorLevel
   */
  exports.prototype['sensorLevel'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],51:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateMotionSensorDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateMotionSensorDto model module.
   * @module model/CreateMotionSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateMotionSensorDto</code>.
   * The motion sensor
   * @alias module:model/CreateMotionSensorDto
   * @class
   * @param externalId {String} The external system's ID for this motion sensor
   * @param name {String} The device name
   */
  var exports = function(externalId, name) {
    var _this = this;

    _this['externalId'] = externalId;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>CreateMotionSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateMotionSensorDto} obj Optional instance to populate.
   * @return {module:model/CreateMotionSensorDto} The populated <code>CreateMotionSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The external system's ID for this motion sensor
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],52:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateMotionSensorEventDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateMotionSensorEventDto model module.
   * @module model/CreateMotionSensorEventDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateMotionSensorEventDto</code>.
   * The motion sensor
   * @alias module:model/CreateMotionSensorEventDto
   * @class
   * @param state {module:model/CreateMotionSensorEventDto.StateEnum} The motion sensor state
   */
  var exports = function(state) {
    var _this = this;

    _this['state'] = state;
  };

  /**
   * Constructs a <code>CreateMotionSensorEventDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateMotionSensorEventDto} obj Optional instance to populate.
   * @return {module:model/CreateMotionSensorEventDto} The populated <code>CreateMotionSensorEventDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('state')) {
        obj['state'] = ApiClient.convertToType(data['state'], 'String');
      }
    }
    return obj;
  }

  /**
   * The motion sensor state
   * @member {module:model/CreateMotionSensorEventDto.StateEnum} state
   */
  exports.prototype['state'] = undefined;


  /**
   * Allowed values for the <code>state</code> property.
   * @enum {String}
   * @readonly
   */
  exports.StateEnum = {
    /**
     * value: "Vacancy"
     * @const
     */
    "Vacancy": "Vacancy",
    /**
     * value: "Occupancy"
     * @const
     */
    "Occupancy": "Occupancy"  };


  return exports;
}));



},{"../ApiClient":10}],53:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateNetworkNodeDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateNetworkNodeDto model module.
   * @module model/CreateNetworkNodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateNetworkNodeDto</code>.
   * The network node
   * @alias module:model/CreateNetworkNodeDto
   * @class
   * @param externalId {String} The external system's ID for this network node
   * @param name {String} The device name
   */
  var exports = function(externalId, name) {
    var _this = this;

    _this['externalId'] = externalId;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>CreateNetworkNodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateNetworkNodeDto} obj Optional instance to populate.
   * @return {module:model/CreateNetworkNodeDto} The populated <code>CreateNetworkNodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The external system's ID for this network node
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],54:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatePolicyDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreatePolicyDto model module.
   * @module model/CreatePolicyDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatePolicyDto</code>.
   * The policy
   * @alias module:model/CreatePolicyDto
   * @class
   */
  var exports = function() {
    var _this = this;




  };

  /**
   * Constructs a <code>CreatePolicyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatePolicyDto} obj Optional instance to populate.
   * @return {module:model/CreatePolicyDto} The populated <code>CreatePolicyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('minimumLightLevel')) {
        obj['minimumLightLevel'] = ApiClient.convertToType(data['minimumLightLevel'], 'Number');
      }
      if (data.hasOwnProperty('maximumLightLevel')) {
        obj['maximumLightLevel'] = ApiClient.convertToType(data['maximumLightLevel'], 'Number');
      }
      if (data.hasOwnProperty('occupancyTimeout')) {
        obj['occupancyTimeout'] = ApiClient.convertToType(data['occupancyTimeout'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The minimum light level
   * @member {Number} minimumLightLevel
   */
  exports.prototype['minimumLightLevel'] = undefined;
  /**
   * The maximum light level
   * @member {Number} maximumLightLevel
   */
  exports.prototype['maximumLightLevel'] = undefined;
  /**
   * The occupancy timeout
   * @member {Number} occupancyTimeout
   */
  exports.prototype['occupancyTimeout'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],55:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateRelayDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateRelayDto model module.
   * @module model/CreateRelayDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateRelayDto</code>.
   * The relay to be created
   * @alias module:model/CreateRelayDto
   * @class
   * @param externalId {String} The external system's ID for this relay.
   * @param isInverted {Boolean} Should this relay invert its commands. This means turning a space \"on\" would open the relay.
   * @param name {String} The device name
   */
  var exports = function(externalId, isInverted, name) {
    var _this = this;

    _this['externalId'] = externalId;
    _this['isInverted'] = isInverted;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>CreateRelayDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateRelayDto} obj Optional instance to populate.
   * @return {module:model/CreateRelayDto} The populated <code>CreateRelayDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('isInverted')) {
        obj['isInverted'] = ApiClient.convertToType(data['isInverted'], 'Boolean');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The external system's ID for this relay.
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * Should this relay invert its commands. This means turning a space \"on\" would open the relay.
   * @member {Boolean} isInverted
   */
  exports.prototype['isInverted'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],56:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateScheduleDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateScheduleDto model module.
   * @module model/CreateScheduleDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateScheduleDto</code>.
   * The schedule
   * @alias module:model/CreateScheduleDto
   * @class
   * @param name {String} The schedule name
   * @param cronExpression {String} The cron expression
   */
  var exports = function(name, cronExpression) {
    var _this = this;

    _this['name'] = name;
    _this['cronExpression'] = cronExpression;
  };

  /**
   * Constructs a <code>CreateScheduleDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateScheduleDto} obj Optional instance to populate.
   * @return {module:model/CreateScheduleDto} The populated <code>CreateScheduleDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('cronExpression')) {
        obj['cronExpression'] = ApiClient.convertToType(data['cronExpression'], 'String');
      }
    }
    return obj;
  }

  /**
   * The schedule name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The cron expression
   * @member {String} cronExpression
   */
  exports.prototype['cronExpression'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],57:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateSpaceDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateSpaceDto model module.
   * @module model/CreateSpaceDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateSpaceDto</code>.
   * The space
   * @alias module:model/CreateSpaceDto
   * @class
   * @param name {String} The space name
   * @param mode {module:model/CreateSpaceDto.ModeEnum} The space mode
   */
  var exports = function(name, mode) {
    var _this = this;

    _this['name'] = name;
    _this['mode'] = mode;
  };

  /**
   * Constructs a <code>CreateSpaceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateSpaceDto} obj Optional instance to populate.
   * @return {module:model/CreateSpaceDto} The populated <code>CreateSpaceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('mode')) {
        obj['mode'] = ApiClient.convertToType(data['mode'], 'String');
      }
    }
    return obj;
  }

  /**
   * The space name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The space mode
   * @member {module:model/CreateSpaceDto.ModeEnum} mode
   */
  exports.prototype['mode'] = undefined;


  /**
   * Allowed values for the <code>mode</code> property.
   * @enum {String}
   * @readonly
   */
  exports.ModeEnum = {
    /**
     * value: "Occupancy"
     * @const
     */
    "Occupancy": "Occupancy",
    /**
     * value: "Vacancy"
     * @const
     */
    "Vacancy": "Vacancy"  };


  return exports;
}));



},{"../ApiClient":10}],58:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateSwitchDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateSwitchDto model module.
   * @module model/CreateSwitchDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateSwitchDto</code>.
   * The switch
   * @alias module:model/CreateSwitchDto
   * @class
   * @param externalId {String} The external system's ID for this switch
   * @param name {String} The device name
   */
  var exports = function(externalId, name) {
    var _this = this;

    _this['externalId'] = externalId;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>CreateSwitchDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateSwitchDto} obj Optional instance to populate.
   * @return {module:model/CreateSwitchDto} The populated <code>CreateSwitchDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The external system's ID for this switch
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],59:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateSwitchEventDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateSwitchEventDto model module.
   * @module model/CreateSwitchEventDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateSwitchEventDto</code>.
   * The switch event
   * @alias module:model/CreateSwitchEventDto
   * @class
   * @param state {module:model/CreateSwitchEventDto.StateEnum} The switch state
   */
  var exports = function(state) {
    var _this = this;

    _this['state'] = state;
  };

  /**
   * Constructs a <code>CreateSwitchEventDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateSwitchEventDto} obj Optional instance to populate.
   * @return {module:model/CreateSwitchEventDto} The populated <code>CreateSwitchEventDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('state')) {
        obj['state'] = ApiClient.convertToType(data['state'], 'String');
      }
    }
    return obj;
  }

  /**
   * The switch state
   * @member {module:model/CreateSwitchEventDto.StateEnum} state
   */
  exports.prototype['state'] = undefined;


  /**
   * Allowed values for the <code>state</code> property.
   * @enum {String}
   * @readonly
   */
  exports.StateEnum = {
    /**
     * value: "Off"
     * @const
     */
    "Off": "Off",
    /**
     * value: "On"
     * @const
     */
    "On": "On"  };


  return exports;
}));



},{"../ApiClient":10}],60:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateTemperatureSensorDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateTemperatureSensorDto model module.
   * @module model/CreateTemperatureSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateTemperatureSensorDto</code>.
   * The temperature sensor
   * @alias module:model/CreateTemperatureSensorDto
   * @class
   * @param externalId {String} The external system's ID for this temperature sensor
   * @param name {String} The device name
   */
  var exports = function(externalId, name) {
    var _this = this;

    _this['externalId'] = externalId;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>CreateTemperatureSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateTemperatureSensorDto} obj Optional instance to populate.
   * @return {module:model/CreateTemperatureSensorDto} The populated <code>CreateTemperatureSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The external system's ID for this temperature sensor
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],61:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateTemperatureSensorEventDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateTemperatureSensorEventDto model module.
   * @module model/CreateTemperatureSensorEventDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateTemperatureSensorEventDto</code>.
   * The temperature sensor event
   * @alias module:model/CreateTemperatureSensorEventDto
   * @class
   * @param temperature {Number} The temperature
   */
  var exports = function(temperature) {
    var _this = this;

    _this['temperature'] = temperature;
  };

  /**
   * Constructs a <code>CreateTemperatureSensorEventDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateTemperatureSensorEventDto} obj Optional instance to populate.
   * @return {module:model/CreateTemperatureSensorEventDto} The populated <code>CreateTemperatureSensorEventDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('temperature')) {
        obj['temperature'] = ApiClient.convertToType(data['temperature'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The temperature
   * @member {Number} temperature
   */
  exports.prototype['temperature'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],62:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateWebHookDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateWebHookDto model module.
   * @module model/CreateWebHookDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateWebHookDto</code>.
   * The web hook
   * @alias module:model/CreateWebHookDto
   * @class
   * @param domainEvents {Array.<String>} The domain events associated with this web hook
   * @param callbackUrl {String} The callback URL
   */
  var exports = function(domainEvents, callbackUrl) {
    var _this = this;

    _this['domainEvents'] = domainEvents;
    _this['callbackUrl'] = callbackUrl;
  };

  /**
   * Constructs a <code>CreateWebHookDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateWebHookDto} obj Optional instance to populate.
   * @return {module:model/CreateWebHookDto} The populated <code>CreateWebHookDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('domainEvents')) {
        obj['domainEvents'] = ApiClient.convertToType(data['domainEvents'], ['String']);
      }
      if (data.hasOwnProperty('callbackUrl')) {
        obj['callbackUrl'] = ApiClient.convertToType(data['callbackUrl'], 'String');
      }
    }
    return obj;
  }

  /**
   * The domain events associated with this web hook
   * @member {Array.<String>} domainEvents
   */
  exports.prototype['domainEvents'] = undefined;
  /**
   * The callback URL
   * @member {String} callbackUrl
   */
  exports.prototype['callbackUrl'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],63:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreateZoneDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The CreateZoneDto model module.
   * @module model/CreateZoneDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreateZoneDto</code>.
   * The zone
   * @alias module:model/CreateZoneDto
   * @class
   * @param name {String} The zone name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>CreateZoneDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreateZoneDto} obj Optional instance to populate.
   * @return {module:model/CreateZoneDto} The populated <code>CreateZoneDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * The zone name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],64:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ActionDto', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ActionDto'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultActionDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ActionDto, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, ActionDto, IContentNegotiator, MediaTypeFormatter, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultActionDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultActionDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultActionDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultActionDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultActionDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultActionDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultActionDto} The populated <code>CreatedAtRouteNegotiatedContentResultActionDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = ActionDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/ActionDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./ActionDto":34,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./UrlHelper":156}],65:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ActionSetDto', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ActionSetDto'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultActionSetDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ActionSetDto, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, ActionSetDto, IContentNegotiator, MediaTypeFormatter, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultActionSetDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultActionSetDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultActionSetDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultActionSetDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultActionSetDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultActionSetDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultActionSetDto} The populated <code>CreatedAtRouteNegotiatedContentResultActionSetDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = ActionSetDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/ActionSetDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./ActionSetDto":35,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./UrlHelper":156}],66:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ApplicationKeyDto', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ApplicationKeyDto'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultApplicationKeyDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ApplicationKeyDto, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, ApplicationKeyDto, IContentNegotiator, MediaTypeFormatter, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultApplicationKeyDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultApplicationKeyDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultApplicationKeyDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultApplicationKeyDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultApplicationKeyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultApplicationKeyDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultApplicationKeyDto} The populated <code>CreatedAtRouteNegotiatedContentResultApplicationKeyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = ApplicationKeyDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/ApplicationKeyDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./ApplicationKeyDto":39,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./UrlHelper":156}],67:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DeviceNodeDto', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DeviceNodeDto'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultDeviceNodeDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DeviceNodeDto, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, DeviceNodeDto, IContentNegotiator, MediaTypeFormatter, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultDeviceNodeDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultDeviceNodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultDeviceNodeDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultDeviceNodeDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultDeviceNodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultDeviceNodeDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultDeviceNodeDto} The populated <code>CreatedAtRouteNegotiatedContentResultDeviceNodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = DeviceNodeDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/DeviceNodeDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DeviceNodeDto":85,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./UrlHelper":156}],68:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DimmerDto', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DimmerDto'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultDimmerDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DimmerDto, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, DimmerDto, IContentNegotiator, MediaTypeFormatter, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultDimmerDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultDimmerDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultDimmerDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultDimmerDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultDimmerDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultDimmerDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultDimmerDto} The populated <code>CreatedAtRouteNegotiatedContentResultDimmerDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = DimmerDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/DimmerDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DimmerDto":87,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./UrlHelper":156}],69:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/LightDto', 'model/MediaTypeFormatter', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./LightDto'), require('./MediaTypeFormatter'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultLightDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.LightDto, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, IContentNegotiator, LightDto, MediaTypeFormatter, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultLightDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultLightDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultLightDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultLightDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultLightDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultLightDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultLightDto} The populated <code>CreatedAtRouteNegotiatedContentResultLightDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = LightDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/LightDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./LightDto":94,"./MediaTypeFormatter":122,"./UrlHelper":156}],70:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/LightSensorDto', 'model/MediaTypeFormatter', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./LightSensorDto'), require('./MediaTypeFormatter'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultLightSensorDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.LightSensorDto, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, IContentNegotiator, LightSensorDto, MediaTypeFormatter, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultLightSensorDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultLightSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultLightSensorDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultLightSensorDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultLightSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultLightSensorDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultLightSensorDto} The populated <code>CreatedAtRouteNegotiatedContentResultLightSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = LightSensorDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/LightSensorDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./LightSensorDto":95,"./MediaTypeFormatter":122,"./UrlHelper":156}],71:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/MotionSensorDto', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./MotionSensorDto'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultMotionSensorDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.MotionSensorDto, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, IContentNegotiator, MediaTypeFormatter, MotionSensorDto, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultMotionSensorDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultMotionSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultMotionSensorDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultMotionSensorDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultMotionSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultMotionSensorDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultMotionSensorDto} The populated <code>CreatedAtRouteNegotiatedContentResultMotionSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = MotionSensorDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/MotionSensorDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./MotionSensorDto":125,"./UrlHelper":156}],72:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/NodeDto', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./NodeDto'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultNodeDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.NodeDto, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, IContentNegotiator, MediaTypeFormatter, NodeDto, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultNodeDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultNodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultNodeDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultNodeDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultNodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultNodeDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultNodeDto} The populated <code>CreatedAtRouteNegotiatedContentResultNodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = NodeDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/NodeDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./NodeDto":127,"./UrlHelper":156}],73:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/PolicyDto', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./PolicyDto'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultPolicyDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.PolicyDto, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, IContentNegotiator, MediaTypeFormatter, PolicyDto, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultPolicyDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultPolicyDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultPolicyDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultPolicyDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultPolicyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultPolicyDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultPolicyDto} The populated <code>CreatedAtRouteNegotiatedContentResultPolicyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = PolicyDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/PolicyDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./PolicyDto":129,"./UrlHelper":156}],74:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/ScheduleDto', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./ScheduleDto'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultScheduleDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.ScheduleDto, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, IContentNegotiator, MediaTypeFormatter, ScheduleDto, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultScheduleDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultScheduleDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultScheduleDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultScheduleDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultScheduleDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultScheduleDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultScheduleDto} The populated <code>CreatedAtRouteNegotiatedContentResultScheduleDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = ScheduleDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/ScheduleDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./ScheduleDto":131,"./UrlHelper":156}],75:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/SpaceDto', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./SpaceDto'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultSpaceDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.SpaceDto, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, IContentNegotiator, MediaTypeFormatter, SpaceDto, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultSpaceDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultSpaceDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultSpaceDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultSpaceDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultSpaceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultSpaceDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultSpaceDto} The populated <code>CreatedAtRouteNegotiatedContentResultSpaceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = SpaceDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/SpaceDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./SpaceDto":132,"./UrlHelper":156}],76:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/SwitchDto', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./SwitchDto'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultSwitchDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.SwitchDto, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, IContentNegotiator, MediaTypeFormatter, SwitchDto, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultSwitchDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultSwitchDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultSwitchDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultSwitchDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultSwitchDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultSwitchDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultSwitchDto} The populated <code>CreatedAtRouteNegotiatedContentResultSwitchDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = SwitchDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/SwitchDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./SwitchDto":135,"./UrlHelper":156}],77:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/TemperatureSensorDto', 'model/UrlHelper'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./TemperatureSensorDto'), require('./UrlHelper'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultTemperatureSensorDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.TemperatureSensorDto, root.GatewaySoftwareApi.UrlHelper);
  }
}(this, function(ApiClient, IContentNegotiator, MediaTypeFormatter, TemperatureSensorDto, UrlHelper) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultTemperatureSensorDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultTemperatureSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultTemperatureSensorDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultTemperatureSensorDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultTemperatureSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultTemperatureSensorDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultTemperatureSensorDto} The populated <code>CreatedAtRouteNegotiatedContentResultTemperatureSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = TemperatureSensorDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/TemperatureSensorDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./TemperatureSensorDto":136,"./UrlHelper":156}],78:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/UrlHelper', 'model/WebHookDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./UrlHelper'), require('./WebHookDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultWebHookDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.UrlHelper, root.GatewaySoftwareApi.WebHookDto);
  }
}(this, function(ApiClient, IContentNegotiator, MediaTypeFormatter, UrlHelper, WebHookDto) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultWebHookDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultWebHookDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultWebHookDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultWebHookDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultWebHookDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultWebHookDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultWebHookDto} The populated <code>CreatedAtRouteNegotiatedContentResultWebHookDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = WebHookDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/WebHookDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./UrlHelper":156,"./WebHookDto":157}],79:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/IContentNegotiator', 'model/MediaTypeFormatter', 'model/UrlHelper', 'model/ZoneDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./IContentNegotiator'), require('./MediaTypeFormatter'), require('./UrlHelper'), require('./ZoneDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.CreatedAtRouteNegotiatedContentResultZoneDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.IContentNegotiator, root.GatewaySoftwareApi.MediaTypeFormatter, root.GatewaySoftwareApi.UrlHelper, root.GatewaySoftwareApi.ZoneDto);
  }
}(this, function(ApiClient, IContentNegotiator, MediaTypeFormatter, UrlHelper, ZoneDto) {
  'use strict';




  /**
   * The CreatedAtRouteNegotiatedContentResultZoneDto model module.
   * @module model/CreatedAtRouteNegotiatedContentResultZoneDto
   * @version v1
   */

  /**
   * Constructs a new <code>CreatedAtRouteNegotiatedContentResultZoneDto</code>.
   * @alias module:model/CreatedAtRouteNegotiatedContentResultZoneDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>CreatedAtRouteNegotiatedContentResultZoneDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/CreatedAtRouteNegotiatedContentResultZoneDto} obj Optional instance to populate.
   * @return {module:model/CreatedAtRouteNegotiatedContentResultZoneDto} The populated <code>CreatedAtRouteNegotiatedContentResultZoneDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('routeName')) {
        obj['routeName'] = ApiClient.convertToType(data['routeName'], 'String');
      }
      if (data.hasOwnProperty('routeValues')) {
        obj['routeValues'] = ApiClient.convertToType(data['routeValues'], {'String': Object});
      }
      if (data.hasOwnProperty('content')) {
        obj['content'] = ZoneDto.constructFromObject(data['content']);
      }
      if (data.hasOwnProperty('urlFactory')) {
        obj['urlFactory'] = UrlHelper.constructFromObject(data['urlFactory']);
      }
      if (data.hasOwnProperty('contentNegotiator')) {
        obj['contentNegotiator'] = IContentNegotiator.constructFromObject(data['contentNegotiator']);
      }
      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
      if (data.hasOwnProperty('formatters')) {
        obj['formatters'] = ApiClient.convertToType(data['formatters'], [MediaTypeFormatter]);
      }
    }
    return obj;
  }

  /**
   * @member {String} routeName
   */
  exports.prototype['routeName'] = undefined;
  /**
   * @member {Object.<String, Object>} routeValues
   */
  exports.prototype['routeValues'] = undefined;
  /**
   * @member {module:model/ZoneDto} content
   */
  exports.prototype['content'] = undefined;
  /**
   * @member {module:model/UrlHelper} urlFactory
   */
  exports.prototype['urlFactory'] = undefined;
  /**
   * @member {module:model/IContentNegotiator} contentNegotiator
   */
  exports.prototype['contentNegotiator'] = undefined;
  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeFormatter>} formatters
   */
  exports.prototype['formatters'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./IContentNegotiator":92,"./MediaTypeFormatter":122,"./UrlHelper":156,"./ZoneDto":158}],80:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DashboardDeviceStatusByDeviceTypeDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DashboardDeviceStatusByDeviceTypeDto model module.
   * @module model/DashboardDeviceStatusByDeviceTypeDto
   * @version v1
   */

  /**
   * Constructs a new <code>DashboardDeviceStatusByDeviceTypeDto</code>.
   * @alias module:model/DashboardDeviceStatusByDeviceTypeDto
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>DashboardDeviceStatusByDeviceTypeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DashboardDeviceStatusByDeviceTypeDto} obj Optional instance to populate.
   * @return {module:model/DashboardDeviceStatusByDeviceTypeDto} The populated <code>DashboardDeviceStatusByDeviceTypeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('deviceType')) {
        obj['deviceType'] = ApiClient.convertToType(data['deviceType'], 'String');
      }
      if (data.hasOwnProperty('deviceTypeSingular')) {
        obj['deviceTypeSingular'] = ApiClient.convertToType(data['deviceTypeSingular'], 'String');
      }
      if (data.hasOwnProperty('onlineCount')) {
        obj['onlineCount'] = ApiClient.convertToType(data['onlineCount'], 'Number');
      }
      if (data.hasOwnProperty('offlineCount')) {
        obj['offlineCount'] = ApiClient.convertToType(data['offlineCount'], 'Number');
      }
      if (data.hasOwnProperty('total')) {
        obj['total'] = ApiClient.convertToType(data['total'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {String} deviceType
   */
  exports.prototype['deviceType'] = undefined;
  /**
   * @member {String} deviceTypeSingular
   */
  exports.prototype['deviceTypeSingular'] = undefined;
  /**
   * @member {Number} onlineCount
   */
  exports.prototype['onlineCount'] = undefined;
  /**
   * @member {Number} offlineCount
   */
  exports.prototype['offlineCount'] = undefined;
  /**
   * @member {Number} total
   */
  exports.prototype['total'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],81:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DashboardDeviceStatusByNetworkSwitchDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DashboardDeviceStatusByNetworkSwitchDto model module.
   * @module model/DashboardDeviceStatusByNetworkSwitchDto
   * @version v1
   */

  /**
   * Constructs a new <code>DashboardDeviceStatusByNetworkSwitchDto</code>.
   * @alias module:model/DashboardDeviceStatusByNetworkSwitchDto
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>DashboardDeviceStatusByNetworkSwitchDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DashboardDeviceStatusByNetworkSwitchDto} obj Optional instance to populate.
   * @return {module:model/DashboardDeviceStatusByNetworkSwitchDto} The populated <code>DashboardDeviceStatusByNetworkSwitchDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('networkSwitchName')) {
        obj['networkSwitchName'] = ApiClient.convertToType(data['networkSwitchName'], 'String');
      }
      if (data.hasOwnProperty('networkSwitchIpAddress')) {
        obj['networkSwitchIpAddress'] = ApiClient.convertToType(data['networkSwitchIpAddress'], 'String');
      }
      if (data.hasOwnProperty('onlineCount')) {
        obj['onlineCount'] = ApiClient.convertToType(data['onlineCount'], 'Number');
      }
      if (data.hasOwnProperty('offlineCount')) {
        obj['offlineCount'] = ApiClient.convertToType(data['offlineCount'], 'Number');
      }
      if (data.hasOwnProperty('total')) {
        obj['total'] = ApiClient.convertToType(data['total'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {String} networkSwitchName
   */
  exports.prototype['networkSwitchName'] = undefined;
  /**
   * @member {String} networkSwitchIpAddress
   */
  exports.prototype['networkSwitchIpAddress'] = undefined;
  /**
   * @member {Number} onlineCount
   */
  exports.prototype['onlineCount'] = undefined;
  /**
   * @member {Number} offlineCount
   */
  exports.prototype['offlineCount'] = undefined;
  /**
   * @member {Number} total
   */
  exports.prototype['total'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],82:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DashboardDeviceStatusBySpaceDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DashboardDeviceStatusBySpaceDto model module.
   * @module model/DashboardDeviceStatusBySpaceDto
   * @version v1
   */

  /**
   * Constructs a new <code>DashboardDeviceStatusBySpaceDto</code>.
   * @alias module:model/DashboardDeviceStatusBySpaceDto
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>DashboardDeviceStatusBySpaceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DashboardDeviceStatusBySpaceDto} obj Optional instance to populate.
   * @return {module:model/DashboardDeviceStatusBySpaceDto} The populated <code>DashboardDeviceStatusBySpaceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('spaceId')) {
        obj['spaceId'] = ApiClient.convertToType(data['spaceId'], 'Number');
      }
      if (data.hasOwnProperty('spaceName')) {
        obj['spaceName'] = ApiClient.convertToType(data['spaceName'], 'String');
      }
      if (data.hasOwnProperty('onlineCount')) {
        obj['onlineCount'] = ApiClient.convertToType(data['onlineCount'], 'Number');
      }
      if (data.hasOwnProperty('offlineCount')) {
        obj['offlineCount'] = ApiClient.convertToType(data['offlineCount'], 'Number');
      }
      if (data.hasOwnProperty('total')) {
        obj['total'] = ApiClient.convertToType(data['total'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {Number} spaceId
   */
  exports.prototype['spaceId'] = undefined;
  /**
   * @member {String} spaceName
   */
  exports.prototype['spaceName'] = undefined;
  /**
   * @member {Number} onlineCount
   */
  exports.prototype['onlineCount'] = undefined;
  /**
   * @member {Number} offlineCount
   */
  exports.prototype['offlineCount'] = undefined;
  /**
   * @member {Number} total
   */
  exports.prototype['total'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],83:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DecoderFallback = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DecoderFallback model module.
   * @module model/DecoderFallback
   * @version v1
   */

  /**
   * Constructs a new <code>DecoderFallback</code>.
   * @alias module:model/DecoderFallback
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>DecoderFallback</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DecoderFallback} obj Optional instance to populate.
   * @return {module:model/DecoderFallback} The populated <code>DecoderFallback</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('maxCharCount')) {
        obj['maxCharCount'] = ApiClient.convertToType(data['maxCharCount'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {Number} maxCharCount
   */
  exports.prototype['maxCharCount'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],84:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DeviceDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DeviceDto model module.
   * @module model/DeviceDto
   * @version v1
   */

  /**
   * Constructs a new <code>DeviceDto</code>.
   * @alias module:model/DeviceDto
   * @class
   */
  var exports = function() {
    var _this = this;

















  };

  /**
   * Constructs a <code>DeviceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DeviceDto} obj Optional instance to populate.
   * @return {module:model/DeviceDto} The populated <code>DeviceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('spaceId')) {
        obj['spaceId'] = ApiClient.convertToType(data['spaceId'], 'Number');
      }
      if (data.hasOwnProperty('nodeId')) {
        obj['nodeId'] = ApiClient.convertToType(data['nodeId'], 'Number');
      }
      if (data.hasOwnProperty('spaceName')) {
        obj['spaceName'] = ApiClient.convertToType(data['spaceName'], 'String');
      }
      if (data.hasOwnProperty('isEmergency')) {
        obj['isEmergency'] = ApiClient.convertToType(data['isEmergency'], 'Boolean');
      }
      if (data.hasOwnProperty('isLight')) {
        obj['isLight'] = ApiClient.convertToType(data['isLight'], 'Boolean');
      }
      if (data.hasOwnProperty('isRelay')) {
        obj['isRelay'] = ApiClient.convertToType(data['isRelay'], 'Boolean');
      }
      if (data.hasOwnProperty('lightType')) {
        obj['lightType'] = ApiClient.convertToType(data['lightType'], 'String');
      }
      if (data.hasOwnProperty('relayType')) {
        obj['relayType'] = ApiClient.convertToType(data['relayType'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {Number} spaceId
   */
  exports.prototype['spaceId'] = undefined;
  /**
   * @member {Number} nodeId
   */
  exports.prototype['nodeId'] = undefined;
  /**
   * @member {String} spaceName
   */
  exports.prototype['spaceName'] = undefined;
  /**
   * @member {Boolean} isEmergency
   */
  exports.prototype['isEmergency'] = undefined;
  /**
   * @member {Boolean} isLight
   */
  exports.prototype['isLight'] = undefined;
  /**
   * @member {Boolean} isRelay
   */
  exports.prototype['isRelay'] = undefined;
  /**
   * @member {String} lightType
   */
  exports.prototype['lightType'] = undefined;
  /**
   * @member {String} relayType
   */
  exports.prototype['relayType'] = undefined;
  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],85:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DeviceNodeDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DeviceNodeDto model module.
   * @module model/DeviceNodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>DeviceNodeDto</code>.
   * @alias module:model/DeviceNodeDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>DeviceNodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DeviceNodeDto} obj Optional instance to populate.
   * @return {module:model/DeviceNodeDto} The populated <code>DeviceNodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],86:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DevicesSearchResultDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DevicesSearchResultDto model module.
   * @module model/DevicesSearchResultDto
   * @version v1
   */

  /**
   * Constructs a new <code>DevicesSearchResultDto</code>.
   * @alias module:model/DevicesSearchResultDto
   * @class
   */
  var exports = function() {
    var _this = this;




















  };

  /**
   * Constructs a <code>DevicesSearchResultDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DevicesSearchResultDto} obj Optional instance to populate.
   * @return {module:model/DevicesSearchResultDto} The populated <code>DevicesSearchResultDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('nodeId')) {
        obj['nodeId'] = ApiClient.convertToType(data['nodeId'], 'Number');
      }
      if (data.hasOwnProperty('spaceId')) {
        obj['spaceId'] = ApiClient.convertToType(data['spaceId'], 'Number');
      }
      if (data.hasOwnProperty('spaceName')) {
        obj['spaceName'] = ApiClient.convertToType(data['spaceName'], 'String');
      }
      if (data.hasOwnProperty('networkSwitchName')) {
        obj['networkSwitchName'] = ApiClient.convertToType(data['networkSwitchName'], 'String');
      }
      if (data.hasOwnProperty('networkSwitchIpAddress')) {
        obj['networkSwitchIpAddress'] = ApiClient.convertToType(data['networkSwitchIpAddress'], 'String');
      }
      if (data.hasOwnProperty('networkSwitchPortId')) {
        obj['networkSwitchPortId'] = ApiClient.convertToType(data['networkSwitchPortId'], 'String');
      }
      if (data.hasOwnProperty('networkSwitchPortDescription')) {
        obj['networkSwitchPortDescription'] = ApiClient.convertToType(data['networkSwitchPortDescription'], 'String');
      }
      if (data.hasOwnProperty('isEmergency')) {
        obj['isEmergency'] = ApiClient.convertToType(data['isEmergency'], 'Boolean');
      }
      if (data.hasOwnProperty('isLight')) {
        obj['isLight'] = ApiClient.convertToType(data['isLight'], 'Boolean');
      }
      if (data.hasOwnProperty('isRelay')) {
        obj['isRelay'] = ApiClient.convertToType(data['isRelay'], 'Boolean');
      }
      if (data.hasOwnProperty('lightType')) {
        obj['lightType'] = ApiClient.convertToType(data['lightType'], 'String');
      }
      if (data.hasOwnProperty('relayType')) {
        obj['relayType'] = ApiClient.convertToType(data['relayType'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {Number} nodeId
   */
  exports.prototype['nodeId'] = undefined;
  /**
   * @member {Number} spaceId
   */
  exports.prototype['spaceId'] = undefined;
  /**
   * @member {String} spaceName
   */
  exports.prototype['spaceName'] = undefined;
  /**
   * @member {String} networkSwitchName
   */
  exports.prototype['networkSwitchName'] = undefined;
  /**
   * @member {String} networkSwitchIpAddress
   */
  exports.prototype['networkSwitchIpAddress'] = undefined;
  /**
   * @member {String} networkSwitchPortId
   */
  exports.prototype['networkSwitchPortId'] = undefined;
  /**
   * @member {String} networkSwitchPortDescription
   */
  exports.prototype['networkSwitchPortDescription'] = undefined;
  /**
   * @member {Boolean} isEmergency
   */
  exports.prototype['isEmergency'] = undefined;
  /**
   * @member {Boolean} isLight
   */
  exports.prototype['isLight'] = undefined;
  /**
   * @member {Boolean} isRelay
   */
  exports.prototype['isRelay'] = undefined;
  /**
   * @member {String} lightType
   */
  exports.prototype['lightType'] = undefined;
  /**
   * @member {String} relayType
   */
  exports.prototype['relayType'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],87:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.DimmerDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The DimmerDto model module.
   * @module model/DimmerDto
   * @version v1
   */

  /**
   * Constructs a new <code>DimmerDto</code>.
   * @alias module:model/DimmerDto
   * @class
   * @param name {String} 
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;






  };

  /**
   * Constructs a <code>DimmerDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/DimmerDto} obj Optional instance to populate.
   * @return {module:model/DimmerDto} The populated <code>DimmerDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],88:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.EmergencyLightingSettingsDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The EmergencyLightingSettingsDto model module.
   * @module model/EmergencyLightingSettingsDto
   * @version v1
   */

  /**
   * Constructs a new <code>EmergencyLightingSettingsDto</code>.
   * The emergency lighting settings
   * @alias module:model/EmergencyLightingSettingsDto
   * @class
   */
  var exports = function() {
    var _this = this;




  };

  /**
   * Constructs a <code>EmergencyLightingSettingsDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/EmergencyLightingSettingsDto} obj Optional instance to populate.
   * @return {module:model/EmergencyLightingSettingsDto} The populated <code>EmergencyLightingSettingsDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('lightId')) {
        obj['lightId'] = ApiClient.convertToType(data['lightId'], 'Number');
      }
      if (data.hasOwnProperty('timeout')) {
        obj['timeout'] = ApiClient.convertToType(data['timeout'], 'Number');
      }
      if (data.hasOwnProperty('lightLevel')) {
        obj['lightLevel'] = ApiClient.convertToType(data['lightLevel'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The light ID
   * @member {Number} lightId
   */
  exports.prototype['lightId'] = undefined;
  /**
   * The timeout in milliseconds (5000-30000) before the emergency light turns on (0=disable)
   * @member {Number} timeout
   */
  exports.prototype['timeout'] = undefined;
  /**
   * The lighting level during emergency
   * @member {Number} lightLevel
   */
  exports.prototype['lightLevel'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],89:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.EncoderFallback = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The EncoderFallback model module.
   * @module model/EncoderFallback
   * @version v1
   */

  /**
   * Constructs a new <code>EncoderFallback</code>.
   * @alias module:model/EncoderFallback
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>EncoderFallback</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/EncoderFallback} obj Optional instance to populate.
   * @return {module:model/EncoderFallback} The populated <code>EncoderFallback</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('maxCharCount')) {
        obj['maxCharCount'] = ApiClient.convertToType(data['maxCharCount'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {Number} maxCharCount
   */
  exports.prototype['maxCharCount'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],90:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DecoderFallback', 'model/EncoderFallback'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DecoderFallback'), require('./EncoderFallback'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.Encoding = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DecoderFallback, root.GatewaySoftwareApi.EncoderFallback);
  }
}(this, function(ApiClient, DecoderFallback, EncoderFallback) {
  'use strict';




  /**
   * The Encoding model module.
   * @module model/Encoding
   * @version v1
   */

  /**
   * Constructs a new <code>Encoding</code>.
   * @alias module:model/Encoding
   * @class
   */
  var exports = function() {
    var _this = this;















  };

  /**
   * Constructs a <code>Encoding</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/Encoding} obj Optional instance to populate.
   * @return {module:model/Encoding} The populated <code>Encoding</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('bodyName')) {
        obj['bodyName'] = ApiClient.convertToType(data['bodyName'], 'String');
      }
      if (data.hasOwnProperty('encodingName')) {
        obj['encodingName'] = ApiClient.convertToType(data['encodingName'], 'String');
      }
      if (data.hasOwnProperty('headerName')) {
        obj['headerName'] = ApiClient.convertToType(data['headerName'], 'String');
      }
      if (data.hasOwnProperty('webName')) {
        obj['webName'] = ApiClient.convertToType(data['webName'], 'String');
      }
      if (data.hasOwnProperty('windowsCodePage')) {
        obj['windowsCodePage'] = ApiClient.convertToType(data['windowsCodePage'], 'Number');
      }
      if (data.hasOwnProperty('isBrowserDisplay')) {
        obj['isBrowserDisplay'] = ApiClient.convertToType(data['isBrowserDisplay'], 'Boolean');
      }
      if (data.hasOwnProperty('isBrowserSave')) {
        obj['isBrowserSave'] = ApiClient.convertToType(data['isBrowserSave'], 'Boolean');
      }
      if (data.hasOwnProperty('isMailNewsDisplay')) {
        obj['isMailNewsDisplay'] = ApiClient.convertToType(data['isMailNewsDisplay'], 'Boolean');
      }
      if (data.hasOwnProperty('isMailNewsSave')) {
        obj['isMailNewsSave'] = ApiClient.convertToType(data['isMailNewsSave'], 'Boolean');
      }
      if (data.hasOwnProperty('isSingleByte')) {
        obj['isSingleByte'] = ApiClient.convertToType(data['isSingleByte'], 'Boolean');
      }
      if (data.hasOwnProperty('encoderFallback')) {
        obj['encoderFallback'] = EncoderFallback.constructFromObject(data['encoderFallback']);
      }
      if (data.hasOwnProperty('decoderFallback')) {
        obj['decoderFallback'] = DecoderFallback.constructFromObject(data['decoderFallback']);
      }
      if (data.hasOwnProperty('isReadOnly')) {
        obj['isReadOnly'] = ApiClient.convertToType(data['isReadOnly'], 'Boolean');
      }
      if (data.hasOwnProperty('codePage')) {
        obj['codePage'] = ApiClient.convertToType(data['codePage'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {String} bodyName
   */
  exports.prototype['bodyName'] = undefined;
  /**
   * @member {String} encodingName
   */
  exports.prototype['encodingName'] = undefined;
  /**
   * @member {String} headerName
   */
  exports.prototype['headerName'] = undefined;
  /**
   * @member {String} webName
   */
  exports.prototype['webName'] = undefined;
  /**
   * @member {Number} windowsCodePage
   */
  exports.prototype['windowsCodePage'] = undefined;
  /**
   * @member {Boolean} isBrowserDisplay
   */
  exports.prototype['isBrowserDisplay'] = undefined;
  /**
   * @member {Boolean} isBrowserSave
   */
  exports.prototype['isBrowserSave'] = undefined;
  /**
   * @member {Boolean} isMailNewsDisplay
   */
  exports.prototype['isMailNewsDisplay'] = undefined;
  /**
   * @member {Boolean} isMailNewsSave
   */
  exports.prototype['isMailNewsSave'] = undefined;
  /**
   * @member {Boolean} isSingleByte
   */
  exports.prototype['isSingleByte'] = undefined;
  /**
   * @member {module:model/EncoderFallback} encoderFallback
   */
  exports.prototype['encoderFallback'] = undefined;
  /**
   * @member {module:model/DecoderFallback} decoderFallback
   */
  exports.prototype['decoderFallback'] = undefined;
  /**
   * @member {Boolean} isReadOnly
   */
  exports.prototype['isReadOnly'] = undefined;
  /**
   * @member {Number} codePage
   */
  exports.prototype['codePage'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DecoderFallback":83,"./EncoderFallback":89}],91:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.EventDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The EventDto model module.
   * @module model/EventDto
   * @version v1
   */

  /**
   * Constructs a new <code>EventDto</code>.
   * @alias module:model/EventDto
   * @class
   */
  var exports = function() {
    var _this = this;







  };

  /**
   * Constructs a <code>EventDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/EventDto} obj Optional instance to populate.
   * @return {module:model/EventDto} The populated <code>EventDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('dateTime')) {
        obj['dateTime'] = ApiClient.convertToType(data['dateTime'], 'Date');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('entityType')) {
        obj['entityType'] = ApiClient.convertToType(data['entityType'], 'String');
      }
      if (data.hasOwnProperty('entityId')) {
        obj['entityId'] = ApiClient.convertToType(data['entityId'], 'Number');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {Date} dateTime
   */
  exports.prototype['dateTime'] = undefined;
  /**
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * @member {String} entityType
   */
  exports.prototype['entityType'] = undefined;
  /**
   * @member {Number} entityId
   */
  exports.prototype['entityId'] = undefined;
  /**
   * @member {String} value
   */
  exports.prototype['value'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],92:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.IContentNegotiator = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The IContentNegotiator model module.
   * @module model/IContentNegotiator
   * @version v1
   */

  /**
   * Constructs a new <code>IContentNegotiator</code>.
   * @alias module:model/IContentNegotiator
   * @class
   */
  var exports = function() {
    var _this = this;

  };

  /**
   * Constructs a <code>IContentNegotiator</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/IContentNegotiator} obj Optional instance to populate.
   * @return {module:model/IContentNegotiator} The populated <code>IContentNegotiator</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10}],93:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.IRequiredMemberSelector = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The IRequiredMemberSelector model module.
   * @module model/IRequiredMemberSelector
   * @version v1
   */

  /**
   * Constructs a new <code>IRequiredMemberSelector</code>.
   * @alias module:model/IRequiredMemberSelector
   * @class
   */
  var exports = function() {
    var _this = this;

  };

  /**
   * Constructs a <code>IRequiredMemberSelector</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/IRequiredMemberSelector} obj Optional instance to populate.
   * @return {module:model/IRequiredMemberSelector} The populated <code>IRequiredMemberSelector</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

    }
    return obj;
  }




  return exports;
}));



},{"../ApiClient":10}],94:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.LightDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The LightDto model module.
   * @module model/LightDto
   * @version v1
   */

  /**
   * Constructs a new <code>LightDto</code>.
   * @alias module:model/LightDto
   * @class
   * @param name {String} 
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;















  };

  /**
   * Constructs a <code>LightDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/LightDto} obj Optional instance to populate.
   * @return {module:model/LightDto} The populated <code>LightDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
      if (data.hasOwnProperty('minLevel')) {
        obj['minLevel'] = ApiClient.convertToType(data['minLevel'], 'Number');
      }
      if (data.hasOwnProperty('maxLevel')) {
        obj['maxLevel'] = ApiClient.convertToType(data['maxLevel'], 'Number');
      }
      if (data.hasOwnProperty('isEmergency')) {
        obj['isEmergency'] = ApiClient.convertToType(data['isEmergency'], 'Boolean');
      }
      if (data.hasOwnProperty('emergencyTimeout')) {
        obj['emergencyTimeout'] = ApiClient.convertToType(data['emergencyTimeout'], 'Number');
      }
      if (data.hasOwnProperty('emergencyLightLevel')) {
        obj['emergencyLightLevel'] = ApiClient.convertToType(data['emergencyLightLevel'], 'Number');
      }
      if (data.hasOwnProperty('lightType')) {
        obj['lightType'] = ApiClient.convertToType(data['lightType'], 'String');
      }
      if (data.hasOwnProperty('minimumKelvin')) {
        obj['minimumKelvin'] = ApiClient.convertToType(data['minimumKelvin'], 'Number');
      }
      if (data.hasOwnProperty('maximumKelvin')) {
        obj['maximumKelvin'] = ApiClient.convertToType(data['maximumKelvin'], 'Number');
      }
      if (data.hasOwnProperty('kelvin')) {
        obj['kelvin'] = ApiClient.convertToType(data['kelvin'], 'Number');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * The current light level.
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;
  /**
   * @member {Number} minLevel
   */
  exports.prototype['minLevel'] = undefined;
  /**
   * @member {Number} maxLevel
   */
  exports.prototype['maxLevel'] = undefined;
  /**
   * @member {Boolean} isEmergency
   */
  exports.prototype['isEmergency'] = undefined;
  /**
   * @member {Number} emergencyTimeout
   */
  exports.prototype['emergencyTimeout'] = undefined;
  /**
   * @member {Number} emergencyLightLevel
   */
  exports.prototype['emergencyLightLevel'] = undefined;
  /**
   * @member {String} lightType
   */
  exports.prototype['lightType'] = undefined;
  /**
   * @member {Number} minimumKelvin
   */
  exports.prototype['minimumKelvin'] = undefined;
  /**
   * @member {Number} maximumKelvin
   */
  exports.prototype['maximumKelvin'] = undefined;
  /**
   * @member {Number} kelvin
   */
  exports.prototype['kelvin'] = undefined;
  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],95:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.LightSensorDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The LightSensorDto model module.
   * @module model/LightSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>LightSensorDto</code>.
   * @alias module:model/LightSensorDto
   * @class
   * @param name {String} 
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;











  };

  /**
   * Constructs a <code>LightSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/LightSensorDto} obj Optional instance to populate.
   * @return {module:model/LightSensorDto} The populated <code>LightSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('minSensorLevel')) {
        obj['minSensorLevel'] = ApiClient.convertToType(data['minSensorLevel'], 'Number');
      }
      if (data.hasOwnProperty('maxSensorLevel')) {
        obj['maxSensorLevel'] = ApiClient.convertToType(data['maxSensorLevel'], 'Number');
      }
      if (data.hasOwnProperty('minIlluminance')) {
        obj['minIlluminance'] = ApiClient.convertToType(data['minIlluminance'], 'Number');
      }
      if (data.hasOwnProperty('maxIlluminance')) {
        obj['maxIlluminance'] = ApiClient.convertToType(data['maxIlluminance'], 'Number');
      }
      if (data.hasOwnProperty('sensorLevel')) {
        obj['sensorLevel'] = ApiClient.convertToType(data['sensorLevel'], 'Number');
      }
      if (data.hasOwnProperty('illuminance')) {
        obj['illuminance'] = ApiClient.convertToType(data['illuminance'], 'Number');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {Number} minSensorLevel
   */
  exports.prototype['minSensorLevel'] = undefined;
  /**
   * @member {Number} maxSensorLevel
   */
  exports.prototype['maxSensorLevel'] = undefined;
  /**
   * @member {Number} minIlluminance
   */
  exports.prototype['minIlluminance'] = undefined;
  /**
   * @member {Number} maxIlluminance
   */
  exports.prototype['maxIlluminance'] = undefined;
  /**
   * @member {Number} sensorLevel
   */
  exports.prototype['sensorLevel'] = undefined;
  /**
   * @member {Number} illuminance
   */
  exports.prototype['illuminance'] = undefined;
  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],96:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.LightingDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The LightingDto model module.
   * @module model/LightingDto
   * @version v1
   */

  /**
   * Constructs a new <code>LightingDto</code>.
   * @alias module:model/LightingDto
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>LightingDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/LightingDto} obj Optional instance to populate.
   * @return {module:model/LightingDto} The populated <code>LightingDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
      if (data.hasOwnProperty('kelvin')) {
        obj['kelvin'] = ApiClient.convertToType(data['kelvin'], 'Number');
      }
      if (data.hasOwnProperty('behavior')) {
        obj['behavior'] = ApiClient.convertToType(data['behavior'], 'String');
      }
      if (data.hasOwnProperty('curveType')) {
        obj['curveType'] = ApiClient.convertToType(data['curveType'], 'String');
      }
      if (data.hasOwnProperty('duration')) {
        obj['duration'] = ApiClient.convertToType(data['duration'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The lighting level
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;
  /**
   * The color temperature of the lighitng in Kelvin
   * @member {Number} kelvin
   */
  exports.prototype['kelvin'] = undefined;
  /**
   * The smooth ramp behavior
   * @member {module:model/LightingDto.BehaviorEnum} behavior
   */
  exports.prototype['behavior'] = undefined;
  /**
   * The smooth ramp curve type
   * @member {module:model/LightingDto.CurveTypeEnum} curveType
   */
  exports.prototype['curveType'] = undefined;
  /**
   * The smooth ramp duration in milliseconds
   * @member {Number} duration
   */
  exports.prototype['duration'] = undefined;


  /**
   * Allowed values for the <code>behavior</code> property.
   * @enum {String}
   * @readonly
   */
  exports.BehaviorEnum = {
    /**
     * value: "ConstantDuration"
     * @const
     */
    "ConstantDuration": "ConstantDuration",
    /**
     * value: "Variable"
     * @const
     */
    "Variable": "Variable",
    /**
     * value: "ConstantRate"
     * @const
     */
    "ConstantRate": "ConstantRate"  };

  /**
   * Allowed values for the <code>curveType</code> property.
   * @enum {String}
   * @readonly
   */
  exports.CurveTypeEnum = {
    /**
     * value: "None"
     * @const
     */
    "None": "None",
    /**
     * value: "Linear"
     * @const
     */
    "Linear": "Linear",
    /**
     * value: "SquareLaw"
     * @const
     */
    "SquareLaw": "SquareLaw",
    /**
     * value: "Dali"
     * @const
     */
    "Dali": "Dali"  };


  return exports;
}));



},{"../ApiClient":10}],97:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ActionDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ActionDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoActionDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ActionDto);
  }
}(this, function(ApiClient, ActionDto) {
  'use strict';




  /**
   * The ListDtoActionDto model module.
   * @module model/ListDtoActionDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoActionDto</code>.
   * @alias module:model/ListDtoActionDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoActionDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoActionDto} obj Optional instance to populate.
   * @return {module:model/ListDtoActionDto} The populated <code>ListDtoActionDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [ActionDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/ActionDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./ActionDto":34}],98:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ActionSetDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ActionSetDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoActionSetDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ActionSetDto);
  }
}(this, function(ApiClient, ActionSetDto) {
  'use strict';




  /**
   * The ListDtoActionSetDto model module.
   * @module model/ListDtoActionSetDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoActionSetDto</code>.
   * @alias module:model/ListDtoActionSetDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoActionSetDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoActionSetDto} obj Optional instance to populate.
   * @return {module:model/ListDtoActionSetDto} The populated <code>ListDtoActionSetDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [ActionSetDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/ActionSetDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./ActionSetDto":35}],99:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ActivePolicyValueDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ActivePolicyValueDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoActivePolicyValueDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ActivePolicyValueDto);
  }
}(this, function(ApiClient, ActivePolicyValueDto) {
  'use strict';




  /**
   * The ListDtoActivePolicyValueDto model module.
   * @module model/ListDtoActivePolicyValueDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoActivePolicyValueDto</code>.
   * @alias module:model/ListDtoActivePolicyValueDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoActivePolicyValueDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoActivePolicyValueDto} obj Optional instance to populate.
   * @return {module:model/ListDtoActivePolicyValueDto} The populated <code>ListDtoActivePolicyValueDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [ActivePolicyValueDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/ActivePolicyValueDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./ActivePolicyValueDto":36}],100:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ApplicationKeyDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ApplicationKeyDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoApplicationKeyDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ApplicationKeyDto);
  }
}(this, function(ApiClient, ApplicationKeyDto) {
  'use strict';




  /**
   * The ListDtoApplicationKeyDto model module.
   * @module model/ListDtoApplicationKeyDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoApplicationKeyDto</code>.
   * @alias module:model/ListDtoApplicationKeyDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoApplicationKeyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoApplicationKeyDto} obj Optional instance to populate.
   * @return {module:model/ListDtoApplicationKeyDto} The populated <code>ListDtoApplicationKeyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [ApplicationKeyDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/ApplicationKeyDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./ApplicationKeyDto":39}],101:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DashboardDeviceStatusByDeviceTypeDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DashboardDeviceStatusByDeviceTypeDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoDashboardDeviceStatusByDeviceTypeDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DashboardDeviceStatusByDeviceTypeDto);
  }
}(this, function(ApiClient, DashboardDeviceStatusByDeviceTypeDto) {
  'use strict';




  /**
   * The ListDtoDashboardDeviceStatusByDeviceTypeDto model module.
   * @module model/ListDtoDashboardDeviceStatusByDeviceTypeDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoDashboardDeviceStatusByDeviceTypeDto</code>.
   * @alias module:model/ListDtoDashboardDeviceStatusByDeviceTypeDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoDashboardDeviceStatusByDeviceTypeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoDashboardDeviceStatusByDeviceTypeDto} obj Optional instance to populate.
   * @return {module:model/ListDtoDashboardDeviceStatusByDeviceTypeDto} The populated <code>ListDtoDashboardDeviceStatusByDeviceTypeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [DashboardDeviceStatusByDeviceTypeDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/DashboardDeviceStatusByDeviceTypeDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DashboardDeviceStatusByDeviceTypeDto":80}],102:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DashboardDeviceStatusByNetworkSwitchDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DashboardDeviceStatusByNetworkSwitchDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoDashboardDeviceStatusByNetworkSwitchDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DashboardDeviceStatusByNetworkSwitchDto);
  }
}(this, function(ApiClient, DashboardDeviceStatusByNetworkSwitchDto) {
  'use strict';




  /**
   * The ListDtoDashboardDeviceStatusByNetworkSwitchDto model module.
   * @module model/ListDtoDashboardDeviceStatusByNetworkSwitchDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoDashboardDeviceStatusByNetworkSwitchDto</code>.
   * @alias module:model/ListDtoDashboardDeviceStatusByNetworkSwitchDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoDashboardDeviceStatusByNetworkSwitchDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoDashboardDeviceStatusByNetworkSwitchDto} obj Optional instance to populate.
   * @return {module:model/ListDtoDashboardDeviceStatusByNetworkSwitchDto} The populated <code>ListDtoDashboardDeviceStatusByNetworkSwitchDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [DashboardDeviceStatusByNetworkSwitchDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/DashboardDeviceStatusByNetworkSwitchDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DashboardDeviceStatusByNetworkSwitchDto":81}],103:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DashboardDeviceStatusBySpaceDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DashboardDeviceStatusBySpaceDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoDashboardDeviceStatusBySpaceDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DashboardDeviceStatusBySpaceDto);
  }
}(this, function(ApiClient, DashboardDeviceStatusBySpaceDto) {
  'use strict';




  /**
   * The ListDtoDashboardDeviceStatusBySpaceDto model module.
   * @module model/ListDtoDashboardDeviceStatusBySpaceDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoDashboardDeviceStatusBySpaceDto</code>.
   * @alias module:model/ListDtoDashboardDeviceStatusBySpaceDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoDashboardDeviceStatusBySpaceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoDashboardDeviceStatusBySpaceDto} obj Optional instance to populate.
   * @return {module:model/ListDtoDashboardDeviceStatusBySpaceDto} The populated <code>ListDtoDashboardDeviceStatusBySpaceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [DashboardDeviceStatusBySpaceDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/DashboardDeviceStatusBySpaceDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DashboardDeviceStatusBySpaceDto":82}],104:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DeviceDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DeviceDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoDeviceDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DeviceDto);
  }
}(this, function(ApiClient, DeviceDto) {
  'use strict';




  /**
   * The ListDtoDeviceDto model module.
   * @module model/ListDtoDeviceDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoDeviceDto</code>.
   * @alias module:model/ListDtoDeviceDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoDeviceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoDeviceDto} obj Optional instance to populate.
   * @return {module:model/ListDtoDeviceDto} The populated <code>ListDtoDeviceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [DeviceDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/DeviceDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DeviceDto":84}],105:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DeviceNodeDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DeviceNodeDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoDeviceNodeDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DeviceNodeDto);
  }
}(this, function(ApiClient, DeviceNodeDto) {
  'use strict';




  /**
   * The ListDtoDeviceNodeDto model module.
   * @module model/ListDtoDeviceNodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoDeviceNodeDto</code>.
   * @alias module:model/ListDtoDeviceNodeDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoDeviceNodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoDeviceNodeDto} obj Optional instance to populate.
   * @return {module:model/ListDtoDeviceNodeDto} The populated <code>ListDtoDeviceNodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [DeviceNodeDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/DeviceNodeDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DeviceNodeDto":85}],106:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DimmerDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DimmerDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoDimmerDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DimmerDto);
  }
}(this, function(ApiClient, DimmerDto) {
  'use strict';




  /**
   * The ListDtoDimmerDto model module.
   * @module model/ListDtoDimmerDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoDimmerDto</code>.
   * @alias module:model/ListDtoDimmerDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoDimmerDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoDimmerDto} obj Optional instance to populate.
   * @return {module:model/ListDtoDimmerDto} The populated <code>ListDtoDimmerDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [DimmerDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/DimmerDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DimmerDto":87}],107:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/EventDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./EventDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoEventDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.EventDto);
  }
}(this, function(ApiClient, EventDto) {
  'use strict';




  /**
   * The ListDtoEventDto model module.
   * @module model/ListDtoEventDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoEventDto</code>.
   * @alias module:model/ListDtoEventDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoEventDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoEventDto} obj Optional instance to populate.
   * @return {module:model/ListDtoEventDto} The populated <code>ListDtoEventDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [EventDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/EventDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./EventDto":91}],108:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/LightDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./LightDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoLightDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.LightDto);
  }
}(this, function(ApiClient, LightDto) {
  'use strict';




  /**
   * The ListDtoLightDto model module.
   * @module model/ListDtoLightDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoLightDto</code>.
   * @alias module:model/ListDtoLightDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoLightDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoLightDto} obj Optional instance to populate.
   * @return {module:model/ListDtoLightDto} The populated <code>ListDtoLightDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [LightDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/LightDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./LightDto":94}],109:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/LightSensorDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./LightSensorDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoLightSensorDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.LightSensorDto);
  }
}(this, function(ApiClient, LightSensorDto) {
  'use strict';




  /**
   * The ListDtoLightSensorDto model module.
   * @module model/ListDtoLightSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoLightSensorDto</code>.
   * @alias module:model/ListDtoLightSensorDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoLightSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoLightSensorDto} obj Optional instance to populate.
   * @return {module:model/ListDtoLightSensorDto} The populated <code>ListDtoLightSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [LightSensorDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/LightSensorDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./LightSensorDto":95}],110:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/MotionSensorDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./MotionSensorDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoMotionSensorDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.MotionSensorDto);
  }
}(this, function(ApiClient, MotionSensorDto) {
  'use strict';




  /**
   * The ListDtoMotionSensorDto model module.
   * @module model/ListDtoMotionSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoMotionSensorDto</code>.
   * @alias module:model/ListDtoMotionSensorDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoMotionSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoMotionSensorDto} obj Optional instance to populate.
   * @return {module:model/ListDtoMotionSensorDto} The populated <code>ListDtoMotionSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [MotionSensorDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/MotionSensorDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./MotionSensorDto":125}],111:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/NodeDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./NodeDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoNodeDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.NodeDto);
  }
}(this, function(ApiClient, NodeDto) {
  'use strict';




  /**
   * The ListDtoNodeDto model module.
   * @module model/ListDtoNodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoNodeDto</code>.
   * @alias module:model/ListDtoNodeDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoNodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoNodeDto} obj Optional instance to populate.
   * @return {module:model/ListDtoNodeDto} The populated <code>ListDtoNodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [NodeDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/NodeDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./NodeDto":127}],112:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/PolicyDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./PolicyDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoPolicyDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.PolicyDto);
  }
}(this, function(ApiClient, PolicyDto) {
  'use strict';




  /**
   * The ListDtoPolicyDto model module.
   * @module model/ListDtoPolicyDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoPolicyDto</code>.
   * @alias module:model/ListDtoPolicyDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoPolicyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoPolicyDto} obj Optional instance to populate.
   * @return {module:model/ListDtoPolicyDto} The populated <code>ListDtoPolicyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [PolicyDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/PolicyDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./PolicyDto":129}],113:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/RelayDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./RelayDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoRelayDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.RelayDto);
  }
}(this, function(ApiClient, RelayDto) {
  'use strict';




  /**
   * The ListDtoRelayDto model module.
   * @module model/ListDtoRelayDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoRelayDto</code>.
   * @alias module:model/ListDtoRelayDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoRelayDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoRelayDto} obj Optional instance to populate.
   * @return {module:model/ListDtoRelayDto} The populated <code>ListDtoRelayDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [RelayDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/RelayDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./RelayDto":130}],114:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ScheduleDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ScheduleDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoScheduleDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ScheduleDto);
  }
}(this, function(ApiClient, ScheduleDto) {
  'use strict';




  /**
   * The ListDtoScheduleDto model module.
   * @module model/ListDtoScheduleDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoScheduleDto</code>.
   * @alias module:model/ListDtoScheduleDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoScheduleDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoScheduleDto} obj Optional instance to populate.
   * @return {module:model/ListDtoScheduleDto} The populated <code>ListDtoScheduleDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [ScheduleDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/ScheduleDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./ScheduleDto":131}],115:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/SpaceDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./SpaceDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoSpaceDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.SpaceDto);
  }
}(this, function(ApiClient, SpaceDto) {
  'use strict';




  /**
   * The ListDtoSpaceDto model module.
   * @module model/ListDtoSpaceDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoSpaceDto</code>.
   * @alias module:model/ListDtoSpaceDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoSpaceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoSpaceDto} obj Optional instance to populate.
   * @return {module:model/ListDtoSpaceDto} The populated <code>ListDtoSpaceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [SpaceDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/SpaceDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./SpaceDto":132}],116:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/SpaceTypeDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./SpaceTypeDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoSpaceTypeDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.SpaceTypeDto);
  }
}(this, function(ApiClient, SpaceTypeDto) {
  'use strict';




  /**
   * The ListDtoSpaceTypeDto model module.
   * @module model/ListDtoSpaceTypeDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoSpaceTypeDto</code>.
   * @alias module:model/ListDtoSpaceTypeDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoSpaceTypeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoSpaceTypeDto} obj Optional instance to populate.
   * @return {module:model/ListDtoSpaceTypeDto} The populated <code>ListDtoSpaceTypeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [SpaceTypeDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/SpaceTypeDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./SpaceTypeDto":134}],117:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoString = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ListDtoString model module.
   * @module model/ListDtoString
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoString</code>.
   * @alias module:model/ListDtoString
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoString</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoString} obj Optional instance to populate.
   * @return {module:model/ListDtoString} The populated <code>ListDtoString</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], ['String']);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<String>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],118:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/SwitchDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./SwitchDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoSwitchDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.SwitchDto);
  }
}(this, function(ApiClient, SwitchDto) {
  'use strict';




  /**
   * The ListDtoSwitchDto model module.
   * @module model/ListDtoSwitchDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoSwitchDto</code>.
   * @alias module:model/ListDtoSwitchDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoSwitchDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoSwitchDto} obj Optional instance to populate.
   * @return {module:model/ListDtoSwitchDto} The populated <code>ListDtoSwitchDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [SwitchDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/SwitchDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./SwitchDto":135}],119:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/TemperatureSensorDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./TemperatureSensorDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoTemperatureSensorDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.TemperatureSensorDto);
  }
}(this, function(ApiClient, TemperatureSensorDto) {
  'use strict';




  /**
   * The ListDtoTemperatureSensorDto model module.
   * @module model/ListDtoTemperatureSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoTemperatureSensorDto</code>.
   * @alias module:model/ListDtoTemperatureSensorDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoTemperatureSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoTemperatureSensorDto} obj Optional instance to populate.
   * @return {module:model/ListDtoTemperatureSensorDto} The populated <code>ListDtoTemperatureSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [TemperatureSensorDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/TemperatureSensorDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./TemperatureSensorDto":136}],120:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/WebHookDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./WebHookDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoWebHookDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.WebHookDto);
  }
}(this, function(ApiClient, WebHookDto) {
  'use strict';




  /**
   * The ListDtoWebHookDto model module.
   * @module model/ListDtoWebHookDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoWebHookDto</code>.
   * @alias module:model/ListDtoWebHookDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoWebHookDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoWebHookDto} obj Optional instance to populate.
   * @return {module:model/ListDtoWebHookDto} The populated <code>ListDtoWebHookDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [WebHookDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/WebHookDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./WebHookDto":157}],121:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/ZoneDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./ZoneDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ListDtoZoneDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.ZoneDto);
  }
}(this, function(ApiClient, ZoneDto) {
  'use strict';




  /**
   * The ListDtoZoneDto model module.
   * @module model/ListDtoZoneDto
   * @version v1
   */

  /**
   * Constructs a new <code>ListDtoZoneDto</code>.
   * @alias module:model/ListDtoZoneDto
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>ListDtoZoneDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ListDtoZoneDto} obj Optional instance to populate.
   * @return {module:model/ListDtoZoneDto} The populated <code>ListDtoZoneDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [ZoneDto]);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/ZoneDto>} list
   */
  exports.prototype['list'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./ZoneDto":158}],122:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/Encoding', 'model/IRequiredMemberSelector', 'model/MediaTypeHeaderValue', 'model/MediaTypeMapping'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./Encoding'), require('./IRequiredMemberSelector'), require('./MediaTypeHeaderValue'), require('./MediaTypeMapping'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.MediaTypeFormatter = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.Encoding, root.GatewaySoftwareApi.IRequiredMemberSelector, root.GatewaySoftwareApi.MediaTypeHeaderValue, root.GatewaySoftwareApi.MediaTypeMapping);
  }
}(this, function(ApiClient, Encoding, IRequiredMemberSelector, MediaTypeHeaderValue, MediaTypeMapping) {
  'use strict';




  /**
   * The MediaTypeFormatter model module.
   * @module model/MediaTypeFormatter
   * @version v1
   */

  /**
   * Constructs a new <code>MediaTypeFormatter</code>.
   * @alias module:model/MediaTypeFormatter
   * @class
   */
  var exports = function() {
    var _this = this;





  };

  /**
   * Constructs a <code>MediaTypeFormatter</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MediaTypeFormatter} obj Optional instance to populate.
   * @return {module:model/MediaTypeFormatter} The populated <code>MediaTypeFormatter</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('supportedMediaTypes')) {
        obj['supportedMediaTypes'] = ApiClient.convertToType(data['supportedMediaTypes'], [MediaTypeHeaderValue]);
      }
      if (data.hasOwnProperty('supportedEncodings')) {
        obj['supportedEncodings'] = ApiClient.convertToType(data['supportedEncodings'], [Encoding]);
      }
      if (data.hasOwnProperty('mediaTypeMappings')) {
        obj['mediaTypeMappings'] = ApiClient.convertToType(data['mediaTypeMappings'], [MediaTypeMapping]);
      }
      if (data.hasOwnProperty('requiredMemberSelector')) {
        obj['requiredMemberSelector'] = IRequiredMemberSelector.constructFromObject(data['requiredMemberSelector']);
      }
    }
    return obj;
  }

  /**
   * @member {Array.<module:model/MediaTypeHeaderValue>} supportedMediaTypes
   */
  exports.prototype['supportedMediaTypes'] = undefined;
  /**
   * @member {Array.<module:model/Encoding>} supportedEncodings
   */
  exports.prototype['supportedEncodings'] = undefined;
  /**
   * @member {Array.<module:model/MediaTypeMapping>} mediaTypeMappings
   */
  exports.prototype['mediaTypeMappings'] = undefined;
  /**
   * @member {module:model/IRequiredMemberSelector} requiredMemberSelector
   */
  exports.prototype['requiredMemberSelector'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./Encoding":90,"./IRequiredMemberSelector":93,"./MediaTypeHeaderValue":123,"./MediaTypeMapping":124}],123:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/NameValueHeaderValue'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./NameValueHeaderValue'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.MediaTypeHeaderValue = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.NameValueHeaderValue);
  }
}(this, function(ApiClient, NameValueHeaderValue) {
  'use strict';




  /**
   * The MediaTypeHeaderValue model module.
   * @module model/MediaTypeHeaderValue
   * @version v1
   */

  /**
   * Constructs a new <code>MediaTypeHeaderValue</code>.
   * @alias module:model/MediaTypeHeaderValue
   * @class
   */
  var exports = function() {
    var _this = this;




  };

  /**
   * Constructs a <code>MediaTypeHeaderValue</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MediaTypeHeaderValue} obj Optional instance to populate.
   * @return {module:model/MediaTypeHeaderValue} The populated <code>MediaTypeHeaderValue</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('charSet')) {
        obj['charSet'] = ApiClient.convertToType(data['charSet'], 'String');
      }
      if (data.hasOwnProperty('parameters')) {
        obj['parameters'] = ApiClient.convertToType(data['parameters'], [NameValueHeaderValue]);
      }
      if (data.hasOwnProperty('mediaType')) {
        obj['mediaType'] = ApiClient.convertToType(data['mediaType'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {String} charSet
   */
  exports.prototype['charSet'] = undefined;
  /**
   * @member {Array.<module:model/NameValueHeaderValue>} parameters
   */
  exports.prototype['parameters'] = undefined;
  /**
   * @member {String} mediaType
   */
  exports.prototype['mediaType'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./NameValueHeaderValue":126}],124:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/MediaTypeHeaderValue'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./MediaTypeHeaderValue'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.MediaTypeMapping = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.MediaTypeHeaderValue);
  }
}(this, function(ApiClient, MediaTypeHeaderValue) {
  'use strict';




  /**
   * The MediaTypeMapping model module.
   * @module model/MediaTypeMapping
   * @version v1
   */

  /**
   * Constructs a new <code>MediaTypeMapping</code>.
   * @alias module:model/MediaTypeMapping
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>MediaTypeMapping</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MediaTypeMapping} obj Optional instance to populate.
   * @return {module:model/MediaTypeMapping} The populated <code>MediaTypeMapping</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('mediaType')) {
        obj['mediaType'] = MediaTypeHeaderValue.constructFromObject(data['mediaType']);
      }
    }
    return obj;
  }

  /**
   * @member {module:model/MediaTypeHeaderValue} mediaType
   */
  exports.prototype['mediaType'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./MediaTypeHeaderValue":123}],125:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.MotionSensorDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The MotionSensorDto model module.
   * @module model/MotionSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>MotionSensorDto</code>.
   * @alias module:model/MotionSensorDto
   * @class
   * @param name {String} 
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;






  };

  /**
   * Constructs a <code>MotionSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/MotionSensorDto} obj Optional instance to populate.
   * @return {module:model/MotionSensorDto} The populated <code>MotionSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('state')) {
        obj['state'] = ApiClient.convertToType(data['state'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {String} state
   */
  exports.prototype['state'] = undefined;
  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],126:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.NameValueHeaderValue = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The NameValueHeaderValue model module.
   * @module model/NameValueHeaderValue
   * @version v1
   */

  /**
   * Constructs a new <code>NameValueHeaderValue</code>.
   * @alias module:model/NameValueHeaderValue
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>NameValueHeaderValue</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/NameValueHeaderValue} obj Optional instance to populate.
   * @return {module:model/NameValueHeaderValue} The populated <code>NameValueHeaderValue</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('value')) {
        obj['value'] = ApiClient.convertToType(data['value'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} value
   */
  exports.prototype['value'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],127:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.NodeDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The NodeDto model module.
   * @module model/NodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>NodeDto</code>.
   * @alias module:model/NodeDto
   * @class
   */
  var exports = function() {
    var _this = this;











  };

  /**
   * Constructs a <code>NodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/NodeDto} obj Optional instance to populate.
   * @return {module:model/NodeDto} The populated <code>NodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('isEmergency')) {
        obj['isEmergency'] = ApiClient.convertToType(data['isEmergency'], 'Boolean');
      }
      if (data.hasOwnProperty('emergencyTimeout')) {
        obj['emergencyTimeout'] = ApiClient.convertToType(data['emergencyTimeout'], 'Number');
      }
      if (data.hasOwnProperty('emergencyLightLevel')) {
        obj['emergencyLightLevel'] = ApiClient.convertToType(data['emergencyLightLevel'], 'Number');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {Boolean} isEmergency
   */
  exports.prototype['isEmergency'] = undefined;
  /**
   * @member {Number} emergencyTimeout
   */
  exports.prototype['emergencyTimeout'] = undefined;
  /**
   * @member {Number} emergencyLightLevel
   */
  exports.prototype['emergencyLightLevel'] = undefined;
  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],128:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient', 'model/DevicesSearchResultDto'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'), require('./DevicesSearchResultDto'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.PaginatedListDevicesSearchResultDto = factory(root.GatewaySoftwareApi.ApiClient, root.GatewaySoftwareApi.DevicesSearchResultDto);
  }
}(this, function(ApiClient, DevicesSearchResultDto) {
  'use strict';




  /**
   * The PaginatedListDevicesSearchResultDto model module.
   * @module model/PaginatedListDevicesSearchResultDto
   * @version v1
   */

  /**
   * Constructs a new <code>PaginatedListDevicesSearchResultDto</code>.
   * @alias module:model/PaginatedListDevicesSearchResultDto
   * @class
   */
  var exports = function() {
    var _this = this;









  };

  /**
   * Constructs a <code>PaginatedListDevicesSearchResultDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/PaginatedListDevicesSearchResultDto} obj Optional instance to populate.
   * @return {module:model/PaginatedListDevicesSearchResultDto} The populated <code>PaginatedListDevicesSearchResultDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('filteredCount')) {
        obj['filteredCount'] = ApiClient.convertToType(data['filteredCount'], 'Number');
      }
      if (data.hasOwnProperty('totalCount')) {
        obj['totalCount'] = ApiClient.convertToType(data['totalCount'], 'Number');
      }
      if (data.hasOwnProperty('page')) {
        obj['page'] = ApiClient.convertToType(data['page'], 'Number');
      }
      if (data.hasOwnProperty('pageSize')) {
        obj['pageSize'] = ApiClient.convertToType(data['pageSize'], 'Number');
      }
      if (data.hasOwnProperty('pageCount')) {
        obj['pageCount'] = ApiClient.convertToType(data['pageCount'], 'Number');
      }
      if (data.hasOwnProperty('list')) {
        obj['list'] = ApiClient.convertToType(data['list'], [DevicesSearchResultDto]);
      }
      if (data.hasOwnProperty('hasPreviousPage')) {
        obj['hasPreviousPage'] = ApiClient.convertToType(data['hasPreviousPage'], 'Boolean');
      }
      if (data.hasOwnProperty('hasNextPage')) {
        obj['hasNextPage'] = ApiClient.convertToType(data['hasNextPage'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * @member {Number} filteredCount
   */
  exports.prototype['filteredCount'] = undefined;
  /**
   * @member {Number} totalCount
   */
  exports.prototype['totalCount'] = undefined;
  /**
   * @member {Number} page
   */
  exports.prototype['page'] = undefined;
  /**
   * @member {Number} pageSize
   */
  exports.prototype['pageSize'] = undefined;
  /**
   * @member {Number} pageCount
   */
  exports.prototype['pageCount'] = undefined;
  /**
   * @member {Array.<module:model/DevicesSearchResultDto>} list
   */
  exports.prototype['list'] = undefined;
  /**
   * @member {Boolean} hasPreviousPage
   */
  exports.prototype['hasPreviousPage'] = undefined;
  /**
   * @member {Boolean} hasNextPage
   */
  exports.prototype['hasNextPage'] = undefined;



  return exports;
}));



},{"../ApiClient":10,"./DevicesSearchResultDto":86}],129:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.PolicyDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The PolicyDto model module.
   * @module model/PolicyDto
   * @version v1
   */

  /**
   * Constructs a new <code>PolicyDto</code>.
   * @alias module:model/PolicyDto
   * @class
   */
  var exports = function() {
    var _this = this;








  };

  /**
   * Constructs a <code>PolicyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/PolicyDto} obj Optional instance to populate.
   * @return {module:model/PolicyDto} The populated <code>PolicyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('minimumLightLevel')) {
        obj['minimumLightLevel'] = ApiClient.convertToType(data['minimumLightLevel'], 'Number');
      }
      if (data.hasOwnProperty('maximumLightLevel')) {
        obj['maximumLightLevel'] = ApiClient.convertToType(data['maximumLightLevel'], 'Number');
      }
      if (data.hasOwnProperty('occupancyTimeout')) {
        obj['occupancyTimeout'] = ApiClient.convertToType(data['occupancyTimeout'], 'Number');
      }
      if (data.hasOwnProperty('spaceTypeId')) {
        obj['spaceTypeId'] = ApiClient.convertToType(data['spaceTypeId'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} type
   */
  exports.prototype['type'] = undefined;
  /**
   * @member {Number} minimumLightLevel
   */
  exports.prototype['minimumLightLevel'] = undefined;
  /**
   * @member {Number} maximumLightLevel
   */
  exports.prototype['maximumLightLevel'] = undefined;
  /**
   * @member {Number} occupancyTimeout
   */
  exports.prototype['occupancyTimeout'] = undefined;
  /**
   * @member {Number} spaceTypeId
   */
  exports.prototype['spaceTypeId'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],130:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.RelayDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The RelayDto model module.
   * @module model/RelayDto
   * @version v1
   */

  /**
   * Constructs a new <code>RelayDto</code>.
   * @alias module:model/RelayDto
   * @class
   */
  var exports = function() {
    var _this = this;










  };

  /**
   * Constructs a <code>RelayDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/RelayDto} obj Optional instance to populate.
   * @return {module:model/RelayDto} The populated <code>RelayDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('state')) {
        obj['state'] = ApiClient.convertToType(data['state'], 'String');
      }
      if (data.hasOwnProperty('isInverted')) {
        obj['isInverted'] = ApiClient.convertToType(data['isInverted'], 'Boolean');
      }
    }
    return obj;
  }

  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;
  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {String} state
   */
  exports.prototype['state'] = undefined;
  /**
   * @member {Boolean} isInverted
   */
  exports.prototype['isInverted'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],131:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ScheduleDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ScheduleDto model module.
   * @module model/ScheduleDto
   * @version v1
   */

  /**
   * Constructs a new <code>ScheduleDto</code>.
   * @alias module:model/ScheduleDto
   * @class
   * @param name {String} 
   * @param cronExpression {String} 
   */
  var exports = function(name, cronExpression) {
    var _this = this;


    _this['name'] = name;
    _this['cronExpression'] = cronExpression;
  };

  /**
   * Constructs a <code>ScheduleDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ScheduleDto} obj Optional instance to populate.
   * @return {module:model/ScheduleDto} The populated <code>ScheduleDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('cronExpression')) {
        obj['cronExpression'] = ApiClient.convertToType(data['cronExpression'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} cronExpression
   */
  exports.prototype['cronExpression'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],132:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.SpaceDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The SpaceDto model module.
   * @module model/SpaceDto
   * @version v1
   */

  /**
   * Constructs a new <code>SpaceDto</code>.
   * The space
   * @alias module:model/SpaceDto
   * @class
   * @param name {String} The space name
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;








  };

  /**
   * Constructs a <code>SpaceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/SpaceDto} obj Optional instance to populate.
   * @return {module:model/SpaceDto} The populated <code>SpaceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('mode')) {
        obj['mode'] = ApiClient.convertToType(data['mode'], 'String');
      }
      if (data.hasOwnProperty('areZonesDisabled')) {
        obj['areZonesDisabled'] = ApiClient.convertToType(data['areZonesDisabled'], 'Boolean');
      }
      if (data.hasOwnProperty('state')) {
        obj['state'] = ApiClient.convertToType(data['state'], 'String');
      }
      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
      if (data.hasOwnProperty('kelvin')) {
        obj['kelvin'] = ApiClient.convertToType(data['kelvin'], 'Number');
      }
      if (data.hasOwnProperty('hasTunableLights')) {
        obj['hasTunableLights'] = ApiClient.convertToType(data['hasTunableLights'], 'Boolean');
      }
      if (data.hasOwnProperty('minimumKelvin')) {
        obj['minimumKelvin'] = ApiClient.convertToType(data['minimumKelvin'], 'Number');
      }
      if (data.hasOwnProperty('maximumKelvin')) {
        obj['maximumKelvin'] = ApiClient.convertToType(data['maximumKelvin'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The space ID
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * The space name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The space mode (Occupancy, Vacancy)
   * @member {String} mode
   */
  exports.prototype['mode'] = undefined;
  /**
   * Whether zones are disabled for this space
   * @member {Boolean} areZonesDisabled
   */
  exports.prototype['areZonesDisabled'] = undefined;
  /**
   * The space state (On, Off)
   * @member {String} state
   */
  exports.prototype['state'] = undefined;
  /**
   * The space level (0-10000)
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;
  /**
   * The color temperature of the space in Kelvin
   * @member {Number} kelvin
   */
  exports.prototype['kelvin'] = undefined;
  /**
   * Whether the space has tunable lights
   * @member {Boolean} hasTunableLights
   */
  exports.prototype['hasTunableLights'] = undefined;
  /**
   * The minimum color temperature in Kelvin
   * @member {Number} minimumKelvin
   */
  exports.prototype['minimumKelvin'] = undefined;
  /**
   * The maximum color temperature in Kelvin
   * @member {Number} maximumKelvin
   */
  exports.prototype['maximumKelvin'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],133:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.SpaceTimerDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The SpaceTimerDto model module.
   * @module model/SpaceTimerDto
   * @version v1
   */

  /**
   * Constructs a new <code>SpaceTimerDto</code>.
   * @alias module:model/SpaceTimerDto
   * @class
   */
  var exports = function() {
    var _this = this;






  };

  /**
   * Constructs a <code>SpaceTimerDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/SpaceTimerDto} obj Optional instance to populate.
   * @return {module:model/SpaceTimerDto} The populated <code>SpaceTimerDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('spaceId')) {
        obj['spaceId'] = ApiClient.convertToType(data['spaceId'], 'Number');
      }
      if (data.hasOwnProperty('timeOut')) {
        obj['timeOut'] = ApiClient.convertToType(data['timeOut'], 'Number');
      }
      if (data.hasOwnProperty('expiresIn')) {
        obj['expiresIn'] = ApiClient.convertToType(data['expiresIn'], 'Number');
      }
      if (data.hasOwnProperty('dateTimeStarted')) {
        obj['dateTimeStarted'] = ApiClient.convertToType(data['dateTimeStarted'], 'Date');
      }
      if (data.hasOwnProperty('dateTimeExpires')) {
        obj['dateTimeExpires'] = ApiClient.convertToType(data['dateTimeExpires'], 'Date');
      }
    }
    return obj;
  }

  /**
   * @member {Number} spaceId
   */
  exports.prototype['spaceId'] = undefined;
  /**
   * @member {Number} timeOut
   */
  exports.prototype['timeOut'] = undefined;
  /**
   * @member {Number} expiresIn
   */
  exports.prototype['expiresIn'] = undefined;
  /**
   * @member {Date} dateTimeStarted
   */
  exports.prototype['dateTimeStarted'] = undefined;
  /**
   * @member {Date} dateTimeExpires
   */
  exports.prototype['dateTimeExpires'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],134:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.SpaceTypeDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The SpaceTypeDto model module.
   * @module model/SpaceTypeDto
   * @version v1
   */

  /**
   * Constructs a new <code>SpaceTypeDto</code>.
   * @alias module:model/SpaceTypeDto
   * @class
   */
  var exports = function() {
    var _this = this;



  };

  /**
   * Constructs a <code>SpaceTypeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/SpaceTypeDto} obj Optional instance to populate.
   * @return {module:model/SpaceTypeDto} The populated <code>SpaceTypeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * The space type ID
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * The space type name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],135:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.SwitchDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The SwitchDto model module.
   * @module model/SwitchDto
   * @version v1
   */

  /**
   * Constructs a new <code>SwitchDto</code>.
   * @alias module:model/SwitchDto
   * @class
   * @param name {String} 
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;






  };

  /**
   * Constructs a <code>SwitchDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/SwitchDto} obj Optional instance to populate.
   * @return {module:model/SwitchDto} The populated <code>SwitchDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('state')) {
        obj['state'] = ApiClient.convertToType(data['state'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {String} state
   */
  exports.prototype['state'] = undefined;
  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],136:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.TemperatureSensorDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The TemperatureSensorDto model module.
   * @module model/TemperatureSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>TemperatureSensorDto</code>.
   * @alias module:model/TemperatureSensorDto
   * @class
   * @param name {String} 
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;






  };

  /**
   * Constructs a <code>TemperatureSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/TemperatureSensorDto} obj Optional instance to populate.
   * @return {module:model/TemperatureSensorDto} The populated <code>TemperatureSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('protocol')) {
        obj['protocol'] = ApiClient.convertToType(data['protocol'], 'String');
      }
      if (data.hasOwnProperty('externalId')) {
        obj['externalId'] = ApiClient.convertToType(data['externalId'], 'String');
      }
      if (data.hasOwnProperty('discoveredDate')) {
        obj['discoveredDate'] = ApiClient.convertToType(data['discoveredDate'], 'Date');
      }
      if (data.hasOwnProperty('isOnline')) {
        obj['isOnline'] = ApiClient.convertToType(data['isOnline'], 'Boolean');
      }
      if (data.hasOwnProperty('temperature')) {
        obj['temperature'] = ApiClient.convertToType(data['temperature'], 'Number');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {String} protocol
   */
  exports.prototype['protocol'] = undefined;
  /**
   * @member {String} externalId
   */
  exports.prototype['externalId'] = undefined;
  /**
   * @member {Date} discoveredDate
   */
  exports.prototype['discoveredDate'] = undefined;
  /**
   * @member {Boolean} isOnline
   */
  exports.prototype['isOnline'] = undefined;
  /**
   * @member {Number} temperature
   */
  exports.prototype['temperature'] = undefined;
  /**
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],137:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateActionDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateActionDto model module.
   * @module model/UpdateActionDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateActionDto</code>.
   * The action
   * @alias module:model/UpdateActionDto
   * @class
   * @param type {module:model/UpdateActionDto.TypeEnum} The action type
   * @param spaceId {Number} The space ID
   * @param level {Number} The level
   */
  var exports = function(type, spaceId, level) {
    var _this = this;

    _this['type'] = type;
    _this['spaceId'] = spaceId;
    _this['level'] = level;
  };

  /**
   * Constructs a <code>UpdateActionDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateActionDto} obj Optional instance to populate.
   * @return {module:model/UpdateActionDto} The populated <code>UpdateActionDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('type')) {
        obj['type'] = ApiClient.convertToType(data['type'], 'String');
      }
      if (data.hasOwnProperty('spaceId')) {
        obj['spaceId'] = ApiClient.convertToType(data['spaceId'], 'Number');
      }
      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The action type
   * @member {module:model/UpdateActionDto.TypeEnum} type
   */
  exports.prototype['type'] = undefined;
  /**
   * The space ID
   * @member {Number} spaceId
   */
  exports.prototype['spaceId'] = undefined;
  /**
   * The level
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;


  /**
   * Allowed values for the <code>type</code> property.
   * @enum {String}
   * @readonly
   */
  exports.TypeEnum = {
    /**
     * value: "TurnOff"
     * @const
     */
    "TurnOff": "TurnOff",
    /**
     * value: "TurnOn"
     * @const
     */
    "TurnOn": "TurnOn",
    /**
     * value: "Dim"
     * @const
     */
    "Dim": "Dim"  };


  return exports;
}));



},{"../ApiClient":10}],138:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateActionSetDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateActionSetDto model module.
   * @module model/UpdateActionSetDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateActionSetDto</code>.
   * The action set
   * @alias module:model/UpdateActionSetDto
   * @class
   * @param name {String} The action set name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>UpdateActionSetDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateActionSetDto} obj Optional instance to populate.
   * @return {module:model/UpdateActionSetDto} The populated <code>UpdateActionSetDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * The action set name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],139:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateApplicationKeyDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateApplicationKeyDto model module.
   * @module model/UpdateApplicationKeyDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateApplicationKeyDto</code>.
   * The application key
   * @alias module:model/UpdateApplicationKeyDto
   * @class
   * @param name {String} The application key name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>UpdateApplicationKeyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateApplicationKeyDto} obj Optional instance to populate.
   * @return {module:model/UpdateApplicationKeyDto} The populated <code>UpdateApplicationKeyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * The application key name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],140:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateDeviceDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateDeviceDto model module.
   * @module model/UpdateDeviceDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateDeviceDto</code>.
   * The device
   * @alias module:model/UpdateDeviceDto
   * @class
   * @param name {String} The device name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;
  };

  /**
   * Constructs a <code>UpdateDeviceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateDeviceDto} obj Optional instance to populate.
   * @return {module:model/UpdateDeviceDto} The populated <code>UpdateDeviceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
    }
    return obj;
  }

  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],141:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateDeviceNodeDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateDeviceNodeDto model module.
   * @module model/UpdateDeviceNodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateDeviceNodeDto</code>.
   * The device node
   * @alias module:model/UpdateDeviceNodeDto
   * @class
   * @param name {String} The device name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateDeviceNodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateDeviceNodeDto} obj Optional instance to populate.
   * @return {module:model/UpdateDeviceNodeDto} The populated <code>UpdateDeviceNodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],142:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateDimmerDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateDimmerDto model module.
   * @module model/UpdateDimmerDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateDimmerDto</code>.
   * The dimmer
   * @alias module:model/UpdateDimmerDto
   * @class
   * @param name {String} The device name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateDimmerDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateDimmerDto} obj Optional instance to populate.
   * @return {module:model/UpdateDimmerDto} The populated <code>UpdateDimmerDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],143:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateLightDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateLightDto model module.
   * @module model/UpdateLightDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateLightDto</code>.
   * The light
   * @alias module:model/UpdateLightDto
   * @class
   * @param minLevel {Number} The minimum light level (0-10000)
   * @param maxLevel {Number} The maximum light level (0-10000)
   * @param name {String} The device name
   */
  var exports = function(minLevel, maxLevel, name) {
    var _this = this;

    _this['minLevel'] = minLevel;
    _this['maxLevel'] = maxLevel;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateLightDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateLightDto} obj Optional instance to populate.
   * @return {module:model/UpdateLightDto} The populated <code>UpdateLightDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('minLevel')) {
        obj['minLevel'] = ApiClient.convertToType(data['minLevel'], 'Number');
      }
      if (data.hasOwnProperty('maxLevel')) {
        obj['maxLevel'] = ApiClient.convertToType(data['maxLevel'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The minimum light level (0-10000)
   * @member {Number} minLevel
   */
  exports.prototype['minLevel'] = undefined;
  /**
   * The maximum light level (0-10000)
   * @member {Number} maxLevel
   */
  exports.prototype['maxLevel'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],144:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateLightSensorDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateLightSensorDto model module.
   * @module model/UpdateLightSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateLightSensorDto</code>.
   * The light sensor
   * @alias module:model/UpdateLightSensorDto
   * @class
   * @param minSensorLevel {Number} The minimum sensor level
   * @param maxSensorLevel {Number} The maximum sensor level
   * @param minIlluminance {Number} The minimum illuminance
   * @param maxIlluminance {Number} The maximum illuminance
   * @param name {String} The device name
   */
  var exports = function(minSensorLevel, maxSensorLevel, minIlluminance, maxIlluminance, name) {
    var _this = this;

    _this['minSensorLevel'] = minSensorLevel;
    _this['maxSensorLevel'] = maxSensorLevel;
    _this['minIlluminance'] = minIlluminance;
    _this['maxIlluminance'] = maxIlluminance;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateLightSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateLightSensorDto} obj Optional instance to populate.
   * @return {module:model/UpdateLightSensorDto} The populated <code>UpdateLightSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('minSensorLevel')) {
        obj['minSensorLevel'] = ApiClient.convertToType(data['minSensorLevel'], 'Number');
      }
      if (data.hasOwnProperty('maxSensorLevel')) {
        obj['maxSensorLevel'] = ApiClient.convertToType(data['maxSensorLevel'], 'Number');
      }
      if (data.hasOwnProperty('minIlluminance')) {
        obj['minIlluminance'] = ApiClient.convertToType(data['minIlluminance'], 'Number');
      }
      if (data.hasOwnProperty('maxIlluminance')) {
        obj['maxIlluminance'] = ApiClient.convertToType(data['maxIlluminance'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The minimum sensor level
   * @member {Number} minSensorLevel
   */
  exports.prototype['minSensorLevel'] = undefined;
  /**
   * The maximum sensor level
   * @member {Number} maxSensorLevel
   */
  exports.prototype['maxSensorLevel'] = undefined;
  /**
   * The minimum illuminance
   * @member {Number} minIlluminance
   */
  exports.prototype['minIlluminance'] = undefined;
  /**
   * The maximum illuminance
   * @member {Number} maxIlluminance
   */
  exports.prototype['maxIlluminance'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],145:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateMotionSensorDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateMotionSensorDto model module.
   * @module model/UpdateMotionSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateMotionSensorDto</code>.
   * The motion sensor
   * @alias module:model/UpdateMotionSensorDto
   * @class
   * @param name {String} The device name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateMotionSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateMotionSensorDto} obj Optional instance to populate.
   * @return {module:model/UpdateMotionSensorDto} The populated <code>UpdateMotionSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],146:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateNetworkNodeDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateNetworkNodeDto model module.
   * @module model/UpdateNetworkNodeDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateNetworkNodeDto</code>.
   * The network node
   * @alias module:model/UpdateNetworkNodeDto
   * @class
   * @param name {String} The device name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateNetworkNodeDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateNetworkNodeDto} obj Optional instance to populate.
   * @return {module:model/UpdateNetworkNodeDto} The populated <code>UpdateNetworkNodeDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],147:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdatePolicyDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdatePolicyDto model module.
   * @module model/UpdatePolicyDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdatePolicyDto</code>.
   * The policy
   * @alias module:model/UpdatePolicyDto
   * @class
   */
  var exports = function() {
    var _this = this;




  };

  /**
   * Constructs a <code>UpdatePolicyDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdatePolicyDto} obj Optional instance to populate.
   * @return {module:model/UpdatePolicyDto} The populated <code>UpdatePolicyDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('minimumLightLevel')) {
        obj['minimumLightLevel'] = ApiClient.convertToType(data['minimumLightLevel'], 'Number');
      }
      if (data.hasOwnProperty('maximumLightLevel')) {
        obj['maximumLightLevel'] = ApiClient.convertToType(data['maximumLightLevel'], 'Number');
      }
      if (data.hasOwnProperty('occupancyTimeout')) {
        obj['occupancyTimeout'] = ApiClient.convertToType(data['occupancyTimeout'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The minimum light level
   * @member {Number} minimumLightLevel
   */
  exports.prototype['minimumLightLevel'] = undefined;
  /**
   * The maximum light level
   * @member {Number} maximumLightLevel
   */
  exports.prototype['maximumLightLevel'] = undefined;
  /**
   * The occupancy timeout
   * @member {Number} occupancyTimeout
   */
  exports.prototype['occupancyTimeout'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],148:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateRelayDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateRelayDto model module.
   * @module model/UpdateRelayDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateRelayDto</code>.
   * The relay to be updated
   * @alias module:model/UpdateRelayDto
   * @class
   * @param isInverted {Boolean} Should this relay invert its commands. This means turning a space \"on\" would open the relay.
   * @param name {String} The device name
   */
  var exports = function(isInverted, name) {
    var _this = this;

    _this['isInverted'] = isInverted;
    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateRelayDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateRelayDto} obj Optional instance to populate.
   * @return {module:model/UpdateRelayDto} The populated <code>UpdateRelayDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('isInverted')) {
        obj['isInverted'] = ApiClient.convertToType(data['isInverted'], 'Boolean');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * Should this relay invert its commands. This means turning a space \"on\" would open the relay.
   * @member {Boolean} isInverted
   */
  exports.prototype['isInverted'] = undefined;
  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],149:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateScheduleActionSetDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateScheduleActionSetDto model module.
   * @module model/UpdateScheduleActionSetDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateScheduleActionSetDto</code>.
   * The action set
   * @alias module:model/UpdateScheduleActionSetDto
   * @class
   * @param id {Number} The action set ID
   */
  var exports = function(id) {
    var _this = this;

    _this['id'] = id;
  };

  /**
   * Constructs a <code>UpdateScheduleActionSetDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateScheduleActionSetDto} obj Optional instance to populate.
   * @return {module:model/UpdateScheduleActionSetDto} The populated <code>UpdateScheduleActionSetDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The action set ID
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],150:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateScheduleDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateScheduleDto model module.
   * @module model/UpdateScheduleDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateScheduleDto</code>.
   * The schedule
   * @alias module:model/UpdateScheduleDto
   * @class
   * @param name {String} The schedule name
   * @param cronExpression {String} The cron expression
   */
  var exports = function(name, cronExpression) {
    var _this = this;

    _this['name'] = name;
    _this['cronExpression'] = cronExpression;
  };

  /**
   * Constructs a <code>UpdateScheduleDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateScheduleDto} obj Optional instance to populate.
   * @return {module:model/UpdateScheduleDto} The populated <code>UpdateScheduleDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('cronExpression')) {
        obj['cronExpression'] = ApiClient.convertToType(data['cronExpression'], 'String');
      }
    }
    return obj;
  }

  /**
   * The schedule name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The cron expression
   * @member {String} cronExpression
   */
  exports.prototype['cronExpression'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],151:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateSpaceDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateSpaceDto model module.
   * @module model/UpdateSpaceDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateSpaceDto</code>.
   * The space
   * @alias module:model/UpdateSpaceDto
   * @class
   * @param name {String} The space name
   * @param mode {module:model/UpdateSpaceDto.ModeEnum} The space mode
   */
  var exports = function(name, mode) {
    var _this = this;

    _this['name'] = name;
    _this['mode'] = mode;
  };

  /**
   * Constructs a <code>UpdateSpaceDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateSpaceDto} obj Optional instance to populate.
   * @return {module:model/UpdateSpaceDto} The populated <code>UpdateSpaceDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('mode')) {
        obj['mode'] = ApiClient.convertToType(data['mode'], 'String');
      }
    }
    return obj;
  }

  /**
   * The space name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The space mode
   * @member {module:model/UpdateSpaceDto.ModeEnum} mode
   */
  exports.prototype['mode'] = undefined;


  /**
   * Allowed values for the <code>mode</code> property.
   * @enum {String}
   * @readonly
   */
  exports.ModeEnum = {
    /**
     * value: "Occupancy"
     * @const
     */
    "Occupancy": "Occupancy",
    /**
     * value: "Vacancy"
     * @const
     */
    "Vacancy": "Vacancy"  };


  return exports;
}));



},{"../ApiClient":10}],152:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateSwitchDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateSwitchDto model module.
   * @module model/UpdateSwitchDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateSwitchDto</code>.
   * The switch
   * @alias module:model/UpdateSwitchDto
   * @class
   * @param name {String} The device name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateSwitchDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateSwitchDto} obj Optional instance to populate.
   * @return {module:model/UpdateSwitchDto} The populated <code>UpdateSwitchDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],153:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateTemperatureSensorDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateTemperatureSensorDto model module.
   * @module model/UpdateTemperatureSensorDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateTemperatureSensorDto</code>.
   * The temperature sensor
   * @alias module:model/UpdateTemperatureSensorDto
   * @class
   * @param name {String} The device name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;

  };

  /**
   * Constructs a <code>UpdateTemperatureSensorDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateTemperatureSensorDto} obj Optional instance to populate.
   * @return {module:model/UpdateTemperatureSensorDto} The populated <code>UpdateTemperatureSensorDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('properties')) {
        obj['properties'] = ApiClient.convertToType(data['properties'], 'String');
      }
    }
    return obj;
  }

  /**
   * The device name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The external system's device properties
   * @member {String} properties
   */
  exports.prototype['properties'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],154:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateWebHookDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateWebHookDto model module.
   * @module model/UpdateWebHookDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateWebHookDto</code>.
   * The web hook
   * @alias module:model/UpdateWebHookDto
   * @class
   * @param domainEvents {Array.<String>} The domain events associated with this web hook
   * @param callbackUrl {String} The callback URL
   */
  var exports = function(domainEvents, callbackUrl) {
    var _this = this;

    _this['domainEvents'] = domainEvents;
    _this['callbackUrl'] = callbackUrl;
  };

  /**
   * Constructs a <code>UpdateWebHookDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateWebHookDto} obj Optional instance to populate.
   * @return {module:model/UpdateWebHookDto} The populated <code>UpdateWebHookDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('domainEvents')) {
        obj['domainEvents'] = ApiClient.convertToType(data['domainEvents'], ['String']);
      }
      if (data.hasOwnProperty('callbackUrl')) {
        obj['callbackUrl'] = ApiClient.convertToType(data['callbackUrl'], 'String');
      }
    }
    return obj;
  }

  /**
   * The domain events associated with this web hook
   * @member {Array.<String>} domainEvents
   */
  exports.prototype['domainEvents'] = undefined;
  /**
   * The callback URL
   * @member {String} callbackUrl
   */
  exports.prototype['callbackUrl'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],155:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UpdateZoneDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UpdateZoneDto model module.
   * @module model/UpdateZoneDto
   * @version v1
   */

  /**
   * Constructs a new <code>UpdateZoneDto</code>.
   * The zone
   * @alias module:model/UpdateZoneDto
   * @class
   * @param name {String} The zone name
   */
  var exports = function(name) {
    var _this = this;

    _this['name'] = name;







  };

  /**
   * Constructs a <code>UpdateZoneDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UpdateZoneDto} obj Optional instance to populate.
   * @return {module:model/UpdateZoneDto} The populated <code>UpdateZoneDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('setpoint')) {
        obj['setpoint'] = ApiClient.convertToType(data['setpoint'], 'Number');
      }
      if (data.hasOwnProperty('deadband')) {
        obj['deadband'] = ApiClient.convertToType(data['deadband'], 'Number');
      }
      if (data.hasOwnProperty('bias')) {
        obj['bias'] = ApiClient.convertToType(data['bias'], 'Number');
      }
      if (data.hasOwnProperty('gain')) {
        obj['gain'] = ApiClient.convertToType(data['gain'], 'Number');
      }
      if (data.hasOwnProperty('timeDelay')) {
        obj['timeDelay'] = ApiClient.convertToType(data['timeDelay'], 'Number');
      }
      if (data.hasOwnProperty('raiseDimRate')) {
        obj['raiseDimRate'] = ApiClient.convertToType(data['raiseDimRate'], 'Number');
      }
      if (data.hasOwnProperty('lowerDimRate')) {
        obj['lowerDimRate'] = ApiClient.convertToType(data['lowerDimRate'], 'Number');
      }
    }
    return obj;
  }

  /**
   * The zone name
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * The setpoint
   * @member {Number} setpoint
   */
  exports.prototype['setpoint'] = undefined;
  /**
   * The deadband
   * @member {Number} deadband
   */
  exports.prototype['deadband'] = undefined;
  /**
   * The bias
   * @member {Number} bias
   */
  exports.prototype['bias'] = undefined;
  /**
   * The gain
   * @member {Number} gain
   */
  exports.prototype['gain'] = undefined;
  /**
   * The time delay
   * @member {Number} timeDelay
   */
  exports.prototype['timeDelay'] = undefined;
  /**
   * The raise dim rate
   * @member {Number} raiseDimRate
   */
  exports.prototype['raiseDimRate'] = undefined;
  /**
   * The lower dim rate
   * @member {Number} lowerDimRate
   */
  exports.prototype['lowerDimRate'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],156:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.UrlHelper = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The UrlHelper model module.
   * @module model/UrlHelper
   * @version v1
   */

  /**
   * Constructs a new <code>UrlHelper</code>.
   * @alias module:model/UrlHelper
   * @class
   */
  var exports = function() {
    var _this = this;


  };

  /**
   * Constructs a <code>UrlHelper</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/UrlHelper} obj Optional instance to populate.
   * @return {module:model/UrlHelper} The populated <code>UrlHelper</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('request')) {
        obj['request'] = ApiClient.convertToType(data['request'], Object);
      }
    }
    return obj;
  }

  /**
   * @member {Object} request
   */
  exports.prototype['request'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],157:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.WebHookDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The WebHookDto model module.
   * @module model/WebHookDto
   * @version v1
   */

  /**
   * Constructs a new <code>WebHookDto</code>.
   * @alias module:model/WebHookDto
   * @class
   * @param domainEvents {Array.<String>} 
   * @param callbackUrl {String} 
   */
  var exports = function(domainEvents, callbackUrl) {
    var _this = this;


    _this['domainEvents'] = domainEvents;
    _this['callbackUrl'] = callbackUrl;


  };

  /**
   * Constructs a <code>WebHookDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/WebHookDto} obj Optional instance to populate.
   * @return {module:model/WebHookDto} The populated <code>WebHookDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('domainEvents')) {
        obj['domainEvents'] = ApiClient.convertToType(data['domainEvents'], ['String']);
      }
      if (data.hasOwnProperty('callbackUrl')) {
        obj['callbackUrl'] = ApiClient.convertToType(data['callbackUrl'], 'String');
      }
      if (data.hasOwnProperty('applicationKeyId')) {
        obj['applicationKeyId'] = ApiClient.convertToType(data['applicationKeyId'], 'Number');
      }
      if (data.hasOwnProperty('applicationKey')) {
        obj['applicationKey'] = ApiClient.convertToType(data['applicationKey'], 'String');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {Array.<String>} domainEvents
   */
  exports.prototype['domainEvents'] = undefined;
  /**
   * @member {String} callbackUrl
   */
  exports.prototype['callbackUrl'] = undefined;
  /**
   * @member {Number} applicationKeyId
   */
  exports.prototype['applicationKeyId'] = undefined;
  /**
   * @member {String} applicationKey
   */
  exports.prototype['applicationKey'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],158:[function(require,module,exports){
/**
 * Gateway Software API
 * No description provided (generated by Swagger Codegen https://github.com/swagger-api/swagger-codegen)
 *
 * OpenAPI spec version: v1
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 2.2.3
 *
 * Do not edit the class manually.
 *
 */

(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['ApiClient'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // CommonJS-like environments that support module.exports, like Node.
    module.exports = factory(require('../ApiClient'));
  } else {
    // Browser globals (root is window)
    if (!root.GatewaySoftwareApi) {
      root.GatewaySoftwareApi = {};
    }
    root.GatewaySoftwareApi.ZoneDto = factory(root.GatewaySoftwareApi.ApiClient);
  }
}(this, function(ApiClient) {
  'use strict';




  /**
   * The ZoneDto model module.
   * @module model/ZoneDto
   * @version v1
   */

  /**
   * Constructs a new <code>ZoneDto</code>.
   * @alias module:model/ZoneDto
   * @class
   * @param name {String} 
   */
  var exports = function(name) {
    var _this = this;


    _this['name'] = name;








  };

  /**
   * Constructs a <code>ZoneDto</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/ZoneDto} obj Optional instance to populate.
   * @return {module:model/ZoneDto} The populated <code>ZoneDto</code> instance.
   */
  exports.constructFromObject = function(data, obj) {
    if (data) {
      obj = obj || new exports();

      if (data.hasOwnProperty('id')) {
        obj['id'] = ApiClient.convertToType(data['id'], 'Number');
      }
      if (data.hasOwnProperty('name')) {
        obj['name'] = ApiClient.convertToType(data['name'], 'String');
      }
      if (data.hasOwnProperty('setpoint')) {
        obj['setpoint'] = ApiClient.convertToType(data['setpoint'], 'Number');
      }
      if (data.hasOwnProperty('deadband')) {
        obj['deadband'] = ApiClient.convertToType(data['deadband'], 'Number');
      }
      if (data.hasOwnProperty('bias')) {
        obj['bias'] = ApiClient.convertToType(data['bias'], 'Number');
      }
      if (data.hasOwnProperty('gain')) {
        obj['gain'] = ApiClient.convertToType(data['gain'], 'Number');
      }
      if (data.hasOwnProperty('timeDelay')) {
        obj['timeDelay'] = ApiClient.convertToType(data['timeDelay'], 'Number');
      }
      if (data.hasOwnProperty('raiseDimRate')) {
        obj['raiseDimRate'] = ApiClient.convertToType(data['raiseDimRate'], 'Number');
      }
      if (data.hasOwnProperty('lowerDimRate')) {
        obj['lowerDimRate'] = ApiClient.convertToType(data['lowerDimRate'], 'Number');
      }
      if (data.hasOwnProperty('level')) {
        obj['level'] = ApiClient.convertToType(data['level'], 'Number');
      }
    }
    return obj;
  }

  /**
   * @member {Number} id
   */
  exports.prototype['id'] = undefined;
  /**
   * @member {String} name
   */
  exports.prototype['name'] = undefined;
  /**
   * @member {Number} setpoint
   */
  exports.prototype['setpoint'] = undefined;
  /**
   * @member {Number} deadband
   */
  exports.prototype['deadband'] = undefined;
  /**
   * @member {Number} bias
   */
  exports.prototype['bias'] = undefined;
  /**
   * @member {Number} gain
   */
  exports.prototype['gain'] = undefined;
  /**
   * @member {Number} timeDelay
   */
  exports.prototype['timeDelay'] = undefined;
  /**
   * @member {Number} raiseDimRate
   */
  exports.prototype['raiseDimRate'] = undefined;
  /**
   * @member {Number} lowerDimRate
   */
  exports.prototype['lowerDimRate'] = undefined;
  /**
   * @member {Number} level
   */
  exports.prototype['level'] = undefined;



  return exports;
}));



},{"../ApiClient":10}],159:[function(require,module,exports){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return (b64.length * 3 / 4) - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr((len * 3 / 4) - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0; i < l; i += 4) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = ((uint8[i] << 16) & 0xFF0000) + ((uint8[i + 1] << 8) & 0xFF00) + (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

},{}],160:[function(require,module,exports){

},{}],161:[function(require,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

Object.defineProperty(Buffer.prototype, 'parent', {
  get: function () {
    if (!(this instanceof Buffer)) {
      return undefined
    }
    return this.buffer
  }
})

Object.defineProperty(Buffer.prototype, 'offset', {
  get: function () {
    if (!(this instanceof Buffer)) {
      return undefined
    }
    return this.byteOffset
  }
})

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value) || (value && isArrayBuffer(value.buffer))) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be of type number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('Unknown encoding: ' + encoding)
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('"offset" is outside of buffer bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('"length" is outside of buffer bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (ArrayBuffer.isView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (ArrayBuffer.isView(buf)) {
      buf = Buffer.from(buf)
    }
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || isArrayBuffer(string)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.toLocaleString = Buffer.prototype.toString

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (numberIsNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  var strLen = string.length

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (numberIsNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer')
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('Index out of range')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start

  if (this === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    this.copyWithin(targetStart, start, end)
  } else if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (var i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, end),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if ((encoding === 'utf8' && code < 128) ||
          encoding === 'latin1') {
        // Fast path: If `val` fits into a single byte, use that numeric value.
        val = code
      }
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    if (len === 0) {
      throw new TypeError('The value "' + val +
        '" is invalid for argument "value"')
    }
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node takes equal signs as end of the Base64 encoding
  str = str.split('=')[0]
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

// ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
// but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
function isArrayBuffer (obj) {
  return obj instanceof ArrayBuffer ||
    (obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' &&
      typeof obj.byteLength === 'number')
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
}

},{"base64-js":159,"ieee754":162}],162:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],163:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],164:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],165:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":163,"./encode":164}]},{},[1]);
