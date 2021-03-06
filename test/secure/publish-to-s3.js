var frauPublisher = require('../../src/publisher'),
	request = require('request'),
	eventStream = require('event-stream'),
	gUtil = require('gulp-util');

var publisher = frauPublisher.app({
	id: 'frau-publisher-test',
	creds: {
		key: 'AKIAJKN55MNZIZXKVCHQ',
		secret: process.env.CREDS_SECRET
	},
	devTag: Math.random().toString(16).slice(2)
});

var content = 'some data';
var filename = 'test.txt';
var file = new gUtil.File({
	cwd: '/',
	base: '/',
	path: '/' + filename,
	contents: new Buffer(content),
	stat: {
		size: content.length
	}
});

describe('publisher', function() {
	it('should publish new file', function(cb) {
		eventStream.readArray( [file] )
			.pipe( publisher.getStream() )
			.on('end', function() {
				// gulp-s3 sends the end event before it's actually done, so we need to introduce an artificial wait.
				setTimeout(function() {
					request.get( publisher.getLocation() + filename, function(error, result, body) {
						if (error) {
							cb(error);
						} else if (result.statusCode != 200 ) {
							cb(result.statusCode);
						} else if ( body !== content ){
							cb(body);
						} else {
							cb();
						}
					});
				}, 500);
			});
	});
});
