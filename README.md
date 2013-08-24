# http-browser

Some simple classes for working with http in browser.

Now it is really simple and more functions will be added.

http-browser uses [q](https://npmjs.org/package/q) promise pattern.

## Changelog

Changelog is in the bottom of this readme.

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
* rawData: same like responseText
* data: same like responseText or literal object (json)
* xml: same like responseXML

## Load JSON

If content-type in response header is `application/json` then your data will be automatically transformed into js object.

If you can not set this header on your server, than you can use `*Json` methods.

```
http.getJson('http://www.google.com/some.json').then(function(response) {
	console.log(response.data);		// output will be object
});

http.postJson('http://www.google.com/some.json');
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

### Build in extensions

browser-http already comes with few extensions. Originally they were created for project build on [Nette](http://nette.org/en/)
framework, but can be used on any other project.

#### Loading cursor

```
new (require('browser-http/Extensions/Loading'));
```

Every time new request is send, your cursor is changed into `progress` cursor. After receiving response from server, cursor
is changed into `auto`.

#### Redirect

```
new (require('browser-http/Extensions/Redirect'));
```

If your server sends json data with `redirect` variable, then you will be redirected to address in this variable.

#### Snippets

```
new (require('browser-http/Extensions/Snippets'));
```

If in response data is `snippets` object with html id and content pairs, then browser-http will iterate throw this object,
find element in page with given id and change content of this element into the one from given data.

This extension depends on jquery.

#### Ajax links

```
new (require('browser-http/Extensions/Links'));
```

This is not true extension for browser-http. It listen for all click events on `a` links with class `ajax` but not with
class `not-ajax` and after this click, it creates ajax request.

Depends on jquery.

#### Ajax forms

This is the same like the previous one, but apply for all forms with `ajax` class.
This extension can not handle forms with file uploads.
Depends on jquery.

## Changelog

* 1.6.0
	+ `buildQuery` should got the same output like jQuery.param
	+ Added some extensions

* 1.5.2
	+ Bug with sending data via POST method

* 1.5.1
	+ Bug with X-Requested-With header

* 1.5.0
	+ Added method isHistoryApiSupported

* 1.4.0
	+ Sending X-Requested-With header

* 1.3.1 - 1.3.5
	+ Bugs

* 1.3.0
	+ Added `urlencode` and `buildQuery` methods
	+ Prepared changelog
	+ Added some tests
	+ Some bugs and optimizations
	+ Transforming response data into json if mime type is application/json