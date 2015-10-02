'use strict';

var consolidate = require('gulp-consolidate');
var rename = require('gulp-rename');
var gulp = require('gulp');
var config = require('../project-config');

var engines = [
    ['jade', {
        'pretty': '  '
    }]
];

/**
 * [buildTemplates description]
 * exclude _ prefixed jade files modeling scss convention
 * _ prefixed files are expected to be extended or included
 * and do not need to be compiled
 */

function buildTemplates(engine, src, dest) {
    src = (Array.isArray(src)) ? src : [src];
    src.push(config.not().get('**/_*.jade'));
    return gulp.src(src)
        .pipe(consolidate.apply(this, engine))
        .pipe(rename(function(path) {
            path.extname = '.html';
        }))
        .pipe(gulp.dest(dest));
}

var tasks = [];

for (var i = 0, l = engines.length; i < l; i++) {
    var engine = engines[i];
    gulp.task('consolidate:' + engine[0] + ':index',
        buildTemplates.bind(this, engine, config.dir('client').get('index.jade'), config.dir('tmp').get())); // jshint ignore:line
    gulp.task('consolidate:' + engine[0] + ':app',
        buildTemplates.bind(this, engine, config.dir('client').get('app/**/*.jade'), config.dir('tmp').get('app/'))); // jshint ignore:line
    gulp.task('consolidate:' + engine[0] + ':components',
        buildTemplates.bind(this, engine, config.dir('client').get('components/**/*.jade'), config.dir('tmp').get('components/'))); // jshint ignore:line
    gulp.task('consolidate:' + engine[0], [
        'consolidate:' + engine[0] + ':index',
        'consolidate:' + engine[0] + ':app',
        'consolidate:' + engine[0] + ':components'
    ]);

    tasks.push('consolidate:' + engine[0]);
}

gulp.task('consolidate', tasks);
