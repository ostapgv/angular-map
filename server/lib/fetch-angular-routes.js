'use strict';
/* global window, document */

var Q = require('q');
var fs = require('fs');
var path = require('path');
var phantom = require('phantom');

process.env.NODE_ENV = 'test';
var app = require('../server');
var server;

module.exports = fetchAngularRoutes;

// intended usage is as a gulp plugin though can be
// imported as module and run anywhere
function fetchAngularRoutes(withServer) {
    return function() {
        var deferred = Q.defer();
        if (withServer) {
            server = app.start();
            app.on('started', function() {
                _phantomTask(deferred);
            });
        } else {
            _phantomTask(deferred);
        }

        return deferred.promise;
    };

    function _phantomTask(deferred) {
        phantom.create(function (ph) {
            ph.createPage(function (page) {
                page.set('onConsoleMessage', function (msg) {
                    console.log('Angular >>> ', msg);
                });
                page.set('onInitialized', function () {
                    page.evaluate(function () {
                        window.name = 'NG_DEFER_BOOTSTRAP!';
                    });
                });
                page.open('http://localhost:3000', function (status) {
                    console.log('Status: ' + status);
                    if (status !== 'success') {
                        deferred.reject(new Error(status));
                    } else {
                        page.evaluate(function () {
                            var routeConfig = [];

                            angular.module('angularMap').run(['$state', '$urlMatcherFactory', function ($state, $urlMatcherFactory) {
                                var routes = {};
                                routeConfig = $state.get();

                                routeConfig.forEach(function (config) {
                                    // !config.name = root state that ui-router creates
                                    // config.url ensures we'll get something we need
                                    if (config.name && config.url) {
                                        routes[config.name] = config.url.split('?').shift();
                                    }
                                });
                                routeConfig.forEach(function (config) {
                                    var configProperties = ['abstract', 'name', 'url', 'express'];
                                    if (config.name && config.url) {
                                        var routePath = [];
                                        var nameSegments = [];
                                        var url;

                                        config.name.split('.').forEach(function (nameSegment) {
                                            nameSegments.push(nameSegment);
                                            routePath.push(routes[nameSegments.join('.')]);
                                        });
                                        url = routePath.join('');
                                        if (url) {
                                            config.express = {
                                                url: url,
                                                regexp: $urlMatcherFactory.compile(url, config).regexp.source
                                            };
                                        }
                                    }
                                    Object.keys(config).forEach(function (key) {
                                        if (configProperties.indexOf(key) === -1) {
                                            delete config[key];
                                        }
                                    });
                                });
                                console.log(JSON.stringify(routeConfig, null, 4));
                            }]);
                            angular.bootstrap(document, ['angularMap']);
                            return routeConfig;
                        }, function (routeConfig) {
                            var angularRoutesPath = path.join(__dirname, '../angular-routes.json');

                            fs.writeFile(angularRoutesPath, JSON.stringify(routeConfig, null, 2) + '\n', function (err) {
                                if (err) {
                                    console.log(err);
                                    deferred.reject(err);
                                } else {
                                    console.log('The file was saved!');
                                    deferred.resolve(routeConfig);
                                }
                                ph.exit();
                                if (server) {
                                    server.close();
                                }
                            });
                        });
                    }
                });
            });
        });
    }
}

// start the server if `$ node server.js`
if (require.main === module) {
    var task = fetchAngularRoutes(false);
    task();
}
