'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var browserSync = require('browser-sync');
var config = require('../project-config');

// Downloads the selenium webdriver
gulp.task('webdriver-update', $.protractor.webdriver_update); // jshint ignore:line
gulp.task('webdriver-standalone', $.protractor.webdriver_standalone); // jshint ignore:line

function runProtractor(done) {
    var testFiles = [
        config.dir('test').e2e().js()
    ];

    gulp.src(testFiles)
        .pipe($.protractor.protractor({
            configFile: config.dir('test').get('protractor.conf.js'),
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        })
        .on('end', function() {
            // Close browser sync server
            browserSync.exit();
            done();
        });
}

gulp.task('protractor', ['protractor:src']);
gulp.task('protractor:src', ['lint:tests', 'serve:e2e', 'webdriver-update'], runProtractor);
gulp.task('protractor:dist', ['serve:e2e-dist', 'webdriver-update'], runProtractor);
