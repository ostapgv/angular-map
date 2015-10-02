'use strict';

var gulp  = require('gulp');
var shell = require('gulp-shell');
var fetchAngularRoutes = require('../server/lib/fetch-angular-routes.js');

gulp.task('routes:builder', fetchAngularRoutes(true));

gulp.task('routes', ['watch:tasks', 'routes:builder'], function routesTask() {
    console.log('finished building routes, closing server...');
    process.exit();
});
