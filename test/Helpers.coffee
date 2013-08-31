should = require 'should'

Helpers = require '../lib/Helpers'

describe 'Helpers', ->

	describe '#urlencode()', ->

		it 'should return encoded strings like in PHP', ->
			Helpers.urlencode('Kevin van Zonneveld!').should.be.equal('Kevin+van+Zonneveld%21')
			Helpers.urlencode('http://kevin.vanzonneveld.net/').should.be.equal('http%3A%2F%2Fkevin.vanzonneveld.net%2F')

	describe '#buildQuery()', ->

		it 'should return prepared params like from http_build_query in PHP', ->
			Helpers.buildQuery(foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk').should.be.equal('foo=bar&php=hypertext+processor&baz=boom&cow=milk')