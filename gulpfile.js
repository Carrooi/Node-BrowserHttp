var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var source = require('vinyl-source-stream');

var browserify = require('browserify');
var coffeeify = require('coffeeify');

gulp.task('compile-source', function() {
	return gulp.src('./src/**/*.coffee')
		.pipe(coffee().on('error', gutil.log))
		.pipe(gulp.dest('./lib/'));
});

gulp.task('compile-tests', function() {
	var bundler = browserify({extensions: ['.coffee']})
		.add('./test/tests/index.coffee')
		.transform(coffeeify);

	return bundler.bundle()
		.pipe(source('application.js'))
		.pipe(gulp.dest('./test'));
});

gulp.task('compile-standalone-develop', function() {
	var bundler = browserify({extensions: ['.coffee']})
		.add('./src/Build.coffee')
		.transform(coffeeify);

	return bundler.bundle()
		.pipe(source('http.js'))
		.pipe(gulp.dest('./build'));
});

gulp.task('compile-standalone-minify', ['compile-standalone-develop'], function() {
	return gulp.src('./build/http.js')
		.pipe(uglify())
		.pipe(rename('http.min.js'))
		.pipe(gulp.dest('./build/'));
});

gulp.task('compile-standalone', ['compile-standalone-develop', 'compile-standalone-minify']);
gulp.task('compile', ['compile-source', 'compile-standalone', 'compile-tests']);