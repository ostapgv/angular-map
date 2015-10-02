'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var wiredep = require('wiredep');
var config = require('../project-config');

gulp.task('test', ['browserify'], function() {
    var bowerDeps = wiredep({
        directory: 'bower_components',
        exclude: ['bootstrap-sass-official'],
        dependencies: true,
        devDependencies: true
    });

    var testFiles = bowerDeps.js.concat([
        config.dir('tmp').get('app/app.js'),
        config.dir('test').unit().get('**/*.spec.js'),
        config.dir('test').unit().get('**/*.mock.js')
    ]);

    return gulp.src(testFiles)
        .pipe($.karma({
            configFile: config.dir('test').get('karma.conf.js'),
            action: 'run'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        });
});
