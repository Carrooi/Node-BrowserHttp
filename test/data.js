var express = require('express');
var app = express();

app.enable('jsonp callback');

app.get('/', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
	res.send('test');
});

app.get('/json', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	res.json({message: 'text'});
});

app.get('/jsonp', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	res.jsonp({message: 'jsonp text'});
});

app.get('/give-back', function(req, res) {
	res.header('Access-Control-Allow-Origin', '*');
	res.json(req.query);
});

app.listen(3000);

console.log('Listening on port 3000');