(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Http, Links;

Http = null;

Links = null;

describe('Extensions.Links', function() {
  beforeEach(function() {
    Http = new http.Mocks.Http;
    Links = new http.Extensions.Links(jQuery);
    return Http.addExtension('links', Links);
  });
  afterEach(function() {
    return Links.detach();
  });
  it('should send request on click', function(done) {
    Http.receive('test', null, null, 5);
    Http.on('success', function(response, request) {
      expect(request.type).to.be.equal('GET');
      expect(response.data).to.be.equal('test');
      return done();
    });
    $('#extensionsLinks a.get').click();
    return expect(Http.queue.requests).to.have.length(0);
  });
  return it('should send request on click with POST', function(done) {
    Http.receive('test', null, null, 5);
    Http.on('success', function(response, request) {
      expect(request.type).to.be.equal('POST');
      expect(response.data).to.be.equal('test');
      return done();
    });
    expect(Http.queue.requests).to.have.length(0);
    $('#extensionsLinks a.post').click();
    return expect(Http.queue.requests).to.have.length(1);
  });
});


},{}],2:[function(require,module,exports){
var Http, link;

Http = null;

link = 'http://localhost:3000/';

describe('Extensions', function() {
  beforeEach(function() {
    return Http = new http.Mocks.Http;
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


},{}],3:[function(require,module,exports){
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


},{}],4:[function(require,module,exports){
var Http, Q, Xhr, link;

Http = null;

Xhr = window.http.Xhr;

Q = window.http._Q;

Q.stopUnhandledRejectionTracking();

link = 'http://localhost:3000/';

describe('Http', function() {
  beforeEach(function() {
    return Http = new http.Mocks.Http;
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
    it('should load json data with prefix', function(done) {
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
    it('should receive data with exact timeout', function(done) {
      var start;
      start = (new Date).getTime();
      Http.receive('test', null, null, 200);
      return Http.get(link).then(function(response) {
        var elapsed;
        elapsed = (new Date).getTime() - start;
        expect(response.data).to.be.equal('test');
        expect(elapsed).to.be.above(199).and.to.be.below(205);
        return done();
      }).done();
    });
    return it('should receive data with random timeout', function(done) {
      var start;
      start = (new Date).getTime();
      Http.receive('test', null, null, {
        min: 100,
        max: 200
      });
      return Http.get(link).then(function(response) {
        var elapsed;
        elapsed = (new Date).getTime() - start;
        expect(response.data).to.be.equal('test');
        expect(elapsed).to.be.above(99).and.to.be.below(205);
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


},{}],5:[function(require,module,exports){
var Http, Q, link;

Http = null;

Q = window.http._Q;

Q.stopUnhandledRejectionTracking();

link = 'http://localhost:3000/';

describe('Queue', function() {
  beforeEach(function() {
    return Http = new http.Mocks.Http;
  });
  it('should send one request', function(done) {
    Http.receive('test');
    return Http.get(link).then(function(response) {
      expect(response.data).to.be.equal('test');
      return done();
    }).done();
  });
  it('should send all GET requests synchronously', function(done) {
    var data, onComplete, start, timeout;
    data = '';
    start = (new Date).getTime();
    timeout = {
      min: 50,
      max: 150
    };
    onComplete = function(error, response) {
      return data += response.data + '';
    };
    Http.on('complete', onComplete);
    Http.queue.once('finish', function() {
      var elapsed;
      Http.removeListener('complete', onComplete);
      elapsed = (new Date).getTime() - start;
      expect(data).to.be.equal('12345');
      expect(elapsed).to.be.above(timeout.min * 5 - 1).and.to.be.below(timeout.max * 5 + 5);
      return done();
    });
    Http.receiveDataFromRequestAndSendBack({
      'content-type': 'application/json'
    }, null, timeout);
    Http.get(link, {
      data: 1,
      parallel: false
    });
    Http.get(link, {
      data: 2,
      parallel: false
    });
    Http.get(link, {
      data: 3,
      parallel: false
    });
    Http.get(link, {
      data: 4,
      parallel: false
    });
    Http.get(link, {
      data: 5,
      parallel: false
    });
    return expect(Http.queue.requests.length).to.be.equal(5);
  });
  it('should send all GET requests assynchronously', function(done) {
    var promises, start, timeout;
    promises = [];
    start = (new Date).getTime();
    timeout = {
      min: 50,
      max: 150
    };
    Http.receiveDataFromRequestAndSendBack({
      'content-type': 'application/json'
    }, null, timeout);
    promises.push(Http.get(link, {
      data: 1
    }));
    promises.push(Http.get(link, {
      data: 2
    }));
    promises.push(Http.get(link, {
      data: 3
    }));
    promises.push(Http.get(link, {
      data: 4
    }));
    expect(Http.queue.requests.length).to.be.equal(0);
    return Q.all(promises).then(function(responses) {
      var data, elapsed, response, _i, _len;
      elapsed = (new Date).getTime() - start;
      data = [];
      for (_i = 0, _len = responses.length; _i < _len; _i++) {
        response = responses[_i];
        data.push(response.data);
      }
      expect(data).to.have.members([1, 2, 3, 4]);
      expect(elapsed).to.be.above(timeout.min - 1).and.to.be.below(timeout.max + 5);
      return done();
    }).done();
  });
  it('should remove all pending requests', function(done) {
    Http.receive(null, null, null, 5);
    Http.post('').then(function() {
      return done();
    });
    Http.post('');
    Http.post('');
    Http.post('');
    expect(Http.queue.requests).to.have.length(4);
    Http.queue.removePending();
    return expect(Http.queue.requests).to.have.length(1);
  });
  return it('should remove all pending requests and abort current request', function() {
    var aborted, request;
    Http.receive(null, null, null, 5);
    Http.post('');
    Http.post('');
    Http.post('');
    Http.post('');
    expect(Http.queue.requests).to.have.length(4);
    aborted = false;
    request = Http.queue.getCurrentRequest();
    request.on('abort', function() {
      return aborted = true;
    });
    Http.queue.stop();
    expect(aborted).to.be["true"];
    return expect(Http.queue.requests).to.have.length(0);
  });
});


},{}],6:[function(require,module,exports){
require('./Helpers');

require('./Http');

require('./Extensions');

require('./Queue');

require('./Extensions.Links');


},{"./Extensions":2,"./Extensions.Links":1,"./Helpers":3,"./Http":4,"./Queue":5}]},{},[6])