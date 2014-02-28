(function() {
	var __r__c__ = {};
	/** Generated by SimQ **/
	/** modules **/
	
	// Generated by CoffeeScript 1.6.3
	(function() {
	  var SUPPORTED, arrayIndexOf, cache, creating, modules, require, resolve, stats;
	
	  SUPPORTED = ['js', 'json', 'ts', 'coffee', 'eco'];
	
	  modules = {};
	
	  stats = {};
	
	  cache = {};
	
	  creating = [];
	
	  require = function(name, parent) {
	    var fullName, m;
	    if (parent == null) {
	      parent = null;
	    }
	    fullName = resolve(name, parent);
	    if (typeof cache[fullName] === 'undefined') {
	      m = {
	        exports: {},
	        id: fullName,
	        filename: fullName,
	        loaded: false,
	        parent: null,
	        children: null
	      };
	      if (arrayIndexOf(creating, fullName) === -1) {
	        creating.push(fullName);
	        modules[fullName].apply(window, [m.exports, m]);
	        creating.splice(arrayIndexOf(creating, fullName));
	        cache[fullName] = m;
	      }
	      m.loaded = true;
	    } else {
	      m = cache[fullName];
	    }
	    if (typeof stats[fullName] === 'undefined') {
	      stats[fullName] = {
	        atime: null,
	        mtime: null,
	        ctime: null
	      };
	    }
	    stats[fullName].atime = new Date;
	    return m.exports;
	  };
	
	  resolve = function(name, parent) {
	    var ext, num, original, part, parts, prev, result, _i, _j, _k, _len, _len1, _len2;
	    if (parent == null) {
	      parent = null;
	    }
	    original = name;
	    if (parent !== null && name[0] === '.') {
	      num = parent.lastIndexOf('/');
	      if (num !== -1) {
	        parent = parent.substr(0, num);
	      }
	      name = parent + '/' + name;
	    }
	    parts = name.split('/');
	    result = [];
	    prev = null;
	    for (_i = 0, _len = parts.length; _i < _len; _i++) {
	      part = parts[_i];
	      if (part === '.' || part === '') {
	        continue;
	      } else if (part === '..' && prev) {
	        result.pop();
	      } else {
	        result.push(part);
	      }
	      prev = part;
	    }
	    name = result.join('/');
	    if ((original[0] === '/') || (parent !== null && parent[0] === '/' && original[0] === '.')) {
	      name = '/' + name;
	    }
	    if (typeof modules[name] !== 'undefined') {
	      return name;
	    }
	    for (_j = 0, _len1 = SUPPORTED.length; _j < _len1; _j++) {
	      ext = SUPPORTED[_j];
	      if (typeof modules[name + '.' + ext] !== 'undefined') {
	        return name + '.' + ext;
	      }
	    }
	    for (_k = 0, _len2 = SUPPORTED.length; _k < _len2; _k++) {
	      ext = SUPPORTED[_k];
	      if (typeof modules[name + '/index.' + ext] !== 'undefined') {
	        return name + '/index.' + ext;
	      }
	    }
	    throw new Error("Module " + original + " was not found.");
	  };
	
	  arrayIndexOf = function(array, search) {
	    var element, i, _i, _len;
	    if (typeof Array.prototype.indexOf !== 'undefined') {
	      return array.indexOf(search);
	    }
	    if (array.length === 0) {
	      return -1;
	    }
	    for (i = _i = 0, _len = array.length; _i < _len; i = ++_i) {
	      element = array[i];
	      if (element === search) {
	        return i;
	      }
	    }
	    return -1;
	  };
	
	  __r__c__.require = function(name, parent) {
	    if (parent == null) {
	      parent = null;
	    }
	    return require(name, parent);
	  };
	
	  __r__c__.require.simq = true;
	
	  __r__c__.require.version = '5.6.4';
	
	  __r__c__.require.resolve = function(name, parent) {
	    if (parent == null) {
	      parent = null;
	    }
	    return resolve(name, parent);
	  };
	
	  __r__c__.require.define = function(bundleOrName, obj) {
	    var m, name, _results;
	    if (obj == null) {
	      obj = null;
	    }
	    if (typeof bundleOrName === 'string') {
	      return modules[bundleOrName] = obj;
	    } else {
	      _results = [];
	      for (name in bundleOrName) {
	        m = bundleOrName[name];
	        _results.push(modules[name] = m);
	      }
	      return _results;
	    }
	  };
	
	  __r__c__.require.release = function() {
	    var name, _results;
	    _results = [];
	    for (name in cache) {
	      _results.push(delete cache[name]);
	    }
	    return _results;
	  };
	
	  __r__c__.require.getStats = function(name, parent) {
	    var fullName;
	    if (parent == null) {
	      parent = null;
	    }
	    fullName = resolve(name, parent);
	    if (fullName === null) {
	      throw new Error('Module ' + name + ' was not found.');
	    }
	    if (typeof stats[fullName] === 'undefined') {
	      stats[fullName] = {
	        atime: null,
	        mtime: null,
	        ctime: null
	      };
	    }
	    return stats[fullName];
	  };
	
	  __r__c__.require.__setStats = function(bundle) {
	    var data, name, _results;
	    _results = [];
	    for (name in bundle) {
	      data = bundle[name];
	      _results.push(stats[name] = {
	        atime: new Date(data.atime),
	        mtime: new Date(data.mtime),
	        ctime: new Date(data.ctime)
	      });
	    }
	    return _results;
	  };
	
	  __r__c__.require.cache = cache;
	
	  return __r__c__.require.define;
	
	}).call(this)({
	 '/tests/Extensions.coffee': function(exports, module) {
	
		/** node globals **/
		var require = function(name) {return __r__c__.require(name, '/tests/Extensions.coffee');};
		require.resolve = function(name, parent) {if (parent === null) {parent = '/tests/Extensions.coffee';} return __r__c__.require.resolve(name, parent);};
		require.define = function(bundle) {__r__c__.require.define(bundle);};
		require.cache = __r__c__.require.cache;
		var __filename = '/tests/Extensions.coffee';
		var __dirname = '/tests';
		var process = {cwd: function() {return '/';}, argv: ['node', '/tests/Extensions.coffee'], env: {}};
	
		/** code **/
		(function() {
		  var Http, link;
		
		  Http = window.http.Mocks.Http;
		
		  link = 'http://localhost:3000/';
		
		  describe('Extensions', function() {
		    afterEach(function() {
		      Http.extensions = {};
		      return Http.restore();
		    });
		    describe('#addExtension()', function() {
		      return it('should add new extension', function() {
		        Http.addExtension('snippet', {});
		        return expect(Http.extensions).to.include.keys('snippet');
		      });
		    });
		    describe('#removeExtension()', function() {
		      it('should remove added extension', function() {
		        Http.addExtension('snippet', {});
		        Http.removeExtension('snippet');
		        return expect(Http.extensions).to.be.eql({});
		      });
		      return it('should throw an error if extension does not exists', function() {
		        return expect(function() {
		          return Http.removeExtension('snippet');
		        }).to["throw"](Error);
		      });
		    });
		    return describe('#callExtensions()', function() {
		      return it('should call success event after response is recieved', function(done) {
		        Http.addExtension('test', {
		          success: function(response) {
		            expect(response.data).to.be.equal('test');
		            return done();
		          }
		        });
		        Http.receive('test');
		        return Http.get(link);
		      });
		    });
		  });
		
		}).call(this);
		
	
	}, '/tests/Helpers.coffee': function(exports, module) {
	
		/** node globals **/
		var require = function(name) {return __r__c__.require(name, '/tests/Helpers.coffee');};
		require.resolve = function(name, parent) {if (parent === null) {parent = '/tests/Helpers.coffee';} return __r__c__.require.resolve(name, parent);};
		require.define = function(bundle) {__r__c__.require.define(bundle);};
		require.cache = __r__c__.require.cache;
		var __filename = '/tests/Helpers.coffee';
		var __dirname = '/tests';
		var process = {cwd: function() {return '/';}, argv: ['node', '/tests/Helpers.coffee'], env: {}};
	
		/** code **/
		(function() {
		  var Helpers;
		
		  Helpers = window.http.Helpers;
		
		  describe('Helpers', function() {
		    describe('#urlencode()', function() {
		      return it('should return encoded strings like in PHP', function() {
		        expect(Helpers.urlencode('Kevin van Zonneveld!')).to.be.equal('Kevin+van+Zonneveld%21');
		        return expect(Helpers.urlencode('http://kevin.vanzonneveld.net/')).to.be.equal('http%3A%2F%2Fkevin.vanzonneveld.net%2F');
		      });
		    });
		    return describe('#buildQuery()', function() {
		      return it('should return prepared params like from http_build_query in PHP', function() {
		        var data, result;
		        data = {
		          foo: 'bar',
		          php: 'hypertext processor',
		          baz: 'boom',
		          cow: 'milk'
		        };
		        result = 'foo=bar&php=hypertext+processor&baz=boom&cow=milk';
		        return expect(Helpers.buildQuery(data)).to.be.equal(result);
		      });
		    });
		  });
		
		}).call(this);
		
	
	}, '/tests/Http.coffee': function(exports, module) {
	
		/** node globals **/
		var require = function(name) {return __r__c__.require(name, '/tests/Http.coffee');};
		require.resolve = function(name, parent) {if (parent === null) {parent = '/tests/Http.coffee';} return __r__c__.require.resolve(name, parent);};
		require.define = function(bundle) {__r__c__.require.define(bundle);};
		require.cache = __r__c__.require.cache;
		var __filename = '/tests/Http.coffee';
		var __dirname = '/tests';
		var process = {cwd: function() {return '/';}, argv: ['node', '/tests/Http.coffee'], env: {}};
	
		/** code **/
		(function() {
		  var Http, Q, Xhr, link;
		
		  Http = window.http.Mocks.Http;
		
		  Xhr = window.http.Xhr;
		
		  Q = window.http._Q;
		
		  Q.stopUnhandledRejectionTracking();
		
		  link = 'http://localhost:3000/';
		
		  describe('Http', function() {
		    afterEach(function() {
		      return Http.restore();
		    });
		    describe('#get()', function() {
		      it('should send request and load its text', function(done) {
		        Http.receive('test');
		        return Http.get(link).then(function(response) {
		          expect(response.data).to.be.equal('test');
		          return done();
		        }).done();
		      });
		      it('should send request and load response as JSON', function(done) {
		        Http.receive('{"message": "text"}', {
		          'content-type': 'application/json'
		        });
		        return Http.get(link).then(function(response) {
		          expect(response.data).to.be.eql({
		            message: 'text'
		          });
		          return done();
		        }).done();
		      });
		      it('should send request with data and load them from response', function(done) {
		        Http.receive('{"first": "first message"}', {
		          'content-type': 'application/json'
		        });
		        Http.once('send', function(response, request) {
		          return expect(request.xhr.url).to.be.equal('http://localhost:3000/?first=first+message');
		        });
		        return Http.get(link, {
		          data: {
		            first: 'first message'
		          }
		        }).then(function(response) {
		          expect(response.data).to.be.eql({
		            first: 'first message'
		          });
		          return done();
		        }).done();
		      });
		      return it('should load json data with prefix', function(done) {
		        Http.receive('while(1); {"message": "prefix"}', {
		          'content-type': 'application/json'
		        });
		        return Http.get(link, {
		          jsonPrefix: 'while(1); '
		        }).then(function(response) {
		          expect(response.data).to.be.eql({
		            message: 'prefix'
		          });
		          return done();
		        }).done();
		      });
		    });
		    describe('#post()', function() {
		      return it('should return an error - cross domain request', function(done) {
		        Http.receiveError(new Error('XMLHttpRequest cannot load http://localhost:3000/. Origin file:// is not allowed by Access-Control-Allow-Origin.'));
		        return Http.post(link).fail(function(err) {
		          expect(err).to.be["instanceof"](Error);
		          expect(err.message).to.be.equal('Can not load http://localhost:3000/ address');
		          return done();
		        }).done();
		      });
		    });
		    return describe('#jsonp()', function() {
		      return it('should send jsonp request', function(done) {
		        var method;
		        method = Xhr.JSONP_METHOD_PREFIX + (Xhr.COUNTER + 1);
		        Http.receive("typeof " + method + " === 'function' && " + method + "({\n\"message\": \"jsonp text\"\n});", {
		          'content-type': 'application/javascript'
		        });
		        return Http.jsonp(link).then(function(response) {
		          expect(response.data).to.be.eql({
		            message: 'jsonp text'
		          });
		          return done();
		        }).done();
		      });
		    });
		  });
		
		}).call(this);
		
	
	}, '/tests/Queue.coffee': function(exports, module) {
	
		/** node globals **/
		var require = function(name) {return __r__c__.require(name, '/tests/Queue.coffee');};
		require.resolve = function(name, parent) {if (parent === null) {parent = '/tests/Queue.coffee';} return __r__c__.require.resolve(name, parent);};
		require.define = function(bundle) {__r__c__.require.define(bundle);};
		require.cache = __r__c__.require.cache;
		var __filename = '/tests/Queue.coffee';
		var __dirname = '/tests';
		var process = {cwd: function() {return '/';}, argv: ['node', '/tests/Queue.coffee'], env: {}};
	
		/** code **/
		(function() {
		  var Http, Q, link;
		
		  Http = window.http.Mocks.Http;
		
		  Q = window.http._Q;
		
		  Q.stopUnhandledRejectionTracking();
		
		  link = function() {
		    return 'http://localhost:3000/';
		  };
		
		  describe('Queue', function() {
		    afterEach(function() {
		      return Http.restore();
		    });
		    it('should send one request', function(done) {
		      Http.receive('test');
		      return Http.get(link()).then(function(response) {
		        expect(response.data).to.be.equal('test');
		        return done();
		      }).done();
		    });
		    return it('should send many requests', function(done) {
		      var buf;
		      buf = {
		        1: false,
		        2: false,
		        3: false,
		        4: false,
		        5: false
		      };
		      Http.on('send', function(response, request) {
		        return buf[request.data.param] = true;
		      });
		      Http.receive('{"param": "1"}', {
		        'content-type': 'application/json'
		      });
		      Http.get(link(), {
		        data: {
		          param: 1
		        }
		      }).then(function(response) {
		        expect({
		          1: true,
		          2: true,
		          3: false,
		          4: false,
		          5: false
		        }).to.be.eql(buf);
		        return expect(response.data).to.be.eql({
		          param: '1'
		        });
		      }).done();
		      Http.receive('{"param": "2"}', {
		        'content-type': 'application/json'
		      });
		      Http.get(link('give-back'), {
		        data: {
		          param: 2
		        }
		      }).then(function(response) {
		        expect({
		          1: true,
		          2: true,
		          3: true,
		          4: false,
		          5: false
		        }).to.be.eql(buf);
		        return expect(response.data).to.be.eql({
		          param: '2'
		        });
		      }).done();
		      Http.receive('{"param": "3"}', {
		        'content-type': 'application/json'
		      });
		      Http.get(link('give-back'), {
		        data: {
		          param: 3
		        }
		      }).then(function(response) {
		        expect({
		          1: true,
		          2: true,
		          3: true,
		          4: true,
		          5: false
		        }).to.be.eql(buf);
		        return expect(response.data).to.be.eql({
		          param: '3'
		        });
		      }).done();
		      Http.receive('{"param": "4"}', {
		        'content-type': 'application/json'
		      });
		      Http.get(link('give-back'), {
		        data: {
		          param: 4
		        }
		      }).then(function(response) {
		        expect({
		          1: true,
		          2: true,
		          3: true,
		          4: true,
		          5: true
		        }).to.be.eql(buf);
		        return expect(response.data).to.be.eql({
		          param: '4'
		        });
		      }).done();
		      Http.receive('{"param": "5"}', {
		        'content-type': 'application/json'
		      });
		      Http.get(link('give-back'), {
		        data: {
		          param: 5
		        }
		      }).then(function(response) {
		        expect({
		          1: true,
		          2: true,
		          3: true,
		          4: true,
		          5: true
		        }).to.be.eql(buf);
		        expect(response.data).to.be.eql({
		          param: '5'
		        });
		        return done();
		      }).done();
		      return expect(Http.queue.requests.length).to.be.equal(4);
		    });
		  });
		
		}).call(this);
		
	
	}, '/package.json': function(exports, module) {
	
		/** node globals **/
		var require = function(name) {return __r__c__.require(name, '/package.json');};
		require.resolve = function(name, parent) {if (parent === null) {parent = '/package.json';} return __r__c__.require.resolve(name, parent);};
		require.define = function(bundle) {__r__c__.require.define(bundle);};
		require.cache = __r__c__.require.cache;
		var __filename = '/package.json';
		var __dirname = '/';
		var process = {cwd: function() {return '/';}, argv: ['node', '/package.json'], env: {}};
	
		/** code **/
		module.exports = (function() {
		return {
			"name": "browser-http"
		}
		}).call(this);
		
	
	}
	});
	
	window.require = __r__c__.require;
	
	/** run section **/
	
	/** /tests/Helpers **/
	__r__c__.require('/tests/Helpers');
	
	/** /tests/Http **/
	__r__c__.require('/tests/Http');
	
	/** /tests/Extensions **/
	__r__c__.require('/tests/Extensions');
	
	/** /tests/Queue **/
	__r__c__.require('/tests/Queue');
}).call(this);