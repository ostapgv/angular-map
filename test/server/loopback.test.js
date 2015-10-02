'use strict';

var path = require('path');
var nodemon = require('nodemon');
var loopbackUtil = require('./util/loopback');
var app = loopbackUtil.app;

describe('loopback application', function () {

    describe('server bootstraped', function () {
        loopbackUtil.commonTests();
        loopbackUtil.angularRouteTests();
    });

    describe('server started', function () {
        this.timeout(5000);

        var deploymentUrl = app.get('url').replace(/\/$/, ''); // kill trailing slash
        before(function (done) {
            nodemon({
                script: path.resolve(__dirname, '../../server/server.js'),
                args: ['-env=local'],
                stdout: false
            })
            .once('start', function () {
                // delay as express is not always immediately ready
                setTimeout(function() {
                    done();
                }, 2500);
            });
        });
        after(function () {
            nodemon.emit('quit');
        });
        loopbackUtil.commonTests(deploymentUrl);
        loopbackUtil.angularRouteTests(deploymentUrl);
        if (app.get('isSSL')) {
            loopbackUtil.sslTests(deploymentUrl);
        }
    });

});
