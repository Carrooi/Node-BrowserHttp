# http-browser

Some simple classes for working with http in browser.

Now it is really simple and more functions will be added.

http-browser uses [q](https://npmjs.org/package/q) promise pattern.

## Usage

```
var http = require('browser-http');

http.request('http://www.google.com', {type: 'GET'}).then(function(response) {
	console.log(response.text);
}, function(e) {
	throw e;		// some error ocured
});
```

In then function, you will get response object with data from server.

## Shorthands

```
var http = require('browser-http');

http.get('http://www.google.com');
http.post('http://www.google.com');
http.put('http://www.google.com');
http.delete('http://www.google.com');
```

## Options

In every http function, you can set other options. Now it is just type and data.

* type: GET, POST, PUT or DELETE
* data: literal object of data which needs to be send to server

## Response object

Basically it is just wrapper for some data from XMLHttpRequest.

* state
* status
* statusText
* data: same like responseText
* xml: same like responseXml

## Load JSON

There is also option to load data and automatically parse it from JSON to literal object.

```
http.getJson('http://www.google.com/some.json').then(function(response) {
	console.log(response.data);		// output will be object
});
```

## Events

You can listen for all http events with your own functions.

```
http.onSend(function(response, request) {
	console.log('In any moment, new http request will be send to server');
});

http.onComplete(function(response, request) {
	console.log('I just finished some request, but there may be some errors');
});

http.onSuccess(function(response, request) {
	console.log('I have got response from server without any error :-)');
});

http.onError(function(err, response, request) {
	console.log('Sorry, there was some error with this response');
});
```

## Extensions

Sometimes it will be better to register whole group of events and this group is called extension.

```
http.addExtension('nameOfMyExtension', {
	send: function(response, request) {},
	complete: function(response, request) {},
	success: function(response, request) {},
	error: function(err, response, request) {},
});
```

You can also remove other extensions.

```
http.removeExtension('nameOfMyExtension');
```