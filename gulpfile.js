var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var browserify = require('gulp-browserify');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('compile-source', function() {
	gulp.src('./src/**/*.coffee')
		.pipe(coffee().on('error', gutil.log))
		.pipe(gulp.dest('./lib/'));
});

gulp.task('compile-tests', function() {
	gulp.src('./test/tests/index.coffee', {read: false})
		.pipe(browserify({
			transform: ['coffeeify'],
			extensions: ['.coffee']
		}))
		.pipe(rename('application.js'))
		.pipe(gulp.dest('./test/'));
});

gulp.task('compile-standalone-develop', function() {
	gulp.src('./src/Build.coffee', {read: false})
		.pipe(browserify({
			transform: ['coffeeify'],
			extensions: ['.coffee']
		}))
		.pipe(rename('http.js'))
		.pipe(gulp.dest('./build/'));
});

gulp.task('compile-standalone-minify', function() {
	gulp.src('./src/Build.coffee', {read: false})
		.pipe(browserify({
			transform: ['coffeeify'],
			extensions: ['.coffee']
		}))
		.pipe(uglify())
		.pipe(rename('http.min.js'))
		.pipe(gulp.dest('./build/'));
});

gulp.task('compile-standalone', ['compile-standalone-develop', 'compile-standalone-minify'], function() {});
gulp.task('compile', ['compile-source', 'compile-standalone', 'compile-tests'], function() {});