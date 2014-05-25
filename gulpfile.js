var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');

gulp.task('compile-source', function() {
	gulp.src('./src/**/*.coffee')
		.pipe(coffee().on('error', gutil.log))
		.pipe(gulp.dest('./lib/'));
});