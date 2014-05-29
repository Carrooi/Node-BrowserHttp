(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * from https://github.com/philikon/MockHttpRequest
 * thanks
 */



/*
 * Mock XMLHttpRequest (see http://www.w3.org/TR/XMLHttpRequest)
 *
 * Written by Philipp von Weitershausen <philipp@weitershausen.de>
 * Released under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * For test interaction it exposes the following attributes:
 *
 * - method, url, urlParts, async, user, password
 * - requestText
 *
 * as well as the following methods:
 *
 * - getRequestHeader(header)
 * - setResponseHeader(header, value)
 * - receive(status, data)
 * - err(exception)
 * - authenticate(user, password)
 *
 */
function MockHttpRequest () {
	// These are internal flags and data structures
	this.error = false;
	this.sent = false;
	this.requestHeaders = {};
	this.responseHeaders = {};
}
MockHttpRequest.prototype = {

	statusReasons: {
		100: 'Continue',
		101: 'Switching Protocols',
		102: 'Processing',
		200: 'OK',
		201: 'Created',
		202: 'Accepted',
		203: 'Non-Authoritative Information',
		204: 'No Content',
		205: 'Reset Content',
		206: 'Partial Content',
		207: 'Multi-Status',
		300: 'Multiple Choices',
		301: 'Moved Permanently',
		302: 'Moved Temporarily',
		303: 'See Other',
		304: 'Not Modified',
		305: 'Use Proxy',
		307: 'Temporary Redirect',
		400: 'Bad Request',
		401: 'Unauthorized',
		402: 'Payment Required',
		403: 'Forbidden',
		404: 'Not Found',
		405: 'Method Not Allowed',
		406: 'Not Acceptable',
		407: 'Proxy Authentication Required',
		408: 'Request Time-out',
		409: 'Conflict',
		410: 'Gone',
		411: 'Length Required',
		412: 'Precondition Failed',
		413: 'Request Entity Too Large',
		414: 'Request-URI Too Large',
		415: 'Unsupported Media Type',
		416: 'Requested range not satisfiable',
		417: 'Expectation Failed',
		422: 'Unprocessable Entity',
		423: 'Locked',
		424: 'Failed Dependency',
		500: 'Internal Server Error',
		501: 'Not Implemented',
		502: 'Bad Gateway',
		503: 'Service Unavailable',
		504: 'Gateway Time-out',
		505: 'HTTP Version not supported',
		507: 'Insufficient Storage'
	},

	/*** State ***/

	UNSENT: 0,
	OPENED: 1,
	HEADERS_RECEIVED: 2,
	LOADING: 3,
	DONE: 4,
	readyState: 0,


	/*** Request ***/

	open: function (method, url, async, user, password) {
		if (typeof method !== "string") {
			throw "INVALID_METHOD";
		}
		switch (method.toUpperCase()) {
			case "CONNECT":
			case "TRACE":
			case "TRACK":
				throw "SECURITY_ERR";

			case "DELETE":
			case "GET":
			case "HEAD":
			case "OPTIONS":
			case "POST":
			case "PUT":
				method = method.toUpperCase();
		}
		this.method = method;

		if (typeof url !== "string") {
			throw "INVALID_URL";
		}
		this.url = url;
		this.urlParts = this.parseUri(url);

		if (async === undefined) {
			async = true;
		}
		this.async = async;
		this.user = user;
		this.password = password;

		this.readyState = this.OPENED;
		this.onreadystatechange();
	},

	setRequestHeader: function (header, value) {
		header = header.toLowerCase();

		switch (header) {
			case "accept-charset":
			case "accept-encoding":
			case "connection":
			case "content-length":
			case "cookie":
			case "cookie2":
			case "content-transfer-encoding":
			case "date":
			case "expect":
			case "host":
			case "keep-alive":
			case "referer":
			case "te":
			case "trailer":
			case "transfer-encoding":
			case "upgrade":
			case "user-agent":
			case "via":
				return;
		}
		if ((header.substr(0, 6) === "proxy-")
			|| (header.substr(0, 4) === "sec-")) {
			return;
		}

		// it's the first call on this header field
		if (this.requestHeaders[header] === undefined)
			this.requestHeaders[header] = value;
		else {
			var prev = this.requestHeaders[header];
			this.requestHeaders[header] = prev + ", " + value;
		}

	},

	send: function (data) {
		if ((this.readyState !== this.OPENED)
			|| this.sent) {
			throw "INVALID_STATE_ERR";
		}
		if ((this.method === "GET") || (this.method === "HEAD")) {
			data = null;
		}

		//TODO set Content-Type header?
		this.error = false;
		this.sent = true;
		this.onreadystatechange();

		// fake send
		this.requestText = data;
		this.onsend();
	},

	abort: function () {
		this.responseText = null;
		this.error = true;
		for (var header in this.requestHeaders) {
			delete this.requestHeaders[header];
		}
		delete this.requestText;
		this.onreadystatechange();
		this.onabort();
		this.readyState = this.UNSENT;
	},


	/*** Response ***/

	status: 0,
	statusText: "",

	getResponseHeader: function (header) {
		if ((this.readyState === this.UNSENT)
			|| (this.readyState === this.OPENED)
			|| this.error) {
			return null;
		}
		return this.responseHeaders[header.toLowerCase()];
	},

	getAllResponseHeaders: function () {
		var r = "";
		for (var header in this.responseHeaders) {
			if ((header === "set-cookie") || (header === "set-cookie2")) {
				continue;
			}
			//TODO title case header
			r += header + ": " + this.responseHeaders[header] + "\r\n";
		}
		return r;
	},

	responseText: "",
	responseXML: undefined, //TODO


	/*** See http://www.w3.org/TR/progress-events/ ***/

	onload: function () {
		// Instances should override this.
	},

	onprogress: function () {
		// Instances should override this.
	},

	onerror: function () {
		// Instances should override this.
	},

	onabort: function () {
		// Instances should override this.
	},

	onreadystatechange: function () {
		// Instances should override this.
	},


	/*** Properties and methods for test interaction ***/

	onsend: function () {
		// Instances should override this.
	},

	getRequestHeader: function (header) {
		return this.requestHeaders[header.toLowerCase()];
	},

	setResponseHeader: function (header, value) {
		this.responseHeaders[header.toLowerCase()] = value;
	},

	makeXMLResponse: function (data) {
		var xmlDoc;
		// according to specs from point 3.7.5:
		// "1. If the response entity body is null terminate these steps
		//     and return null.
		//  2. If final MIME type is not null, text/xml, application/xml,
		//     and does not end in +xml terminate these steps and return null.
		var mimetype = this.getResponseHeader("Content-Type");
		mimetype = mimetype && mimetype.split(';', 1)[0];
		if ((mimetype == null) || (mimetype == 'text/xml') ||
			(mimetype == 'application/xml') ||
			(mimetype && mimetype.substring(mimetype.length - 4) == '+xml')) {
			// Attempt to produce an xml response
			// and it will fail if not a good xml
			try {
				if (window.DOMParser) {
					var parser = new DOMParser();
					xmlDoc = parser.parseFromString(data, "text/xml");
				} else { // Internet Explorer
					xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
					xmlDoc.async = "false";
					xmlDoc.loadXML(data);
				}
			} catch (e) {
				// according to specs from point 3.7.5:
				// "3. Let document be a cookie-free Document object that
				// represents the result of parsing the response entity body
				// into a document tree following the rules from the XML
				//  specifications. If this fails (unsupported character
				// encoding, namespace well-formedness error etc.), terminate
				// these steps return null."
				xmlDoc = null;
			}
			// parse errors also yield a null.
			if ((xmlDoc && xmlDoc.parseError && xmlDoc.parseError.errorCode != 0)
				|| (xmlDoc && xmlDoc.documentElement && xmlDoc.documentElement.nodeName == "parsererror")
				|| (xmlDoc && xmlDoc.documentElement && xmlDoc.documentElement.nodeName == "html"
				&&  xmlDoc.documentElement.firstChild &&  xmlDoc.documentElement.firstChild.nodeName == "body"
				&&  xmlDoc.documentElement.firstChild.firstChild && xmlDoc.documentElement.firstChild.firstChild.nodeName == "parsererror")) {
				xmlDoc = null;
			}
		} else {
			// mimetype is specified, but not xml-ish
			xmlDoc = null;
		}
		return xmlDoc;
	},

	// Call this to simulate a server response
	receive: function (status, data, timeout) {
		if ((this.readyState !== this.OPENED) || (!this.sent)) {
			// Can't respond to unopened request.
			throw "INVALID_STATE_ERR";
		}

		this.status = status;
		this.statusText = status + " " + this.statusReasons[status];
		this.readyState = this.HEADERS_RECEIVED;
		this.onprogress();
		this.onreadystatechange();

		this.responseText = data;
		this.responseXML = this.makeXMLResponse(data);

		this.readyState = this.LOADING;
		this.onprogress();
		this.onreadystatechange();

		var _this = this;
		var done = function() {
			_this.readyState = _this.DONE;
			_this.onreadystatechange();
			_this.onprogress();
			_this.onload();
		};

		if (timeout === null) {
			done();
		} else if (typeof timeout === 'number' || (typeof timeout === 'object' && typeof timeout.min === 'number' && typeof timeout.max === 'number')) {
			if (typeof timeout === 'object') {
				timeout = Math.floor(Math.random() * (timeout.max - timeout.min + 1)) + timeout.min;
			}

			setTimeout(function() {
				done();
			}, timeout);
		} else {
			throw new Error('Invalid type of timeout.');
		}
	},

	// Call this to simulate a request error (e.g. NETWORK_ERR)
	err: function (exception) {
		if ((this.readyState !== this.OPENED) || (!this.sent)) {
			// Can't respond to unopened request.
			throw "INVALID_STATE_ERR";
		}

		this.responseText = null;
		this.error = true;
		for (var header in this.requestHeaders) {
			delete this.requestHeaders[header];
		}
		this.readyState = this.DONE;
		if (!this.async) {
			throw exception;
		}
		this.onreadystatechange();
		this.onerror();
	},

	// Convenience method to verify HTTP credentials
	authenticate: function (user, password) {
		if (this.user) {
			return (user === this.user) && (password === this.password);
		}

		if (this.urlParts.user) {
			return ((user === this.urlParts.user)
				&& (password === this.urlParts.password));
		}

		// Basic auth.  Requires existence of the 'atob' function.
		var auth = this.getRequestHeader("Authorization");
		if (auth === undefined) {
			return false;
		}
		if (auth.substr(0, 6) !== "Basic ") {
			return false;
		}
		if (typeof atob !== "function") {
			return false;
		}
		auth = atob(auth.substr(6));
		var pieces = auth.split(':');
		var requser = pieces.shift();
		var reqpass = pieces.join(':');
		return (user === requser) && (password === reqpass);
	},

	// Parse RFC 3986 compliant URIs.
	// Based on parseUri by Steven Levithan <stevenlevithan.com>
	// See http://blog.stevenlevithan.com/archives/parseuri
	parseUri: function (str) {
		var pattern = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/;
		var key = ["source", "protocol", "authority", "userInfo", "user",
			"password", "host", "port", "relative", "path",
			"directory", "file", "query", "anchor"];
		var querypattern = /(?:^|&)([^&=]*)=?([^&]*)/g;

		var match = pattern.exec(str);
		var uri = {};
		var i = 14;
		while (i--) {
			uri[key[i]] = match[i] || "";
		}

		uri.queryKey = {};
		uri[key[12]].replace(querypattern, function ($0, $1, $2) {
			if ($1) {
				uri.queryKey[$1] = $2;
			}
		});

		return uri;
	}
};


/*
 * A small mock "server" that intercepts XMLHttpRequest calls and
 * diverts them to your handler.
 *
 * Usage:
 *
 * 1. Initialize with either
 *       var server = new MockHttpServer(your_request_handler);
 *    or
 *       var server = new MockHttpServer();
 *       server.handle = function (request) { ... };
 *
 * 2. Call server.start() to start intercepting all XMLHttpRequests.
 *
 * 3. Do your tests.
 *
 * 4. Call server.stop() to tear down.
 *
 * 5. Profit!
 */
function MockHttpServer (handler) {
	if (handler) {
		this.handle = handler;
	}
};
MockHttpServer.prototype = {

	start: function () {
		var self = this;

		function Request () {
			this.onsend = function () {
				self.handle(this);
			};
			MockHttpRequest.apply(this, arguments);
		}
		Request.prototype = MockHttpRequest.prototype;

		window.OriginalHttpRequest = window.XMLHttpRequest;
		window.XMLHttpRequest = Request;
	},

	stop: function () {
		window.XMLHttpRequest = window.OriginalHttpRequest;
	},

	handle: function (request) {
		// Instances should override this.
	}
};

module.exports = MockHttpRequest;
},{}],2:[function(require,module,exports){

/**
 * Escape regexp special characters in `str`.
 *
 * @param {String} str
 * @return {String}
 * @api public
 */

module.exports = function(str){
  return String(str).replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
};
},{}],3:[function(require,module,exports){
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

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],5:[function(require,module,exports){
(function (process){
// vim:ts=4:sts=4:sw=4:
/*!
 *
 * Copyright 2009-2012 Kris Kowal under the terms of the MIT
 * license found at http://github.com/kriskowal/q/raw/master/LICENSE
 *
 * With parts by Tyler Close
 * Copyright 2007-2009 Tyler Close under the terms of the MIT X license found
 * at http://www.opensource.org/licenses/mit-license.html
 * Forked at ref_send.js version: 2009-05-11
 *
 * With parts by Mark Miller
 * Copyright (C) 2011 Google Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

(function (definition) {
    // Turn off strict mode for this function so we can assign to global.Q
    /* jshint strict: false */

    // This file will function properly as a <script> tag, or a module
    // using CommonJS and NodeJS or RequireJS module formats.  In
    // Common/Node/RequireJS, the module exports the Q API and when
    // executed as a simple <script>, it creates a Q global instead.

    // Montage Require
    if (typeof bootstrap === "function") {
        bootstrap("promise", definition);

    // CommonJS
    } else if (typeof exports === "object") {
        module.exports = definition();

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
        define(definition);

    // SES (Secure EcmaScript)
    } else if (typeof ses !== "undefined") {
        if (!ses.ok()) {
            return;
        } else {
            ses.makeQ = definition;
        }

    // <script>
    } else {
        Q = definition();
    }

})(function () {
"use strict";

var hasStacks = false;
try {
    throw new Error();
} catch (e) {
    hasStacks = !!e.stack;
}

// All code after this point will be filtered from stack traces reported
// by Q.
var qStartingLine = captureLine();
var qFileName;

// shims

// used for fallback in "allResolved"
var noop = function () {};

// Use the fastest possible means to execute a task in a future turn
// of the event loop.
var nextTick =(function () {
    // linked list of tasks (single, with head node)
    var head = {task: void 0, next: null};
    var tail = head;
    var flushing = false;
    var requestTick = void 0;
    var isNodeJS = false;

    function flush() {
        /* jshint loopfunc: true */

        while (head.next) {
            head = head.next;
            var task = head.task;
            head.task = void 0;
            var domain = head.domain;

            if (domain) {
                head.domain = void 0;
                domain.enter();
            }

            try {
                task();

            } catch (e) {
                if (isNodeJS) {
                    // In node, uncaught exceptions are considered fatal errors.
                    // Re-throw them synchronously to interrupt flushing!

                    // Ensure continuation if the uncaught exception is suppressed
                    // listening "uncaughtException" events (as domains does).
                    // Continue in next event to avoid tick recursion.
                    if (domain) {
                        domain.exit();
                    }
                    setTimeout(flush, 0);
                    if (domain) {
                        domain.enter();
                    }

                    throw e;

                } else {
                    // In browsers, uncaught exceptions are not fatal.
                    // Re-throw them asynchronously to avoid slow-downs.
                    setTimeout(function() {
                       throw e;
                    }, 0);
                }
            }

            if (domain) {
                domain.exit();
            }
        }

        flushing = false;
    }

    nextTick = function (task) {
        tail = tail.next = {
            task: task,
            domain: isNodeJS && process.domain,
            next: null
        };

        if (!flushing) {
            flushing = true;
            requestTick();
        }
    };

    if (typeof process !== "undefined" && process.nextTick) {
        // Node.js before 0.9. Note that some fake-Node environments, like the
        // Mocha test runner, introduce a `process` global without a `nextTick`.
        isNodeJS = true;

        requestTick = function () {
            process.nextTick(flush);
        };

    } else if (typeof setImmediate === "function") {
        // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
        if (typeof window !== "undefined") {
            requestTick = setImmediate.bind(window, flush);
        } else {
            requestTick = function () {
                setImmediate(flush);
            };
        }

    } else if (typeof MessageChannel !== "undefined") {
        // modern browsers
        // http://www.nonblocking.io/2011/06/windownexttick.html
        var channel = new MessageChannel();
        // At least Safari Version 6.0.5 (8536.30.1) intermittently cannot create
        // working message ports the first time a page loads.
        channel.port1.onmessage = function () {
            requestTick = requestPortTick;
            channel.port1.onmessage = flush;
            flush();
        };
        var requestPortTick = function () {
            // Opera requires us to provide a message payload, regardless of
            // whether we use it.
            channel.port2.postMessage(0);
        };
        requestTick = function () {
            setTimeout(flush, 0);
            requestPortTick();
        };

    } else {
        // old browsers
        requestTick = function () {
            setTimeout(flush, 0);
        };
    }

    return nextTick;
})();

// Attempt to make generics safe in the face of downstream
// modifications.
// There is no situation where this is necessary.
// If you need a security guarantee, these primordials need to be
// deeply frozen anyway, and if you don’t need a security guarantee,
// this is just plain paranoid.
// However, this **might** have the nice side-effect of reducing the size of
// the minified code by reducing x.call() to merely x()
// See Mark Miller’s explanation of what this does.
// http://wiki.ecmascript.org/doku.php?id=conventions:safe_meta_programming
var call = Function.call;
function uncurryThis(f) {
    return function () {
        return call.apply(f, arguments);
    };
}
// This is equivalent, but slower:
// uncurryThis = Function_bind.bind(Function_bind.call);
// http://jsperf.com/uncurrythis

var array_slice = uncurryThis(Array.prototype.slice);

var array_reduce = uncurryThis(
    Array.prototype.reduce || function (callback, basis) {
        var index = 0,
            length = this.length;
        // concerning the initial value, if one is not provided
        if (arguments.length === 1) {
            // seek to the first value in the array, accounting
            // for the possibility that is is a sparse array
            do {
                if (index in this) {
                    basis = this[index++];
                    break;
                }
                if (++index >= length) {
                    throw new TypeError();
                }
            } while (1);
        }
        // reduce
        for (; index < length; index++) {
            // account for the possibility that the array is sparse
            if (index in this) {
                basis = callback(basis, this[index], index);
            }
        }
        return basis;
    }
);

var array_indexOf = uncurryThis(
    Array.prototype.indexOf || function (value) {
        // not a very good shim, but good enough for our one use of it
        for (var i = 0; i < this.length; i++) {
            if (this[i] === value) {
                return i;
            }
        }
        return -1;
    }
);

var array_map = uncurryThis(
    Array.prototype.map || function (callback, thisp) {
        var self = this;
        var collect = [];
        array_reduce(self, function (undefined, value, index) {
            collect.push(callback.call(thisp, value, index, self));
        }, void 0);
        return collect;
    }
);

var object_create = Object.create || function (prototype) {
    function Type() { }
    Type.prototype = prototype;
    return new Type();
};

var object_hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);

var object_keys = Object.keys || function (object) {
    var keys = [];
    for (var key in object) {
        if (object_hasOwnProperty(object, key)) {
            keys.push(key);
        }
    }
    return keys;
};

var object_toString = uncurryThis(Object.prototype.toString);

function isObject(value) {
    return value === Object(value);
}

// generator related shims

// FIXME: Remove this function once ES6 generators are in SpiderMonkey.
function isStopIteration(exception) {
    return (
        object_toString(exception) === "[object StopIteration]" ||
        exception instanceof QReturnValue
    );
}

// FIXME: Remove this helper and Q.return once ES6 generators are in
// SpiderMonkey.
var QReturnValue;
if (typeof ReturnValue !== "undefined") {
    QReturnValue = ReturnValue;
} else {
    QReturnValue = function (value) {
        this.value = value;
    };
}

// long stack traces

var STACK_JUMP_SEPARATOR = "From previous event:";

function makeStackTraceLong(error, promise) {
    // If possible, transform the error stack trace by removing Node and Q
    // cruft, then concatenating with the stack trace of `promise`. See #57.
    if (hasStacks &&
        promise.stack &&
        typeof error === "object" &&
        error !== null &&
        error.stack &&
        error.stack.indexOf(STACK_JUMP_SEPARATOR) === -1
    ) {
        var stacks = [];
        for (var p = promise; !!p; p = p.source) {
            if (p.stack) {
                stacks.unshift(p.stack);
            }
        }
        stacks.unshift(error.stack);

        var concatedStacks = stacks.join("\n" + STACK_JUMP_SEPARATOR + "\n");
        error.stack = filterStackString(concatedStacks);
    }
}

function filterStackString(stackString) {
    var lines = stackString.split("\n");
    var desiredLines = [];
    for (var i = 0; i < lines.length; ++i) {
        var line = lines[i];

        if (!isInternalFrame(line) && !isNodeFrame(line) && line) {
            desiredLines.push(line);
        }
    }
    return desiredLines.join("\n");
}

function isNodeFrame(stackLine) {
    return stackLine.indexOf("(module.js:") !== -1 ||
           stackLine.indexOf("(node.js:") !== -1;
}

function getFileNameAndLineNumber(stackLine) {
    // Named functions: "at functionName (filename:lineNumber:columnNumber)"
    // In IE10 function name can have spaces ("Anonymous function") O_o
    var attempt1 = /at .+ \((.+):(\d+):(?:\d+)\)$/.exec(stackLine);
    if (attempt1) {
        return [attempt1[1], Number(attempt1[2])];
    }

    // Anonymous functions: "at filename:lineNumber:columnNumber"
    var attempt2 = /at ([^ ]+):(\d+):(?:\d+)$/.exec(stackLine);
    if (attempt2) {
        return [attempt2[1], Number(attempt2[2])];
    }

    // Firefox style: "function@filename:lineNumber or @filename:lineNumber"
    var attempt3 = /.*@(.+):(\d+)$/.exec(stackLine);
    if (attempt3) {
        return [attempt3[1], Number(attempt3[2])];
    }
}

function isInternalFrame(stackLine) {
    var fileNameAndLineNumber = getFileNameAndLineNumber(stackLine);

    if (!fileNameAndLineNumber) {
        return false;
    }

    var fileName = fileNameAndLineNumber[0];
    var lineNumber = fileNameAndLineNumber[1];

    return fileName === qFileName &&
        lineNumber >= qStartingLine &&
        lineNumber <= qEndingLine;
}

// discover own file name and line number range for filtering stack
// traces
function captureLine() {
    if (!hasStacks) {
        return;
    }

    try {
        throw new Error();
    } catch (e) {
        var lines = e.stack.split("\n");
        var firstLine = lines[0].indexOf("@") > 0 ? lines[1] : lines[2];
        var fileNameAndLineNumber = getFileNameAndLineNumber(firstLine);
        if (!fileNameAndLineNumber) {
            return;
        }

        qFileName = fileNameAndLineNumber[0];
        return fileNameAndLineNumber[1];
    }
}

function deprecate(callback, name, alternative) {
    return function () {
        if (typeof console !== "undefined" &&
            typeof console.warn === "function") {
            console.warn(name + " is deprecated, use " + alternative +
                         " instead.", new Error("").stack);
        }
        return callback.apply(callback, arguments);
    };
}

// end of shims
// beginning of real work

/**
 * Constructs a promise for an immediate reference, passes promises through, or
 * coerces promises from different systems.
 * @param value immediate reference or promise
 */
function Q(value) {
    // If the object is already a Promise, return it directly.  This enables
    // the resolve function to both be used to created references from objects,
    // but to tolerably coerce non-promises to promises.
    if (isPromise(value)) {
        return value;
    }

    // assimilate thenables
    if (isPromiseAlike(value)) {
        return coerce(value);
    } else {
        return fulfill(value);
    }
}
Q.resolve = Q;

/**
 * Performs a task in a future turn of the event loop.
 * @param {Function} task
 */
Q.nextTick = nextTick;

/**
 * Controls whether or not long stack traces will be on
 */
Q.longStackSupport = false;

/**
 * Constructs a {promise, resolve, reject} object.
 *
 * `resolve` is a callback to invoke with a more resolved value for the
 * promise. To fulfill the promise, invoke `resolve` with any value that is
 * not a thenable. To reject the promise, invoke `resolve` with a rejected
 * thenable, or invoke `reject` with the reason directly. To resolve the
 * promise to another thenable, thus putting it in the same state, invoke
 * `resolve` with that other thenable.
 */
Q.defer = defer;
function defer() {
    // if "messages" is an "Array", that indicates that the promise has not yet
    // been resolved.  If it is "undefined", it has been resolved.  Each
    // element of the messages array is itself an array of complete arguments to
    // forward to the resolved promise.  We coerce the resolution value to a
    // promise using the `resolve` function because it handles both fully
    // non-thenable values and other thenables gracefully.
    var messages = [], progressListeners = [], resolvedPromise;

    var deferred = object_create(defer.prototype);
    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, operands) {
        var args = array_slice(arguments);
        if (messages) {
            messages.push(args);
            if (op === "when" && operands[1]) { // progress operand
                progressListeners.push(operands[1]);
            }
        } else {
            nextTick(function () {
                resolvedPromise.promiseDispatch.apply(resolvedPromise, args);
            });
        }
    };

    // XXX deprecated
    promise.valueOf = function () {
        if (messages) {
            return promise;
        }
        var nearerValue = nearer(resolvedPromise);
        if (isPromise(nearerValue)) {
            resolvedPromise = nearerValue; // shorten chain
        }
        return nearerValue;
    };

    promise.inspect = function () {
        if (!resolvedPromise) {
            return { state: "pending" };
        }
        return resolvedPromise.inspect();
    };

    if (Q.longStackSupport && hasStacks) {
        try {
            throw new Error();
        } catch (e) {
            // NOTE: don't try to use `Error.captureStackTrace` or transfer the
            // accessor around; that causes memory leaks as per GH-111. Just
            // reify the stack trace as a string ASAP.
            //
            // At the same time, cut off the first line; it's always just
            // "[object Promise]\n", as per the `toString`.
            promise.stack = e.stack.substring(e.stack.indexOf("\n") + 1);
        }
    }

    // NOTE: we do the checks for `resolvedPromise` in each method, instead of
    // consolidating them into `become`, since otherwise we'd create new
    // promises with the lines `become(whatever(value))`. See e.g. GH-252.

    function become(newPromise) {
        resolvedPromise = newPromise;
        promise.source = newPromise;

        array_reduce(messages, function (undefined, message) {
            nextTick(function () {
                newPromise.promiseDispatch.apply(newPromise, message);
            });
        }, void 0);

        messages = void 0;
        progressListeners = void 0;
    }

    deferred.promise = promise;
    deferred.resolve = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(Q(value));
    };

    deferred.fulfill = function (value) {
        if (resolvedPromise) {
            return;
        }

        become(fulfill(value));
    };
    deferred.reject = function (reason) {
        if (resolvedPromise) {
            return;
        }

        become(reject(reason));
    };
    deferred.notify = function (progress) {
        if (resolvedPromise) {
            return;
        }

        array_reduce(progressListeners, function (undefined, progressListener) {
            nextTick(function () {
                progressListener(progress);
            });
        }, void 0);
    };

    return deferred;
}

/**
 * Creates a Node-style callback that will resolve or reject the deferred
 * promise.
 * @returns a nodeback
 */
defer.prototype.makeNodeResolver = function () {
    var self = this;
    return function (error, value) {
        if (error) {
            self.reject(error);
        } else if (arguments.length > 2) {
            self.resolve(array_slice(arguments, 1));
        } else {
            self.resolve(value);
        }
    };
};

/**
 * @param resolver {Function} a function that returns nothing and accepts
 * the resolve, reject, and notify functions for a deferred.
 * @returns a promise that may be resolved with the given resolve and reject
 * functions, or rejected by a thrown exception in resolver
 */
Q.Promise = promise; // ES6
Q.promise = promise;
function promise(resolver) {
    if (typeof resolver !== "function") {
        throw new TypeError("resolver must be a function.");
    }
    var deferred = defer();
    try {
        resolver(deferred.resolve, deferred.reject, deferred.notify);
    } catch (reason) {
        deferred.reject(reason);
    }
    return deferred.promise;
}

promise.race = race; // ES6
promise.all = all; // ES6
promise.reject = reject; // ES6
promise.resolve = Q; // ES6

// XXX experimental.  This method is a way to denote that a local value is
// serializable and should be immediately dispatched to a remote upon request,
// instead of passing a reference.
Q.passByCopy = function (object) {
    //freeze(object);
    //passByCopies.set(object, true);
    return object;
};

Promise.prototype.passByCopy = function () {
    //freeze(object);
    //passByCopies.set(object, true);
    return this;
};

/**
 * If two promises eventually fulfill to the same value, promises that value,
 * but otherwise rejects.
 * @param x {Any*}
 * @param y {Any*}
 * @returns {Any*} a promise for x and y if they are the same, but a rejection
 * otherwise.
 *
 */
Q.join = function (x, y) {
    return Q(x).join(y);
};

Promise.prototype.join = function (that) {
    return Q([this, that]).spread(function (x, y) {
        if (x === y) {
            // TODO: "===" should be Object.is or equiv
            return x;
        } else {
            throw new Error("Can't join: not the same: " + x + " " + y);
        }
    });
};

/**
 * Returns a promise for the first of an array of promises to become fulfilled.
 * @param answers {Array[Any*]} promises to race
 * @returns {Any*} the first promise to be fulfilled
 */
Q.race = race;
function race(answerPs) {
    return promise(function(resolve, reject) {
        // Switch to this once we can assume at least ES5
        // answerPs.forEach(function(answerP) {
        //     Q(answerP).then(resolve, reject);
        // });
        // Use this in the meantime
        for (var i = 0, len = answerPs.length; i < len; i++) {
            Q(answerPs[i]).then(resolve, reject);
        }
    });
}

Promise.prototype.race = function () {
    return this.then(Q.race);
};

/**
 * Constructs a Promise with a promise descriptor object and optional fallback
 * function.  The descriptor contains methods like when(rejected), get(name),
 * set(name, value), post(name, args), and delete(name), which all
 * return either a value, a promise for a value, or a rejection.  The fallback
 * accepts the operation name, a resolver, and any further arguments that would
 * have been forwarded to the appropriate method above had a method been
 * provided with the proper name.  The API makes no guarantees about the nature
 * of the returned object, apart from that it is usable whereever promises are
 * bought and sold.
 */
Q.makePromise = Promise;
function Promise(descriptor, fallback, inspect) {
    if (fallback === void 0) {
        fallback = function (op) {
            return reject(new Error(
                "Promise does not support operation: " + op
            ));
        };
    }
    if (inspect === void 0) {
        inspect = function () {
            return {state: "unknown"};
        };
    }

    var promise = object_create(Promise.prototype);

    promise.promiseDispatch = function (resolve, op, args) {
        var result;
        try {
            if (descriptor[op]) {
                result = descriptor[op].apply(promise, args);
            } else {
                result = fallback.call(promise, op, args);
            }
        } catch (exception) {
            result = reject(exception);
        }
        if (resolve) {
            resolve(result);
        }
    };

    promise.inspect = inspect;

    // XXX deprecated `valueOf` and `exception` support
    if (inspect) {
        var inspected = inspect();
        if (inspected.state === "rejected") {
            promise.exception = inspected.reason;
        }

        promise.valueOf = function () {
            var inspected = inspect();
            if (inspected.state === "pending" ||
                inspected.state === "rejected") {
                return promise;
            }
            return inspected.value;
        };
    }

    return promise;
}

Promise.prototype.toString = function () {
    return "[object Promise]";
};

Promise.prototype.then = function (fulfilled, rejected, progressed) {
    var self = this;
    var deferred = defer();
    var done = false;   // ensure the untrusted promise makes at most a
                        // single call to one of the callbacks

    function _fulfilled(value) {
        try {
            return typeof fulfilled === "function" ? fulfilled(value) : value;
        } catch (exception) {
            return reject(exception);
        }
    }

    function _rejected(exception) {
        if (typeof rejected === "function") {
            makeStackTraceLong(exception, self);
            try {
                return rejected(exception);
            } catch (newException) {
                return reject(newException);
            }
        }
        return reject(exception);
    }

    function _progressed(value) {
        return typeof progressed === "function" ? progressed(value) : value;
    }

    nextTick(function () {
        self.promiseDispatch(function (value) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_fulfilled(value));
        }, "when", [function (exception) {
            if (done) {
                return;
            }
            done = true;

            deferred.resolve(_rejected(exception));
        }]);
    });

    // Progress propagator need to be attached in the current tick.
    self.promiseDispatch(void 0, "when", [void 0, function (value) {
        var newValue;
        var threw = false;
        try {
            newValue = _progressed(value);
        } catch (e) {
            threw = true;
            if (Q.onerror) {
                Q.onerror(e);
            } else {
                throw e;
            }
        }

        if (!threw) {
            deferred.notify(newValue);
        }
    }]);

    return deferred.promise;
};

/**
 * Registers an observer on a promise.
 *
 * Guarantees:
 *
 * 1. that fulfilled and rejected will be called only once.
 * 2. that either the fulfilled callback or the rejected callback will be
 *    called, but not both.
 * 3. that fulfilled and rejected will not be called in this turn.
 *
 * @param value      promise or immediate reference to observe
 * @param fulfilled  function to be called with the fulfilled value
 * @param rejected   function to be called with the rejection exception
 * @param progressed function to be called on any progress notifications
 * @return promise for the return value from the invoked callback
 */
Q.when = when;
function when(value, fulfilled, rejected, progressed) {
    return Q(value).then(fulfilled, rejected, progressed);
}

Promise.prototype.thenResolve = function (value) {
    return this.then(function () { return value; });
};

Q.thenResolve = function (promise, value) {
    return Q(promise).thenResolve(value);
};

Promise.prototype.thenReject = function (reason) {
    return this.then(function () { throw reason; });
};

Q.thenReject = function (promise, reason) {
    return Q(promise).thenReject(reason);
};

/**
 * If an object is not a promise, it is as "near" as possible.
 * If a promise is rejected, it is as "near" as possible too.
 * If it’s a fulfilled promise, the fulfillment value is nearer.
 * If it’s a deferred promise and the deferred has been resolved, the
 * resolution is "nearer".
 * @param object
 * @returns most resolved (nearest) form of the object
 */

// XXX should we re-do this?
Q.nearer = nearer;
function nearer(value) {
    if (isPromise(value)) {
        var inspected = value.inspect();
        if (inspected.state === "fulfilled") {
            return inspected.value;
        }
    }
    return value;
}

/**
 * @returns whether the given object is a promise.
 * Otherwise it is a fulfilled value.
 */
Q.isPromise = isPromise;
function isPromise(object) {
    return isObject(object) &&
        typeof object.promiseDispatch === "function" &&
        typeof object.inspect === "function";
}

Q.isPromiseAlike = isPromiseAlike;
function isPromiseAlike(object) {
    return isObject(object) && typeof object.then === "function";
}

/**
 * @returns whether the given object is a pending promise, meaning not
 * fulfilled or rejected.
 */
Q.isPending = isPending;
function isPending(object) {
    return isPromise(object) && object.inspect().state === "pending";
}

Promise.prototype.isPending = function () {
    return this.inspect().state === "pending";
};

/**
 * @returns whether the given object is a value or fulfilled
 * promise.
 */
Q.isFulfilled = isFulfilled;
function isFulfilled(object) {
    return !isPromise(object) || object.inspect().state === "fulfilled";
}

Promise.prototype.isFulfilled = function () {
    return this.inspect().state === "fulfilled";
};

/**
 * @returns whether the given object is a rejected promise.
 */
Q.isRejected = isRejected;
function isRejected(object) {
    return isPromise(object) && object.inspect().state === "rejected";
}

Promise.prototype.isRejected = function () {
    return this.inspect().state === "rejected";
};

//// BEGIN UNHANDLED REJECTION TRACKING

// This promise library consumes exceptions thrown in handlers so they can be
// handled by a subsequent promise.  The exceptions get added to this array when
// they are created, and removed when they are handled.  Note that in ES6 or
// shimmed environments, this would naturally be a `Set`.
var unhandledReasons = [];
var unhandledRejections = [];
var trackUnhandledRejections = true;

function resetUnhandledRejections() {
    unhandledReasons.length = 0;
    unhandledRejections.length = 0;

    if (!trackUnhandledRejections) {
        trackUnhandledRejections = true;
    }
}

function trackRejection(promise, reason) {
    if (!trackUnhandledRejections) {
        return;
    }

    unhandledRejections.push(promise);
    if (reason && typeof reason.stack !== "undefined") {
        unhandledReasons.push(reason.stack);
    } else {
        unhandledReasons.push("(no stack) " + reason);
    }
}

function untrackRejection(promise) {
    if (!trackUnhandledRejections) {
        return;
    }

    var at = array_indexOf(unhandledRejections, promise);
    if (at !== -1) {
        unhandledRejections.splice(at, 1);
        unhandledReasons.splice(at, 1);
    }
}

Q.resetUnhandledRejections = resetUnhandledRejections;

Q.getUnhandledReasons = function () {
    // Make a copy so that consumers can't interfere with our internal state.
    return unhandledReasons.slice();
};

Q.stopUnhandledRejectionTracking = function () {
    resetUnhandledRejections();
    trackUnhandledRejections = false;
};

resetUnhandledRejections();

//// END UNHANDLED REJECTION TRACKING

/**
 * Constructs a rejected promise.
 * @param reason value describing the failure
 */
Q.reject = reject;
function reject(reason) {
    var rejection = Promise({
        "when": function (rejected) {
            // note that the error has been handled
            if (rejected) {
                untrackRejection(this);
            }
            return rejected ? rejected(reason) : this;
        }
    }, function fallback() {
        return this;
    }, function inspect() {
        return { state: "rejected", reason: reason };
    });

    // Note that the reason has not been handled.
    trackRejection(rejection, reason);

    return rejection;
}

/**
 * Constructs a fulfilled promise for an immediate reference.
 * @param value immediate reference
 */
Q.fulfill = fulfill;
function fulfill(value) {
    return Promise({
        "when": function () {
            return value;
        },
        "get": function (name) {
            return value[name];
        },
        "set": function (name, rhs) {
            value[name] = rhs;
        },
        "delete": function (name) {
            delete value[name];
        },
        "post": function (name, args) {
            // Mark Miller proposes that post with no name should apply a
            // promised function.
            if (name === null || name === void 0) {
                return value.apply(void 0, args);
            } else {
                return value[name].apply(value, args);
            }
        },
        "apply": function (thisp, args) {
            return value.apply(thisp, args);
        },
        "keys": function () {
            return object_keys(value);
        }
    }, void 0, function inspect() {
        return { state: "fulfilled", value: value };
    });
}

/**
 * Converts thenables to Q promises.
 * @param promise thenable promise
 * @returns a Q promise
 */
function coerce(promise) {
    var deferred = defer();
    nextTick(function () {
        try {
            promise.then(deferred.resolve, deferred.reject, deferred.notify);
        } catch (exception) {
            deferred.reject(exception);
        }
    });
    return deferred.promise;
}

/**
 * Annotates an object such that it will never be
 * transferred away from this process over any promise
 * communication channel.
 * @param object
 * @returns promise a wrapping of that object that
 * additionally responds to the "isDef" message
 * without a rejection.
 */
Q.master = master;
function master(object) {
    return Promise({
        "isDef": function () {}
    }, function fallback(op, args) {
        return dispatch(object, op, args);
    }, function () {
        return Q(object).inspect();
    });
}

/**
 * Spreads the values of a promised array of arguments into the
 * fulfillment callback.
 * @param fulfilled callback that receives variadic arguments from the
 * promised array
 * @param rejected callback that receives the exception if the promise
 * is rejected.
 * @returns a promise for the return value or thrown exception of
 * either callback.
 */
Q.spread = spread;
function spread(value, fulfilled, rejected) {
    return Q(value).spread(fulfilled, rejected);
}

Promise.prototype.spread = function (fulfilled, rejected) {
    return this.all().then(function (array) {
        return fulfilled.apply(void 0, array);
    }, rejected);
};

/**
 * The async function is a decorator for generator functions, turning
 * them into asynchronous generators.  Although generators are only part
 * of the newest ECMAScript 6 drafts, this code does not cause syntax
 * errors in older engines.  This code should continue to work and will
 * in fact improve over time as the language improves.
 *
 * ES6 generators are currently part of V8 version 3.19 with the
 * --harmony-generators runtime flag enabled.  SpiderMonkey has had them
 * for longer, but under an older Python-inspired form.  This function
 * works on both kinds of generators.
 *
 * Decorates a generator function such that:
 *  - it may yield promises
 *  - execution will continue when that promise is fulfilled
 *  - the value of the yield expression will be the fulfilled value
 *  - it returns a promise for the return value (when the generator
 *    stops iterating)
 *  - the decorated function returns a promise for the return value
 *    of the generator or the first rejected promise among those
 *    yielded.
 *  - if an error is thrown in the generator, it propagates through
 *    every following yield until it is caught, or until it escapes
 *    the generator function altogether, and is translated into a
 *    rejection for the promise returned by the decorated generator.
 */
Q.async = async;
function async(makeGenerator) {
    return function () {
        // when verb is "send", arg is a value
        // when verb is "throw", arg is an exception
        function continuer(verb, arg) {
            var result;

            // Until V8 3.19 / Chromium 29 is released, SpiderMonkey is the only
            // engine that has a deployed base of browsers that support generators.
            // However, SM's generators use the Python-inspired semantics of
            // outdated ES6 drafts.  We would like to support ES6, but we'd also
            // like to make it possible to use generators in deployed browsers, so
            // we also support Python-style generators.  At some point we can remove
            // this block.

            if (typeof StopIteration === "undefined") {
                // ES6 Generators
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    return reject(exception);
                }
                if (result.done) {
                    return result.value;
                } else {
                    return when(result.value, callback, errback);
                }
            } else {
                // SpiderMonkey Generators
                // FIXME: Remove this case when SM does ES6 generators.
                try {
                    result = generator[verb](arg);
                } catch (exception) {
                    if (isStopIteration(exception)) {
                        return exception.value;
                    } else {
                        return reject(exception);
                    }
                }
                return when(result, callback, errback);
            }
        }
        var generator = makeGenerator.apply(this, arguments);
        var callback = continuer.bind(continuer, "next");
        var errback = continuer.bind(continuer, "throw");
        return callback();
    };
}

/**
 * The spawn function is a small wrapper around async that immediately
 * calls the generator and also ends the promise chain, so that any
 * unhandled errors are thrown instead of forwarded to the error
 * handler. This is useful because it's extremely common to run
 * generators at the top-level to work with libraries.
 */
Q.spawn = spawn;
function spawn(makeGenerator) {
    Q.done(Q.async(makeGenerator)());
}

// FIXME: Remove this interface once ES6 generators are in SpiderMonkey.
/**
 * Throws a ReturnValue exception to stop an asynchronous generator.
 *
 * This interface is a stop-gap measure to support generator return
 * values in older Firefox/SpiderMonkey.  In browsers that support ES6
 * generators like Chromium 29, just use "return" in your generator
 * functions.
 *
 * @param value the return value for the surrounding generator
 * @throws ReturnValue exception with the value.
 * @example
 * // ES6 style
 * Q.async(function* () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      return foo + bar;
 * })
 * // Older SpiderMonkey style
 * Q.async(function () {
 *      var foo = yield getFooPromise();
 *      var bar = yield getBarPromise();
 *      Q.return(foo + bar);
 * })
 */
Q["return"] = _return;
function _return(value) {
    throw new QReturnValue(value);
}

/**
 * The promised function decorator ensures that any promise arguments
 * are settled and passed as values (`this` is also settled and passed
 * as a value).  It will also ensure that the result of a function is
 * always a promise.
 *
 * @example
 * var add = Q.promised(function (a, b) {
 *     return a + b;
 * });
 * add(Q(a), Q(B));
 *
 * @param {function} callback The function to decorate
 * @returns {function} a function that has been decorated.
 */
Q.promised = promised;
function promised(callback) {
    return function () {
        return spread([this, all(arguments)], function (self, args) {
            return callback.apply(self, args);
        });
    };
}

/**
 * sends a message to a value in a future turn
 * @param object* the recipient
 * @param op the name of the message operation, e.g., "when",
 * @param args further arguments to be forwarded to the operation
 * @returns result {Promise} a promise for the result of the operation
 */
Q.dispatch = dispatch;
function dispatch(object, op, args) {
    return Q(object).dispatch(op, args);
}

Promise.prototype.dispatch = function (op, args) {
    var self = this;
    var deferred = defer();
    nextTick(function () {
        self.promiseDispatch(deferred.resolve, op, args);
    });
    return deferred.promise;
};

/**
 * Gets the value of a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to get
 * @return promise for the property value
 */
Q.get = function (object, key) {
    return Q(object).dispatch("get", [key]);
};

Promise.prototype.get = function (key) {
    return this.dispatch("get", [key]);
};

/**
 * Sets the value of a property in a future turn.
 * @param object    promise or immediate reference for object object
 * @param name      name of property to set
 * @param value     new value of property
 * @return promise for the return value
 */
Q.set = function (object, key, value) {
    return Q(object).dispatch("set", [key, value]);
};

Promise.prototype.set = function (key, value) {
    return this.dispatch("set", [key, value]);
};

/**
 * Deletes a property in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of property to delete
 * @return promise for the return value
 */
Q.del = // XXX legacy
Q["delete"] = function (object, key) {
    return Q(object).dispatch("delete", [key]);
};

Promise.prototype.del = // XXX legacy
Promise.prototype["delete"] = function (key) {
    return this.dispatch("delete", [key]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param value     a value to post, typically an array of
 *                  invocation arguments for promises that
 *                  are ultimately backed with `resolve` values,
 *                  as opposed to those backed with URLs
 *                  wherein the posted value can be any
 *                  JSON serializable object.
 * @return promise for the return value
 */
// bound locally because it is used by other methods
Q.mapply = // XXX As proposed by "Redsandro"
Q.post = function (object, name, args) {
    return Q(object).dispatch("post", [name, args]);
};

Promise.prototype.mapply = // XXX As proposed by "Redsandro"
Promise.prototype.post = function (name, args) {
    return this.dispatch("post", [name, args]);
};

/**
 * Invokes a method in a future turn.
 * @param object    promise or immediate reference for target object
 * @param name      name of method to invoke
 * @param ...args   array of invocation arguments
 * @return promise for the return value
 */
Q.send = // XXX Mark Miller's proposed parlance
Q.mcall = // XXX As proposed by "Redsandro"
Q.invoke = function (object, name /*...args*/) {
    return Q(object).dispatch("post", [name, array_slice(arguments, 2)]);
};

Promise.prototype.send = // XXX Mark Miller's proposed parlance
Promise.prototype.mcall = // XXX As proposed by "Redsandro"
Promise.prototype.invoke = function (name /*...args*/) {
    return this.dispatch("post", [name, array_slice(arguments, 1)]);
};

/**
 * Applies the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param args      array of application arguments
 */
Q.fapply = function (object, args) {
    return Q(object).dispatch("apply", [void 0, args]);
};

Promise.prototype.fapply = function (args) {
    return this.dispatch("apply", [void 0, args]);
};

/**
 * Calls the promised function in a future turn.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q["try"] =
Q.fcall = function (object /* ...args*/) {
    return Q(object).dispatch("apply", [void 0, array_slice(arguments, 1)]);
};

Promise.prototype.fcall = function (/*...args*/) {
    return this.dispatch("apply", [void 0, array_slice(arguments)]);
};

/**
 * Binds the promised function, transforming return values into a fulfilled
 * promise and thrown errors into a rejected one.
 * @param object    promise or immediate reference for target function
 * @param ...args   array of application arguments
 */
Q.fbind = function (object /*...args*/) {
    var promise = Q(object);
    var args = array_slice(arguments, 1);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};
Promise.prototype.fbind = function (/*...args*/) {
    var promise = this;
    var args = array_slice(arguments);
    return function fbound() {
        return promise.dispatch("apply", [
            this,
            args.concat(array_slice(arguments))
        ]);
    };
};

/**
 * Requests the names of the owned properties of a promised
 * object in a future turn.
 * @param object    promise or immediate reference for target object
 * @return promise for the keys of the eventually settled object
 */
Q.keys = function (object) {
    return Q(object).dispatch("keys", []);
};

Promise.prototype.keys = function () {
    return this.dispatch("keys", []);
};

/**
 * Turns an array of promises into a promise for an array.  If any of
 * the promises gets rejected, the whole array is rejected immediately.
 * @param {Array*} an array (or promise for an array) of values (or
 * promises for values)
 * @returns a promise for an array of the corresponding values
 */
// By Mark Miller
// http://wiki.ecmascript.org/doku.php?id=strawman:concurrency&rev=1308776521#allfulfilled
Q.all = all;
function all(promises) {
    return when(promises, function (promises) {
        var countDown = 0;
        var deferred = defer();
        array_reduce(promises, function (undefined, promise, index) {
            var snapshot;
            if (
                isPromise(promise) &&
                (snapshot = promise.inspect()).state === "fulfilled"
            ) {
                promises[index] = snapshot.value;
            } else {
                ++countDown;
                when(
                    promise,
                    function (value) {
                        promises[index] = value;
                        if (--countDown === 0) {
                            deferred.resolve(promises);
                        }
                    },
                    deferred.reject,
                    function (progress) {
                        deferred.notify({ index: index, value: progress });
                    }
                );
            }
        }, void 0);
        if (countDown === 0) {
            deferred.resolve(promises);
        }
        return deferred.promise;
    });
}

Promise.prototype.all = function () {
    return all(this);
};

/**
 * Waits for all promises to be settled, either fulfilled or
 * rejected.  This is distinct from `all` since that would stop
 * waiting at the first rejection.  The promise returned by
 * `allResolved` will never be rejected.
 * @param promises a promise for an array (or an array) of promises
 * (or values)
 * @return a promise for an array of promises
 */
Q.allResolved = deprecate(allResolved, "allResolved", "allSettled");
function allResolved(promises) {
    return when(promises, function (promises) {
        promises = array_map(promises, Q);
        return when(all(array_map(promises, function (promise) {
            return when(promise, noop, noop);
        })), function () {
            return promises;
        });
    });
}

Promise.prototype.allResolved = function () {
    return allResolved(this);
};

/**
 * @see Promise#allSettled
 */
Q.allSettled = allSettled;
function allSettled(promises) {
    return Q(promises).allSettled();
}

/**
 * Turns an array of promises into a promise for an array of their states (as
 * returned by `inspect`) when they have all settled.
 * @param {Array[Any*]} values an array (or promise for an array) of values (or
 * promises for values)
 * @returns {Array[State]} an array of states for the respective values.
 */
Promise.prototype.allSettled = function () {
    return this.then(function (promises) {
        return all(array_map(promises, function (promise) {
            promise = Q(promise);
            function regardless() {
                return promise.inspect();
            }
            return promise.then(regardless, regardless);
        }));
    });
};

/**
 * Captures the failure of a promise, giving an oportunity to recover
 * with a callback.  If the given promise is fulfilled, the returned
 * promise is fulfilled.
 * @param {Any*} promise for something
 * @param {Function} callback to fulfill the returned promise if the
 * given promise is rejected
 * @returns a promise for the return value of the callback
 */
Q.fail = // XXX legacy
Q["catch"] = function (object, rejected) {
    return Q(object).then(void 0, rejected);
};

Promise.prototype.fail = // XXX legacy
Promise.prototype["catch"] = function (rejected) {
    return this.then(void 0, rejected);
};

/**
 * Attaches a listener that can respond to progress notifications from a
 * promise's originating deferred. This listener receives the exact arguments
 * passed to ``deferred.notify``.
 * @param {Any*} promise for something
 * @param {Function} callback to receive any progress notifications
 * @returns the given promise, unchanged
 */
Q.progress = progress;
function progress(object, progressed) {
    return Q(object).then(void 0, void 0, progressed);
}

Promise.prototype.progress = function (progressed) {
    return this.then(void 0, void 0, progressed);
};

/**
 * Provides an opportunity to observe the settling of a promise,
 * regardless of whether the promise is fulfilled or rejected.  Forwards
 * the resolution to the returned promise when the callback is done.
 * The callback can return a promise to defer completion.
 * @param {Any*} promise
 * @param {Function} callback to observe the resolution of the given
 * promise, takes no arguments.
 * @returns a promise for the resolution of the given promise when
 * ``fin`` is done.
 */
Q.fin = // XXX legacy
Q["finally"] = function (object, callback) {
    return Q(object)["finally"](callback);
};

Promise.prototype.fin = // XXX legacy
Promise.prototype["finally"] = function (callback) {
    callback = Q(callback);
    return this.then(function (value) {
        return callback.fcall().then(function () {
            return value;
        });
    }, function (reason) {
        // TODO attempt to recycle the rejection with "this".
        return callback.fcall().then(function () {
            throw reason;
        });
    });
};

/**
 * Terminates a chain of promises, forcing rejections to be
 * thrown as exceptions.
 * @param {Any*} promise at the end of a chain of promises
 * @returns nothing
 */
Q.done = function (object, fulfilled, rejected, progress) {
    return Q(object).done(fulfilled, rejected, progress);
};

Promise.prototype.done = function (fulfilled, rejected, progress) {
    var onUnhandledError = function (error) {
        // forward to a future turn so that ``when``
        // does not catch it and turn it into a rejection.
        nextTick(function () {
            makeStackTraceLong(error, promise);
            if (Q.onerror) {
                Q.onerror(error);
            } else {
                throw error;
            }
        });
    };

    // Avoid unnecessary `nextTick`ing via an unnecessary `when`.
    var promise = fulfilled || rejected || progress ?
        this.then(fulfilled, rejected, progress) :
        this;

    if (typeof process === "object" && process && process.domain) {
        onUnhandledError = process.domain.bind(onUnhandledError);
    }

    promise.then(void 0, onUnhandledError);
};

/**
 * Causes a promise to be rejected if it does not get fulfilled before
 * some milliseconds time out.
 * @param {Any*} promise
 * @param {Number} milliseconds timeout
 * @param {String} custom error message (optional)
 * @returns a promise for the resolution of the given promise if it is
 * fulfilled before the timeout, otherwise rejected.
 */
Q.timeout = function (object, ms, message) {
    return Q(object).timeout(ms, message);
};

Promise.prototype.timeout = function (ms, message) {
    var deferred = defer();
    var timeoutId = setTimeout(function () {
        deferred.reject(new Error(message || "Timed out after " + ms + " ms"));
    }, ms);

    this.then(function (value) {
        clearTimeout(timeoutId);
        deferred.resolve(value);
    }, function (exception) {
        clearTimeout(timeoutId);
        deferred.reject(exception);
    }, deferred.notify);

    return deferred.promise;
};

/**
 * Returns a promise for the given value (or promised value), some
 * milliseconds after it resolved. Passes rejections immediately.
 * @param {Any*} promise
 * @param {Number} milliseconds
 * @returns a promise for the resolution of the given promise after milliseconds
 * time has elapsed since the resolution of the given promise.
 * If the given promise rejects, that is passed immediately.
 */
Q.delay = function (object, timeout) {
    if (timeout === void 0) {
        timeout = object;
        object = void 0;
    }
    return Q(object).delay(timeout);
};

Promise.prototype.delay = function (timeout) {
    return this.then(function (value) {
        var deferred = defer();
        setTimeout(function () {
            deferred.resolve(value);
        }, timeout);
        return deferred.promise;
    });
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided as an array, and returns a promise.
 *
 *      Q.nfapply(FS.readFile, [__filename])
 *      .then(function (content) {
 *      })
 *
 */
Q.nfapply = function (callback, args) {
    return Q(callback).nfapply(args);
};

Promise.prototype.nfapply = function (args) {
    var deferred = defer();
    var nodeArgs = array_slice(args);
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Passes a continuation to a Node function, which is called with the given
 * arguments provided individually, and returns a promise.
 * @example
 * Q.nfcall(FS.readFile, __filename)
 * .then(function (content) {
 * })
 *
 */
Q.nfcall = function (callback /*...args*/) {
    var args = array_slice(arguments, 1);
    return Q(callback).nfapply(args);
};

Promise.prototype.nfcall = function (/*...args*/) {
    var nodeArgs = array_slice(arguments);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.fapply(nodeArgs).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Wraps a NodeJS continuation passing function and returns an equivalent
 * version that returns a promise.
 * @example
 * Q.nfbind(FS.readFile, __filename)("utf-8")
 * .then(console.log)
 * .done()
 */
Q.nfbind =
Q.denodeify = function (callback /*...args*/) {
    var baseArgs = array_slice(arguments, 1);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        Q(callback).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nfbind =
Promise.prototype.denodeify = function (/*...args*/) {
    var args = array_slice(arguments);
    args.unshift(this);
    return Q.denodeify.apply(void 0, args);
};

Q.nbind = function (callback, thisp /*...args*/) {
    var baseArgs = array_slice(arguments, 2);
    return function () {
        var nodeArgs = baseArgs.concat(array_slice(arguments));
        var deferred = defer();
        nodeArgs.push(deferred.makeNodeResolver());
        function bound() {
            return callback.apply(thisp, arguments);
        }
        Q(bound).fapply(nodeArgs).fail(deferred.reject);
        return deferred.promise;
    };
};

Promise.prototype.nbind = function (/*thisp, ...args*/) {
    var args = array_slice(arguments, 0);
    args.unshift(this);
    return Q.nbind.apply(void 0, args);
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback with a given array of arguments, plus a provided callback.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param {Array} args arguments to pass to the method; the callback
 * will be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nmapply = // XXX As proposed by "Redsandro"
Q.npost = function (object, name, args) {
    return Q(object).npost(name, args);
};

Promise.prototype.nmapply = // XXX As proposed by "Redsandro"
Promise.prototype.npost = function (name, args) {
    var nodeArgs = array_slice(args || []);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * Calls a method of a Node-style object that accepts a Node-style
 * callback, forwarding the given variadic arguments, plus a provided
 * callback argument.
 * @param object an object that has the named method
 * @param {String} name name of the method of object
 * @param ...args arguments to pass to the method; the callback will
 * be provided by Q and appended to these arguments.
 * @returns a promise for the value or error
 */
Q.nsend = // XXX Based on Mark Miller's proposed "send"
Q.nmcall = // XXX Based on "Redsandro's" proposal
Q.ninvoke = function (object, name /*...args*/) {
    var nodeArgs = array_slice(arguments, 2);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    Q(object).dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

Promise.prototype.nsend = // XXX Based on Mark Miller's proposed "send"
Promise.prototype.nmcall = // XXX Based on "Redsandro's" proposal
Promise.prototype.ninvoke = function (name /*...args*/) {
    var nodeArgs = array_slice(arguments, 1);
    var deferred = defer();
    nodeArgs.push(deferred.makeNodeResolver());
    this.dispatch("post", [name, nodeArgs]).fail(deferred.reject);
    return deferred.promise;
};

/**
 * If a function would like to support both Node continuation-passing-style and
 * promise-returning-style, it can end its internal promise chain with
 * `nodeify(nodeback)`, forwarding the optional nodeback argument.  If the user
 * elects to use a nodeback, the result will be sent there.  If they do not
 * pass a nodeback, they will receive the result promise.
 * @param object a result (or a promise for a result)
 * @param {Function} nodeback a Node.js-style callback
 * @returns either the promise or nothing
 */
Q.nodeify = nodeify;
function nodeify(object, nodeback) {
    return Q(object).nodeify(nodeback);
}

Promise.prototype.nodeify = function (nodeback) {
    if (nodeback) {
        this.then(function (value) {
            nextTick(function () {
                nodeback(null, value);
            });
        }, function (error) {
            nextTick(function () {
                nodeback(error);
            });
        });
    } else {
        return this;
    }
};

// All code before this point will be filtered from stack traces.
var qEndingLine = captureLine();

return Q;

});

}).call(this,require("1YiZ5S"))
},{"1YiZ5S":4}],6:[function(require,module,exports){
window.http = require('./Http');


},{"./Http":15}],7:[function(require,module,exports){
var BaseExtension, EventEmitter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('events').EventEmitter;

BaseExtension = (function(_super) {
  __extends(BaseExtension, _super);

  function BaseExtension() {
    return BaseExtension.__super__.constructor.apply(this, arguments);
  }

  BaseExtension.prototype.http = null;

  BaseExtension.prototype.setHttp = function(http) {
    this.http = http;
    return this.emit('httpReady', this.http);
  };

  return BaseExtension;

})(EventEmitter);

module.exports = BaseExtension;


},{"events":3}],8:[function(require,module,exports){
var $, BaseExtension, Forms,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseExtension = require('./BaseExtension');

$ = null;

Forms = (function(_super) {
  __extends(Forms, _super);

  function Forms(jQuery) {
    this.onFormSubmitted = __bind(this.onFormSubmitted, this);
    $ = jQuery;
    $(document).on('submit', 'form.ajax:not(.not-ajax)', this.onFormSubmitted);
    $(document).on('click', 'form.ajax:not(.not-ajax) input[type="submit"]', this.onFormSubmitted);
    $(document).on('click', 'form input[type="submit"].ajax', this.onFormSubmitted);
  }

  Forms.prototype.onFormSubmitted = function(e) {
    var el, form, i, name, options, sendValues, val, value, values, _i, _len;
    e.preventDefault();
    if (this.http === null) {
      throw new Error('Please add Forms extension into http object with addExtension method.');
    }
    el = $(e.target);
    sendValues = {};
    if (el.is(':submit')) {
      form = el.closest('form');
      sendValues[el.attr('name')] = el.val() || '';
    } else if (el.is('form')) {
      form = el;
    } else {
      return null;
    }
    if (form.get(0).onsubmit && form.get(0).onsubmit() === false) {
      return null;
    }
    values = form.serializeArray();
    for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
      value = values[i];
      name = value.name;
      if (typeof sendValues[name] === 'undefined') {
        sendValues[name] = value.value;
      } else {
        val = sendValues[name];
        if (Object.prototype.toString.call(val) !== '[object Array]') {
          val = [val];
        }
        val.push(value.value);
        sendValues[name] = val;
      }
    }
    options = {
      data: sendValues,
      type: form.attr('method') || 'GET'
    };
    return this.http.request(form.attr('action'), options);
  };

  return Forms;

})(BaseExtension);

module.exports = Forms;


},{"./BaseExtension":7}],9:[function(require,module,exports){
var $, BaseExtension, Links, hasAttr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseExtension = require('./BaseExtension');

$ = null;

hasAttr = function(el, name) {
  var attr;
  attr = $(el).attr(name);
  return typeof attr !== 'undefined' && attr !== false;
};

Links = (function(_super) {
  __extends(Links, _super);

  Links.HISTORY_API_ATTRIBUTE = 'data-history-api';

  function Links(jQuery) {
    $ = jQuery;
    $(document).on('click', 'a.ajax:not(.not-ajax)', (function(_this) {
      return function(e) {
        var a, link, type;
        e.preventDefault();
        if (_this.http === null) {
          throw new Error('Please add Links extension into http object with addExtension method.');
        }
        a = e.target.nodeName.toLowerCase() === 'a' ? $(e.target) : $(e.target).closest('a');
        link = a.attr('href');
        type = hasAttr(a, 'data-type') ? a.attr('data-type').toUpperCase() : 'GET';
        if (_this.http.isHistoryApiSupported() && hasAttr(a, Links.HISTORY_API_ATTRIBUTE)) {
          window.history.pushState({}, null, link);
        }
        return _this.http.request(link, {
          type: type
        });
      };
    })(this));
  }

  return Links;

})(BaseExtension);

module.exports = Links;


},{"./BaseExtension":7}],10:[function(require,module,exports){
var BaseExtension, Loading,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseExtension = require('./BaseExtension');

Loading = (function(_super) {
  __extends(Loading, _super);

  function Loading() {
    return Loading.__super__.constructor.apply(this, arguments);
  }

  Loading.prototype.send = function() {
    return document.body.style.cursor = 'progress';
  };

  Loading.prototype.complete = function() {
    return document.body.style.cursor = 'auto';
  };

  return Loading;

})(BaseExtension);

module.exports = Loading;


},{"./BaseExtension":7}],11:[function(require,module,exports){
var BaseExtension, Offline,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseExtension = require('./BaseExtension');

Offline = (function(_super) {
  __extends(Offline, _super);

  Offline.prototype.timer = null;

  Offline.prototype.offline = false;

  function Offline(url, timeout) {
    if (url == null) {
      url = 'favicon.ico';
    }
    if (timeout == null) {
      timeout = 5000;
    }
    this.start(url, timeout);
  }

  Offline.prototype.start = function(url, timeout) {
    if (url == null) {
      url = 'favicon.ico';
    }
    if (timeout == null) {
      timeout = 5000;
    }
    return this.timer = window.setInterval((function(_this) {
      return function() {
        if (_this.http === null) {
          throw new Error('Please add Offline extension into http object with addExtension method.');
        }
        return _this.http.get(url, {
          data: {
            r: Math.floor(Math.random() * 1000000000)
          }
        }).then(function(response) {
          if ((response.status >= 200 && response.status <= 300) || response.status === 304) {
            if (_this.offline) {
              _this.offline = false;
              return _this.http.emit('connected');
            }
          } else if (!_this.offline) {
            _this.offline = false;
            return _this.http.emit('disconnected');
          }
        });
      };
    })(this), timeout);
  };

  Offline.prototype.stop = function() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    return this;
  };

  return Offline;

})(BaseExtension);

module.exports = Offline;


},{"./BaseExtension":7}],12:[function(require,module,exports){
var BaseExtension, Redirect,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseExtension = require('./BaseExtension');

Redirect = (function(_super) {
  __extends(Redirect, _super);

  function Redirect() {
    return Redirect.__super__.constructor.apply(this, arguments);
  }

  Redirect.prototype.success = function(response) {
    if (typeof response.data.redirect !== 'undefined') {
      return window.location.href = response.data.redirect;
    }
  };

  return Redirect;

})(BaseExtension);

module.exports = Redirect;


},{"./BaseExtension":7}],13:[function(require,module,exports){
var BaseExtension, Snippets, hasAttr,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BaseExtension = require('./BaseExtension');

hasAttr = function(el, name) {
  var attr;
  attr = el.getAttribute(name);
  return typeof attr !== 'undefined' && attr !== false;
};

Snippets = (function(_super) {
  __extends(Snippets, _super);

  function Snippets() {
    this.success = __bind(this.success, this);
    return Snippets.__super__.constructor.apply(this, arguments);
  }

  Snippets.APPEND_ATTRIBUTE = 'data-append';

  Snippets.prototype.success = function(response) {
    var el, html, id, _ref, _results;
    if (typeof response.data.snippets !== 'undefined') {
      _ref = response.data.snippets;
      _results = [];
      for (id in _ref) {
        html = _ref[id];
        el = document.getElementById(id);
        if (hasAttr(el, Snippets.APPEND_ATTRIBUTE)) {
          _results.push(this.appendSnippet(el, html));
        } else {
          _results.push(this.updateSnippet(el, html));
        }
      }
      return _results;
    }
  };

  Snippets.prototype.updateSnippet = function(el, html) {
    return el.innerHTML = html;
  };

  Snippets.prototype.appendSnippet = function(el, html) {
    return el.innerHTML += html;
  };

  return Snippets;

})(BaseExtension);

module.exports = Snippets;


},{"./BaseExtension":7}],14:[function(require,module,exports){
var Helpers;

Helpers = (function() {
  function Helpers() {}

  Helpers.urlencode = function(param) {
    param = (param + '').toString();
    return encodeURIComponent(param).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/\~/g, '%7E').replace(/%20/g, '+');
  };

  Helpers.buildQuery = function(params) {
    var add, buildParams, key, result, value, _i, _len;
    result = [];
    add = function(key, value) {
      value = typeof value === 'function' ? value() : (value === null ? '' : value);
      return result.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    };
    buildParams = function(key, value) {
      var i, k, v, _i, _len, _results, _results1;
      if (Object.prototype.toString.call(value) === '[object Array]') {
        _results = [];
        for (i = _i = 0, _len = value.length; _i < _len; i = ++_i) {
          v = value[i];
          if (/\[\]$/.test(key) === true) {
            _results.push(add(key, v));
          } else {
            _results.push(buildParams(key + '[' + (typeof v === 'object' ? i : '') + ']', v));
          }
        }
        return _results;
      } else if (Object.prototype.toString.call(value) === '[object Object]') {
        _results1 = [];
        for (k in value) {
          v = value[k];
          _results1.push(buildParams(key + '[' + k + ']', v));
        }
        return _results1;
      } else {
        return add(key, value);
      }
    };
    if (Object.prototype.toString.call(params) === '[object Array]') {
      for (key = _i = 0, _len = params.length; _i < _len; key = ++_i) {
        value = params[key];
        add(key, value);
      }
    } else {
      for (key in params) {
        value = params[key];
        buildParams(key, value);
      }
    }
    return result.join('&').replace(/%20/g, '+');
  };

  return Helpers;

})();

module.exports = Helpers;


},{}],15:[function(require,module,exports){
var Http, http;

Http = require('./_Http');

http = new Http;

http.Helpers = require('./Helpers');

http.Xhr = require('./Xhr');

http._Q = require('q');

http.Extensions = {
  Forms: require('./Extensions/Forms'),
  Links: require('./Extensions/Links'),
  Loading: require('./Extensions/Loading'),
  Redirect: require('./Extensions/Redirect'),
  Snippets: require('./Extensions/Snippets'),
  Offline: require('./Extensions/Offline')
};

http.Mocks = {
  Http: require('./Mocks/Http')
};

module.exports = http;


},{"./Extensions/Forms":8,"./Extensions/Links":9,"./Extensions/Loading":10,"./Extensions/Offline":11,"./Extensions/Redirect":12,"./Extensions/Snippets":13,"./Helpers":14,"./Mocks/Http":16,"./Xhr":22,"./_Http":23,"q":5}],16:[function(require,module,exports){
var Http, OriginalHttp, Request, createRequest,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Request = require('./Request');

OriginalHttp = require('../_Http');

createRequest = function(requestUrl, requestType, requestData, requestJsonp, requestJsonPrefix, responseData, responseHeaders, responseStatus, responseTimeout) {
  var request, _ref;
  if (responseHeaders == null) {
    responseHeaders = {};
  }
  if (responseStatus == null) {
    responseStatus = 200;
  }
  if (responseTimeout == null) {
    responseTimeout = null;
  }
  if (typeof responseHeaders['content-type'] === 'undefined') {
    responseHeaders['content-type'] = 'text/plain';
  }
  if ((responseHeaders['content-type'].match(/application\/json/) !== null || this.jsonPrefix !== null) && ((_ref = Object.prototype.toString.call(responseData)) === '[object Array]' || _ref === '[object Object]')) {
    responseData = JSON.stringify(responseData);
  }
  request = new Request(requestUrl, requestType, requestData, requestJsonp, requestJsonPrefix);
  request.on('afterSend', function() {
    var name, value;
    for (name in responseHeaders) {
      value = responseHeaders[name];
      request.xhr.setResponseHeader(name, value);
    }
    return request.xhr.receive(responseStatus, responseData, responseTimeout);
  });
  return request;
};

Http = (function(_super) {
  __extends(Http, _super);

  Http.prototype._originalCreateRequest = null;

  function Http() {
    Http.__super__.constructor.apply(this, arguments);
    this._originalCreateRequest = this.createRequest;
  }

  Http.prototype.receive = function(sendData, headers, status, timeout) {
    if (sendData == null) {
      sendData = '';
    }
    if (headers == null) {
      headers = {};
    }
    if (status == null) {
      status = 200;
    }
    if (timeout == null) {
      timeout = null;
    }
    return this.createRequest = function(url, type, data, jsonp, jsonPrefix) {
      return createRequest(url, type, data, jsonp, jsonPrefix, sendData, headers, status, timeout);
    };
  };

  Http.prototype.receiveDataFromRequestAndSendBack = function(headers, status, timeout) {
    if (headers == null) {
      headers = {};
    }
    if (status == null) {
      status = 200;
    }
    if (timeout == null) {
      timeout = null;
    }
    return this.createRequest = function(url, type, data, jsonp, jsonPrefix) {
      return createRequest(url, type, data, jsonp, jsonPrefix, data, headers, status, timeout);
    };
  };

  Http.prototype.receiveError = function(err) {
    return this.createRequest = function(url, type, data, jsonp, jsonPrefix) {
      var request;
      request = new Request(url, type, data, jsonp, jsonPrefix);
      request.on('afterSend', function() {
        return request.xhr.receiveError(err);
      });
      return request;
    };
  };

  Http.prototype.restore = function() {
    return this.createRequest = this._originalCreateRequest;
  };

  return Http;

})(OriginalHttp);

module.exports = new Http;


},{"../_Http":23,"./Request":17}],17:[function(require,module,exports){
var OriginalRequest, Request, Xhr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

OriginalRequest = require('../Request');

Xhr = require('./Xhr');

Request = (function(_super) {
  __extends(Request, _super);

  function Request() {
    return Request.__super__.constructor.apply(this, arguments);
  }

  Request.prototype.createXhr = function(url, type, data, jsonp, jsonPrefix) {
    return new Xhr(url, type, data, jsonp, jsonPrefix);
  };

  return Request;

})(OriginalRequest);

module.exports = Request;


},{"../Request":20,"./Xhr":18}],18:[function(require,module,exports){
var OriginalXhr, Xhr, XmlHttpMocks,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

OriginalXhr = require('../Xhr');

XmlHttpMocks = require('../../external/XmlHttpRequest');

Xhr = (function(_super) {
  __extends(Xhr, _super);

  function Xhr() {
    return Xhr.__super__.constructor.apply(this, arguments);
  }

  Xhr.prototype.createXhr = function() {
    return new XmlHttpMocks;
  };

  Xhr.prototype.receive = function(status, data, timeout) {
    if (timeout == null) {
      timeout = null;
    }
    return this.xhr.receive(status, data, timeout);
  };

  Xhr.prototype.receiveError = function(err) {
    return this.xhr.err(err);
  };

  Xhr.prototype.setResponseHeader = function(name, value) {
    return this.xhr.setResponseHeader(name, value);
  };

  return Xhr;

})(OriginalXhr);

module.exports = Xhr;


},{"../../external/XmlHttpRequest":1,"../Xhr":22}],19:[function(require,module,exports){
var EventEmitter, Q, Queue,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('events').EventEmitter;

Q = require('q');

Queue = (function(_super) {
  __extends(Queue, _super);

  Queue.prototype.requests = null;

  Queue.prototype.running = false;

  function Queue() {
    this.requests = [];
  }

  Queue.prototype.hasWritableRequests = function() {
    var request, _i, _len, _ref, _ref1;
    if (this.running) {
      _ref = this.requests;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        request = _ref[_i];
        if ((_ref1 = request.request.type) === 'PUT' || _ref1 === 'POST' || _ref1 === 'DELETE') {
          return true;
        }
      }
    }
    return false;
  };

  Queue.prototype.getCurrentRequest = function() {
    if (this.requests.length === 0) {
      return null;
    }
    return this.requests[0].request;
  };

  Queue.prototype.addAndSend = function(request) {
    var deferred;
    this.emit('add', request);
    deferred = Q.defer();
    this.requests.push({
      request: request,
      fn: function(err, response) {
        if (err) {
          return deferred.reject(err);
        } else {
          return deferred.resolve(response);
        }
      }
    });
    if (!this.running) {
      this.run();
    }
    return deferred.promise;
  };

  Queue.prototype.next = function() {
    this.requests.shift();
    if (this.requests.length > 0) {
      this.emit('next', this.requests[0].request);
      return this.run();
    } else {
      this.running = false;
      return this.emit('finish');
    }
  };

  Queue.prototype.run = function() {
    var data, fn, request;
    if (this.requests.length === 0) {
      throw new Error('No pending requests');
    }
    this.running = true;
    data = this.requests[0];
    request = data.request;
    fn = data.fn;
    this.emit('send', request);
    return request.send().then((function(_this) {
      return function(response) {
        fn(null, response);
        return _this.next();
      };
    })(this)).fail((function(_this) {
      return function(err) {
        fn(err, null);
        return _this.next();
      };
    })(this));
  };

  Queue.prototype.removePending = function() {
    var request;
    if (this.running) {
      request = this.requests[0];
      this.requests = [request];
    } else {
      this.requests = [];
    }
    return this;
  };

  Queue.prototype.stop = function() {
    if (this.running) {
      this.getCurrentRequest().abort();
    }
    this.requests = [];
    return this;
  };

  return Queue;

})(EventEmitter);

module.exports = Queue;


},{"events":3,"q":5}],20:[function(require,module,exports){
var EventEmitter, Request, Xhr,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Xhr = require('./Xhr');

EventEmitter = require('events').EventEmitter;

Request = (function(_super) {
  __extends(Request, _super);

  Request.prototype.url = null;

  Request.prototype.type = 'GET';

  Request.prototype.data = null;

  Request.prototype.jsonp = null;

  Request.prototype.xhr = null;

  Request.prototype.response = null;

  Request.prototype.jsonPrefix = null;

  Request.prototype.aborted = false;

  function Request(url, type, data, jsonp, jsonPrefix) {
    this.url = url;
    this.type = type != null ? type : 'GET';
    this.data = data != null ? data : null;
    this.jsonp = jsonp != null ? jsonp : false;
    this.jsonPrefix = jsonPrefix != null ? jsonPrefix : null;
    Request.__super__.constructor.apply(this, arguments);
    this.xhr = this.createXhr(this.url, this.type, this.data, this.jsonp, this.jsonPrefix);
    this.response = this.xhr.response;
    this.xhr.on('send', (function(_this) {
      return function(response) {
        return _this.emit('send', response, _this);
      };
    })(this));
    this.xhr.on('afterSend', (function(_this) {
      return function(response) {
        return _this.emit('afterSend', response, _this);
      };
    })(this));
    this.xhr.on('success', (function(_this) {
      return function(response) {
        return _this.emit('success', response, _this);
      };
    })(this));
    this.xhr.on('error', (function(_this) {
      return function(err, response) {
        return _this.emit('error', err, response, _this);
      };
    })(this));
    this.xhr.on('complete', (function(_this) {
      return function(err, response) {
        return _this.emit('complete', err, response, _this);
      };
    })(this));
    this.xhr.on('abort', (function(_this) {
      return function(response) {
        return _this.emit('abort', response);
      };
    })(this));
  }

  Request.prototype.createXhr = function(url, type, data, jsonp, jsonPrefix) {
    return new Xhr(url, type, data, jsonp, jsonPrefix);
  };

  Request.prototype.setHeader = function(name, value) {
    return this.xhr.setHeader(name, value);
  };

  Request.prototype.send = function() {
    return this.xhr.send();
  };

  Request.prototype.abort = function() {
    return this.xhr.abort();
  };

  Request.prototype.getHeaders = function() {
    return this.xhr.getHeaders();
  };

  Request.prototype.getHeader = function(name) {
    return this.xhr.getHeader(name);
  };

  Request.prototype.setHeader = function(name, value) {
    return this.xhr.setHeader(name, value);
  };

  Request.prototype.setMimeType = function(mime) {
    return this.xhr.setMimeType(mime);
  };

  return Request;

})(EventEmitter);

module.exports = Request;


},{"./Xhr":22,"events":3}],21:[function(require,module,exports){
var Response;

Response = (function() {
  function Response() {}

  Response.prototype.state = 0;

  Response.prototype.status = null;

  Response.prototype.statusText = null;

  Response.prototype.rawData = null;

  Response.prototype.data = null;

  Response.prototype.xml = null;

  return Response;

})();

module.exports = Response;


},{}],22:[function(require,module,exports){
var EventEmitter, Helpers, Q, Response, Xhr, escape,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Helpers = require('./Helpers');

Response = require('./Response');

EventEmitter = require('events').EventEmitter;

Q = require('q');

escape = require('escape-regexp');

Xhr = (function(_super) {
  __extends(Xhr, _super);

  Xhr.JSONP_METHOD_PREFIX = '__browser_http_jsonp_callback_';

  Xhr.COUNTER = 0;

  Xhr.prototype.xhr = null;

  Xhr.prototype.response = null;

  Xhr.prototype.url = null;

  Xhr.prototype.type = 'GET';

  Xhr.prototype.data = null;

  Xhr.prototype.jsonp = false;

  Xhr.prototype.jsonPrefix = null;

  function Xhr(url, type, data, jsonp, jsonPrefix) {
    var method, _ref;
    this.url = url;
    this.type = type != null ? type : 'GET';
    this.data = data != null ? data : null;
    this.jsonp = jsonp != null ? jsonp : false;
    this.jsonPrefix = jsonPrefix != null ? jsonPrefix : null;
    this.response = new Response;
    Xhr.COUNTER++;
    this.type = this.type.toUpperCase();
    if ((_ref = this.type) !== 'GET' && _ref !== 'POST' && _ref !== 'PUT' && _ref !== 'DELETE') {
      throw new Error("Http request: type must be GET, POST, PUT or DELETE, " + this.type + " given");
    }
    if (this.jsonp !== false) {
      if (this.jsonp === true) {
        this.jsonp = 'callback';
      }
      method = Xhr.JSONP_METHOD_PREFIX + Xhr.COUNTER;
      this.url += this.url.indexOf('?') !== -1 ? '&' : '?';
      this.url += this.jsonp + '=' + method;
      window[method] = (function(_this) {
        return function(data) {
          return _this.response.data = data;
        };
      })(this);
    }
    if (this.data !== null) {
      this.data = Helpers.buildQuery(this.data);
      if (type !== 'POST') {
        this.url += this.url.indexOf('?') !== -1 ? '&' : '?';
        this.url += this.data;
      }
    }
    this.xhr = this.createXhr();
    this.xhr.open(this.type, this.url, true);
    if (this.url.match(/^(http)s?\:\/\//) === null) {
      this.xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    if (this.type === 'POST') {
      this.xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    this.xhr.onreadystatechange = (function(_this) {
      return function() {
        var contentType, prefix;
        _this.response.state = _this.xhr.readyState;
        if (_this.response.state === 4) {
          _this.response.status = _this.xhr.status;
          _this.response.statusText = _this.xhr.statusText;
          _this.response.rawData = _this.xhr.responseText;
          _this.response.xml = _this.xhr.responseXML;
          _this.response.data = _this.xhr.responseText;
          contentType = _this.xhr.getResponseHeader('content-type');
          if (contentType !== null && (contentType.match(/application\/json/) !== null || _this.jsonPrefix !== null)) {
            data = _this.response.data;
            if (_this.jsonPrefix !== null) {
              prefix = escape(_this.jsonPrefix);
              data = data.replace(new RegExp('^' + prefix), '');
            }
            _this.response.data = JSON.parse(data);
          }
          if (contentType !== null && (contentType.match(/text\/javascript/) !== null || contentType.match(/application\/javascript/) !== null) && _this.jsonp) {
            eval(_this.response.data);
          }
          if (_this.response.status === 200) {
            return _this.emit('success', _this.response);
          } else {
            return _this.emit('error', new Error("Can not load " + url + " address", _this.response));
          }
        }
      };
    })(this);
  }

  Xhr.prototype.createXhr = function() {
    if (window.XMLHttpRequest) {
      return new window.XMLHttpRequest;
    } else {
      return new ActiveXObject("Microsoft.XMLHTTP");
    }
  };

  Xhr.prototype.getHeaders = function() {
    return this.xhr.getAllResponseHeaders();
  };

  Xhr.prototype.getHeader = function(name) {
    return this.xhr.getResponseHeader(name);
  };

  Xhr.prototype.setHeader = function(name, value) {
    this.xhr.setRequestHeader(name, value);
    return this;
  };

  Xhr.prototype.setMimeType = function(mime) {
    this.xhr.overrideMimeType(mime);
    return this;
  };

  Xhr.prototype.send = function() {
    var deferred;
    deferred = Q.defer();
    this.emit('send', this.response);
    this.on('success', (function(_this) {
      return function(response) {
        _this.emit('complete', null, response);
        return deferred.resolve(response);
      };
    })(this));
    this.on('error', (function(_this) {
      return function(err, response) {
        _this.emit('complete', err, response);
        return deferred.reject(err);
      };
    })(this));
    this.xhr.send(this.data);
    this.emit('afterSend', this.response);
    return deferred.promise;
  };

  Xhr.prototype.abort = function() {
    this.xhr.abort();
    this.emit('abort', this.response);
    return this;
  };

  return Xhr;

})(EventEmitter);

module.exports = Xhr;


},{"./Helpers":14,"./Response":21,"escape-regexp":2,"events":3,"q":5}],23:[function(require,module,exports){
var BaseExtension, EventEmitter, Http, Q, Queue, Request,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __slice = [].slice;

Request = require('./Request');

Queue = require('./Queue');

Q = require('q');

BaseExtension = require('./Extensions/BaseExtension');

EventEmitter = require('events').EventEmitter;

Http = (function(_super) {
  __extends(Http, _super);

  Http.prototype.extensions = null;

  Http.prototype.queue = null;

  Http.prototype.historyApiSupported = null;

  Http.prototype.useQueue = true;

  Http.prototype.options = {
    type: 'GET',
    jsonPrefix: null,
    parallel: true
  };

  function Http() {
    Http.__super__.constructor.apply(this, arguments);
    this.extensions = {};
    this.queue = new Queue;
    this.on('send', (function(_this) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.callExtensions('send', args);
      };
    })(this));
    this.on('afterSend', (function(_this) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.callExtensions('afterSend', args);
      };
    })(this));
    this.on('complete', (function(_this) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.callExtensions('complete', args);
      };
    })(this));
    this.on('error', (function(_this) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.callExtensions('error', args);
      };
    })(this));
    this.on('success', (function(_this) {
      return function() {
        var args;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        return _this.callExtensions('success', args);
      };
    })(this));
  }

  Http.prototype.createRequest = function(url, type, data, jsonp, jsonPrefix) {
    return new Request(url, type, data, jsonp, jsonPrefix);
  };

  Http.prototype.request = function(url, options) {
    var request, _ref;
    if (options == null) {
      options = {};
    }
    if (typeof options.type === 'undefined') {
      options.type = this.options.type;
    }
    if (typeof options.data === 'undefined') {
      options.data = null;
    }
    if (typeof options.jsonp === 'undefined') {
      options.jsonp = false;
    }
    if (typeof options.jsonPrefix === 'undefined') {
      options.jsonPrefix = this.options.jsonPrefix;
    }
    if (typeof options.parallel === 'undefined') {
      options.parallel = this.options.parallel;
    }
    request = this.createRequest(url, options.type, options.data, options.jsonp, options.jsonPrefix);
    request.on('send', (function(_this) {
      return function(response, request) {
        return _this.emit('send', response, request);
      };
    })(this));
    request.on('afterSend', (function(_this) {
      return function(response, request) {
        return _this.emit('afterSend', response, request);
      };
    })(this));
    request.on('success', (function(_this) {
      return function(response, request) {
        return _this.emit('success', response, request);
      };
    })(this));
    request.on('error', (function(_this) {
      return function(error, response, request) {
        return _this.emit('error', error, response, request);
      };
    })(this));
    request.on('complete', (function(_this) {
      return function(err, response, request) {
        return _this.emit('complete', err, response, request);
      };
    })(this));
    if (this.useQueue && (((_ref = options.type) === 'PUT' || _ref === 'POST' || _ref === 'DELETE') || options.parallel === false || this.queue.hasWritableRequests())) {
      return this.queue.addAndSend(request);
    } else {
      return request.send();
    }
  };

  Http.prototype.get = function(url, options) {
    if (options == null) {
      options = {};
    }
    options.type = 'GET';
    return this.request(url, options);
  };

  Http.prototype.post = function(url, options) {
    if (options == null) {
      options = {};
    }
    options.type = 'POST';
    return this.request(url, options);
  };

  Http.prototype.put = function(url, options) {
    if (options == null) {
      options = {};
    }
    options.type = 'PUT';
    return this.request(url, options);
  };

  Http.prototype["delete"] = function(url, options) {
    if (options == null) {
      options = {};
    }
    options.type = 'DELETE';
    return this.request(url, options);
  };

  Http.prototype.getJson = function(url, options) {
    if (options == null) {
      options = {};
    }
    return this.request(url, options).then(function(response) {
      if (typeof response.data === 'string') {
        response.data = JSON.parse(response.data);
      }
      return Q.resolve(response);
    });
  };

  Http.prototype.postJson = function(url, options) {
    if (options == null) {
      options = {};
    }
    options.type = 'POST';
    return this.request(url, options).then(function(response) {
      if (typeof response.data === 'string') {
        response.data = JSON.parse(response.data);
      }
      return Q.resolve(response);
    });
  };

  Http.prototype.jsonp = function(url, options) {
    if (options == null) {
      options = {};
    }
    if (typeof options.jsonp === 'undefined') {
      options.jsonp = true;
    }
    return this.get(url, options);
  };

  Http.prototype.isHistoryApiSupported = function() {
    if (this.historyApiSupported) {
      this.historyApiSupported = window.history && window.history.pushState && window.history.replaceState && !navigator.userAgent.match(/((iPod|iPhone|iPad).+\bOS\s+[1-4]|WebApps\/.+CFNetwork)/);
    }
    return this.historyApiSupported;
  };

  Http.prototype.addExtension = function(name, extension) {
    if (extension instanceof BaseExtension) {
      extension.setHttp(this);
    }
    this.extensions[name] = extension;
    return this;
  };

  Http.prototype.removeExtension = function(name) {
    if (typeof this.extensions[name] === 'undefined') {
      throw new Error('Extension ' + name + ' does not exists');
    }
    delete this.extensions[name];
    return this;
  };

  Http.prototype.callExtensions = function(event, args) {
    var ext, name, _ref, _results;
    _ref = this.extensions;
    _results = [];
    for (name in _ref) {
      ext = _ref[name];
      if (typeof ext[event] !== 'undefined') {
        _results.push(ext[event].apply(ext[event], args));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  return Http;

})(EventEmitter);

module.exports = Http;


},{"./Extensions/BaseExtension":7,"./Queue":19,"./Request":20,"events":3,"q":5}]},{},[6])