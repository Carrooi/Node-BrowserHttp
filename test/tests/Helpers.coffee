
Helpers = window.http.Helpers

describe 'Helpers', ->

	describe '#urlencode()', ->
		it 'should return encoded strings like in PHP', ->
			expect(Helpers.urlencode('Kevin van Zonneveld!')).to.be.equal('Kevin+van+Zonneveld%21')
			expect(Helpers.urlencode('http://kevin.vanzonneveld.net/')).to.be.equal('http%3A%2F%2Fkevin.vanzonneveld.net%2F')

	describe '#buildQuery()', ->
		it 'should return prepared params like from http_build_query in PHP', ->
			data = {foo: 'bar', php: 'hypertext processor', baz: 'boom', cow: 'milk'}
			result = 'foo=bar&php=hypertext+processor&baz=boom&cow=milk'
			expect(Helpers.buildQuery(data)).to.be.equal(result)