'use strict';

var gulp = require('gulp');
var config = require('../project-config');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('lint', ['lint:js', 'lint:json', 'lint:scss']);

gulp.task('lint:js', function() {
    return lintJs(config.dir('client').app().js());
});

gulp.task('lint:tasks', function() {
    return lintJs(config.dir('gulp').js());
});

gulp.task('lint:tests', function() {
    return lintJs(config.dir('test').js());
});

gulp.task('lint:json', function() {
    return gulp.src([config.dir('client').app().json(), config.dir('server').json()])
        .pipe($.jsonlint())
        .pipe($.jsonlint.reporter());
});

gulp.task('lint:scss', function() {
    gulp.src([config.dir('client').styles().scss(), config.not().dir('client').styles().get('vendor.scss')])
        .pipe($.scssLint({
            'config': '.scss-lint.yml'
        }));
});

function lintJs(path) {
    return gulp.src(path)
        .pipe($.jscs())
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'))
        .on('error', function handleError(err) {
            console.error(err.toString());
            this.emit('end');
        })
        .pipe($.size());
}
