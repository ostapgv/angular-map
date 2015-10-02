'use strict';

var gulp = require('gulp');

gulp.task('watch:tasks', ['wiredep'], function() {
	gulp.start(['browserify-watch', 'injector:css:preprocessor', 'injector:css', 'injector:js', 'consolidate']);	
});

gulp.task('watch', ['watch:tasks'], function() {
    gulp.watch('client/{app,components}/**/*.scss', ['injector:css']);
    gulp.watch('client/assets/styles/**/*.scss', ['injector:css']);
    gulp.watch('client/assets/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
    gulp.watch('client/{app,components}/**/*.jade', ['consolidate:jade']);
});
