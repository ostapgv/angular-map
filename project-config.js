'use strict';

/*
 * Global configuration shared by components and gulp tasks
 */
var _paths = {
    client: 'client/',
    tmp: '.tmp/',
    dist: 'dist/',
    test: 'test/',
    server: 'server/',

    styles: 'assets/styles/',
    app: '{app,components}/',
    e2e: 'e2e/',
    unit: 'unit/',

    images: 'assets/images/**/*',
    jade: '**/*.jade',
    html: '**/*.html',
    css: '**/*.css',
    scss: '**/*.scss',
    js: '**/*.js',
    json: '**/*.json'
}
var global = {

    _not: false,

    _addNot: function(keepPath) {
        var ret = this._not ? '!':'';
        if(!keepPath) {
            this._not = false;
        }
        return ret;
    },

    // starting queue method
    dir : function(dir) {
        dir = _paths[dir] || dir + '/';
        this.path = dir;
        return this;
    },

    not : function() {
        this._not = true;
        return this;
    },

    // middle queue methods
    styles : function() {
        this.path += _paths.styles;
        return this;
    },

    app : function() {
        this.path += _paths.app;
        return this;
    },

    e2e : function() {
        this.path += _paths.e2e;
        return this;
    },

    unit : function() {
        this.path += _paths.unit;
        return this;
    },

    // ending queue methods
    images : function(keepPath) {
        return this.get(_paths.images, keepPath);
    },

    jade : function(keepPath) {
        return this.get(_paths.jade, keepPath);
    },

    html : function(keepPath) {
        return this.get(_paths.html, keepPath);
    },

    css : function(keepPath) {
        return this.get(_paths.css, keepPath);
    },

    scss : function(keepPath) {
        return this.get(_paths.scss, keepPath);
    },

    js : function(keepPath) {
        return this.get(_paths.js, keepPath);
    },

    json : function(keepPath) {
        return this.get(_paths.json, keepPath);
    },

    all : function() {
        return [
            this.css(true),
            this.html(true),
            this.js(true),
            this.images()
        ];
    },

    // main return queue method
    get : function (path, keepPath) {
      var ret = this._addNot(keepPath) + (this.path ? this.path:'') + (path ? path:'');
      if(!keepPath){
        this.path = '';
      }
      return ret;
    }
}

// The path where to mount the REST API app
global.restApiRoot = '/api/v1/';

// local port
global.localPort = process.env.SERVER_PORT || 3000;

module.exports = global;
