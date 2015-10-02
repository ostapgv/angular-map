'use strict';

var gulp = require('gulp');
var config = require('../project-config');

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files', 'uglify-save-license', 'del']
});

gulp.task('styles', ['lint:scss', 'wiredep'], function() {
    return gulp.src([config.dir('client').styles().get('app.scss'), config.dir('client').styles().get('vendor.scss')])
        .pipe($.sass({
            style: 'expanded'
        }))
        .on('error', function handleError(err) {
            console.error(err.toString());
            this.emit('end');
        })
        .pipe($.autoprefixer())
        .pipe(gulp.dest(config.dir('tmp').styles().get()));
});

gulp.task('injector:css:preprocessor', function() {
    return gulp.src(config.dir('client').styles().get('app.scss'))
        .pipe($.inject(gulp.src([
            config.dir('client').app().scss(),
            config.not().dir('client').styles().get('app.scss'),
            config.not().dir('client').styles().get('vendor.scss')
        ], {
            read: false
        }), {
            transform: function(filePath) {
                filePath = filePath.replace('client/app/', '../../app/');
                filePath = filePath.replace('client/components/', '../../components/');
                filePath = filePath.replace('.scss', '');
                return '@import \'' + filePath + '\';';
            },
            starttag: '// injector',
            endtag: '// endinjector',
            addRootSlash: false
        }))
        .pipe(gulp.dest(config.dir('client').styles().get()));
});

gulp.task('injector:css', ['styles'], function() {
    return gulp.src(config.dir('client').get('index.jade'))
        .pipe($.inject(gulp.src([
            config.dir('tmp').app().css(),
            config.not().dir('tmp').get('app/vendor.css')
        ], {
            read: false
        }), {
            ignorePath: '.tmp',
            addRootSlash: false
        }))
        .pipe(gulp.dest(config.dir('client').get()));
});

gulp.task('injector:js', ['browserify'], function() {
    return gulp.src([config.dir('client').get('index.jade')])
        .pipe($.inject(gulp.src([
            config.dir('tmp').app().js()
        ]), {
            ignorePath: '.tmp',
            addRootSlash: false
        }))
        .pipe(gulp.dest(config.dir('client').get()));
});

gulp.task('partials', ['consolidate'], function() {
    return gulp.src([config.dir('tmp').app().html()])
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.angularTemplatecache('templateCacheHtml.js', {
            module: 'angularMap'
        }))
        .pipe(gulp.dest(config.dir('tmp').get('inject/')));
});

gulp.task('html', ['injector:css', 'injector:js', 'partials'], function() {
    var htmlFilter = $.filter('*.html');
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');
    var assets;

    return gulp.src([config.dir('tmp').get('index.html')])
        .pipe($.inject(gulp.src(config.dir('tmp').get('inject/templateCacheHtml.js'), {
            read: false
        }), {
            starttag: '<!-- inject:partials-->',
            ignorePath: '.tmp',
            addRootSlash: false
        }))
        .pipe(assets = $.useref.assets())
        .pipe($.rev())
        .pipe(cssFilter)
        .pipe($.replace('bower_components/bootstrap-sass-official/assets/fonts/bootstrap', 'fonts'))
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.revReplace())
        .pipe(htmlFilter)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe(htmlFilter.restore())
        .pipe(gulp.dest(config.dir('dist').get('client')))
        .pipe($.size({
            title: 'dist/',
            showFiles: true
        }));
});

gulp.task('images', function() {
    return gulp.src(config.dir('client').images())
        .pipe($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(config.dir('dist').get('client/assets/images/')));
});

gulp.task('fonts', function() {
    return gulp.src($.mainBowerFiles())
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest(config.dir('dist').get('client/fonts/')));
});

gulp.task('build:asset-scripts', function() {
    return gulp.src(config.dir('client').get('assets/scripts/**/*'))
        .pipe(gulp.dest(config.dir('dist').get('client/assets/scripts/')));
});

gulp.task('build:server', function() {
    return gulp.src(config.dir('server').get('**/*'))
        .pipe(gulp.dest(config.dir('dist').get('server')));
});

gulp.task('build:config', function() {
    return gulp.src([
            config.get('project-config.js'),
            config.get('package.json')
        ])
        .pipe(gulp.dest(config.dir('dist').get()));
})

gulp.task('misc', function() {
    return gulp.src(config.dir('client').get('**/*.ico'))
        .pipe(gulp.dest(config.dir('dist').get('client')));
});

gulp.task('clean', function(done) {
    $.del([config.dir('dist').get(), config.dir('tmp').get()], done);
});

gulp.task('build', ['clean', 'wiredep'], function() {
    gulp.start('lint', 'html', 'images', 'fonts', 'misc', 'build:server', 'build:config', 'build:asset-scripts');
});
