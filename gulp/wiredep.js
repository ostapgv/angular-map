'use strict';

var gulp = require('gulp');
var config = require('../project-config');

// inject bower components
gulp.task('wiredep', function() {
    var wiredep = require('wiredep').stream;

    return gulp.src(config.dir('client').get('index.jade'))
        .pipe(wiredep({
            directory: 'bower_components',
            exclude: [/bootstrap-sass-official/, /bootstrap\.css/, /bootstrap\.css/, /foundation\.css/]
        }))
        .pipe(gulp.dest('client'));
});
