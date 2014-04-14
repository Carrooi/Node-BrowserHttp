class Loading


	send: (response, request) =>
		document.body.style.cursor = 'progress'


	complete: (response, request) =>
		document.body.style.cursor = 'auto'


module.exports = Loading