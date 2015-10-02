'use strict';

var assert = require('assert');
var request = require('supertest');
var RandExp = require('randexp');
var app = require('./app');

exports.app = app;

exports.commonTests = function (deploymentURL) {
    var appLocation = app;
    if (deploymentURL) {
        appLocation = ((app.get('isSSL'))?'https':'http') + '://' + deploymentURL;
    }

    it('route / loads', function (done) {
        var route = '/';
        request(appLocation)
            .get(route)
            .expect(200)
            .end(done);
    });

    it('should report 404 for invalid route', function (done) {
        request(appLocation)
            .get('/not-found-404-invalid-route')
            .expect(404)
            .expect('Content-Type', /text\/html/)
            .end(done);
    });

    // tests to ensure temporary fix is working for this
    // https://github.com/strongloop/loopback/issues/1124
    //
    // we stop these right away so they don't make it to their middleware
    // this means they don't make it to our error handler, text/plain for now until real error is thrown
    it('should report 404 for disabled legacy explorer route /routes', function (done) {
        var route = app.get('restApiRoot') + '/routes';
        request(appLocation)
            .get(route)
            .expect(404)
            .end(done);
    });

    it('should report 404 for disabled legacy explorer route /models', function (done) {
        var route = app.get('restApiRoot') + '/models';
        request(appLocation)
            .get(route)
            .expect(404)
            .end(done);
    });
};

exports.sslTests = function (deploymentURL) {
    assert(deploymentURL, 'unable to run SSL tests without deploymentURL');

    var appLocation = 'http://' + deploymentURL;
    var secureAppLocation = 'https://' + deploymentURL;

    it('route / redirects non-SSL to SSL', function (done) {
        var route = '/';
        request(appLocation)
            .get(route)
            .expect(301)
            .expect('location', secureAppLocation + route)
            .end(done);
    });

    it('route /account redirects non-SSL to SSL', function (done) {
        var route = '/account';
        request(appLocation)
            .get(route)
            .expect(301)
            .expect('location', secureAppLocation + route)
            .end(done);
    });
};

exports.angularRouteTests = function (deploymentURL) {
    var appLocation = app;
    var angularRoutes = app.get('angularRoutes');
    if (deploymentURL) {
        appLocation = ((app.get('isSSL'))?'https':'http') + '://' + deploymentURL;
    }

    describe('angular routes', function() {
        angularRoutes.forEach(function (route) {
            if (route.express) {
                var randexp = new RandExp(new RegExp(route.express.regexp));
                randexp.defaultRange.subtract(0, 126); // remove the default ASCII character range
                randexp.defaultRange.add(43, 43); // +
                randexp.defaultRange.add(45, 45); // -
                randexp.defaultRange.add(48, 57); // 0-9
                randexp.defaultRange.add(65, 90); // A-Z
                randexp.defaultRange.add(95, 95); // _
                randexp.defaultRange.add(97, 122); // a-z
                randexp.max = 10;
                it('route ' + route.express.url + ' available', function (done) {
                    request(appLocation)
                        .head(randexp.gen())
                        .expect(200)
                        .end(done);
                });
            }
        });
    });
};
