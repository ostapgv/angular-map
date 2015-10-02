'use strict';

var fs = require('fs');
var path = require('path');
var assert = require('assert');
var supertest = require('supertest');

var app = require('../server/server');
var loopback = app.loopback;
var env = app.get('env');

describe('application routes', function () {
    describe('api explorer', function () {
        var route = app.get('restApiExplorer') + '/';

        after(function () {
            process.env.NODE_ENV = env;

            // need a fresh server any tests following this
            delete require.cache[require.resolve('../server/server')];
            app = require('../server/server');
            loopback = app.loopback;
        });

        describe('local environment', function () {
            before(function () {
                process.env.NODE_ENV = 'local';

                // need a fresh server for each environment
                delete require.cache[require.resolve('../server/server')];
                app = require('../server/server');
                loopback = app.loopback;
            });
            it('should report 200 for ' + route, function (done) {
                supertest(app)
                    .get(route)
                    .expect('Content-Type', /text\/html/)
                    .expect(200)
                    .end(done);
            });
        });

        describe('development environment', function () {
            before(function () {
                process.env.NODE_ENV = 'development';

                // need a fresh server for each environment
                delete require.cache[require.resolve('../server/server')];
                app = require('../server/server');
                loopback = app.loopback;
            });

            it('should report 404 for ' + route, function (done) {
                supertest(app)
                    .get(route)
                    .expect('Content-Type', /text\/html/)
                    .expect(404)
                    .end(done);
            });
        });

        describe('production environment', function () {
            before(function () {
                process.env.NODE_ENV = 'production';

                // need a fresh server for each environment
                delete require.cache[require.resolve('../server/server')];
                app = require('../server/server');
                loopback = app.loopback;
            });

            it('should report 404 for ' + route, function (done) {
                supertest(app)
                    .get(route)
                    .expect('Content-Type', /text\/html/)
                    .expect(404)
                    .end(done);
            });
        });
    });

    describe('robots.txt', function () {
        var robotsDisallow = fs.readFileSync(path.resolve(__dirname, '../server/views/robots-disallow.txt'), 'utf8');
        var robotsAllow = fs.readFileSync(path.resolve(__dirname, '../server/views/robots-allow.txt'), 'utf8');

        var route = '/robots.txt';

        after(function () {
            app.set('env', env);
        });

        it('should report 200 for /robots.txt', function (done) {
            supertest(app)
                .get(route)
                .expect('Content-Type', /text\/plain/)
                .expect(200)
                .expect(robotsDisallow)
                .end(done);
        });

        describe('local environment', function () {
            before(function () {
                app.set('env', 'local');
            });

            it('GET /robots.txt serves robots-disallow.txt', function (done) {
                supertest(app)
                    .get(route)
                    .expect(200)
                    .expect(robotsDisallow)
                    .end(done);
            });
        });

        describe('development environment', function () {
            before(function () {
                app.set('env', 'development');
            });

            it('GET /robots.txt serves robots-disallow.txt', function (done) {
                supertest(app)
                    .get(route)
                    .expect(200)
                    .expect(robotsDisallow)
                    .end(done);
            });
        });

        describe('production environment', function () {
            before(function () {
                app.set('env', 'production');
            });

            it('GET /robots.txt serves robots-allow.txt', function (done) {
                supertest(app)
                    .get(route)
                    .expect(200)
                    .expect(robotsAllow)
                    .end(done);
            });
        });
    });
});
