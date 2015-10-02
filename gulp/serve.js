'use strict';

var gulp = require('gulp');
var util = require('util');
var browserSync = require('browser-sync');
// Feel free to drop your proxy below
var middleware = [];


var nodemon = require('gulp-nodemon');


var BROWSER_SYNC_RELOAD_DELAY = 2000;
var _ = require('lodash');
var config = require('../project-config');

var SERVER_OPTIONS = {
    startPath: '/',
    browser: 'default'
};

function browserSyncInit(baseDir, files, options) {
    var routes = null;
    options = options || {};
    options = _.assign(SERVER_OPTIONS, options);

    if (baseDir) {
        if (baseDir === 'client' || (util.isArray(baseDir) && baseDir.indexOf('client') !== -1)) {
            routes = {
                '/bower_components': 'bower_components'
            };
        }
        options = _.assign(options, {
            server: {
                baseDir: baseDir,
                middleware: middleware,
                routes: routes
            }
        });
    }

    browserSync.instance = browserSync.init(files, options);
}



gulp.task('serve', ['serve:loopback']);


gulp.task('serve:static', ['watch'], function() {
    browserSyncInit([
        '.tmp',
        'client'
    ], [
        config.dir('tmp').app().css(),
        config.dir('tmp').app().js(),
        config.dir('client').images(),
        config.dir('tmp').get('*.html'),
        config.dir('tmp').app().html(),
        config.dir('client').get('*.jade'),
        config.dir('client').app().jade(),
    ]);
});

gulp.task('serve:dist', ['build'], function() {
    browserSyncInit('dist/client');
});

gulp.task('serve:e2e-dist', ['build'], function() {
    browserSyncInit('dist', null);
});



gulp.task('serve:e2e', ['html', 'serve:loopback-start']);

gulp.task('serve:loopback-start', function(callback) {
    var called = false;

    return nodemon({
            script: config.dir('server').get('server.js'),
            env: {
                'NODE_ENV': 'local'
            },
            watch: [config.dir('server').js()]
        })
        .on('start', function onStart() {
            util.log('SERVER START');
            if (!called) {
                setTimeout(function reload() {
                    callback();
                }, BROWSER_SYNC_RELOAD_DELAY);
            } else {
                setTimeout(function reload() {
                    browserSync.reload({
                        stream: false
                    });
                }, BROWSER_SYNC_RELOAD_DELAY);
            }
            called = true;
        })
        .on('change', function onStart() {
            util.log('SOMETHING HAS CHANGED');
        })
        .on('restart', function onRestart() {
            util.log('restarted!');
        });
});

gulp.task('serve:loopback', ['watch', 'serve:loopback-start'], function() {
    browserSyncInit(null, config.dir('tmp').all(), {
        proxy: 'http://localhost:' + config.localPort
    });
});


