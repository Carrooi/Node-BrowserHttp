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
* text: same like responseText
* xml: same like responseXml