'use strict';

var gulp = require('gulp');
var gulpif = require('gulp-if');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var browserSync = require('browser-sync');
var uglify = require('gulp-uglify');

var babelify = require('babelify');


var ngAnnotate = require('browserify-ngannotate');
var _ = require('lodash');
var config = require('../project-config');

gulp.task('browserify', function() {
    bundle(false);
});

gulp.task('browserify-watch', ['lint:js'], function() {
    bundle(true);
});

var defaultOptions = {
    entries: config.dir('./client').get('app/app.js'),
    debug: true
};

var watchifyOptions = _.assign(watchify.args, defaultOptions);

function bundle(watch) {
    var bro;
    if (watch) {
        bro = watchify(browserify(watchifyOptions));
        bro.on('update', function() {
            rebundle(bro);
        });
    } else {
        bro = browserify(defaultOptions);
    }

    bro.on('error', function(e) {
        console.log('Browserify Error', e);
    });

    
    bro.transform(babelify.configure({
        compact: false
    }));
    
    bro.transform(ngAnnotate);
    function rebundle(bundler) {
        return bundler.bundle()
            .pipe(source('app.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest(config.dir('.tmp').get('app')))
            .pipe(gulpif(watch, browserSync.reload({
                stream: true,
                once: true
            })));
    }

    return rebundle(bro);
}
