'use strict';
var fs = require('fs');
var path = require('path');
var assert = require('assert');

module.exports = function (app, phases) {
    var loopback = app.loopback;
    var env = app.get('env');
    var middlewareDir = path.join(__dirname, '/middleware');

    phases = phases || [
        'initial',
        'session',
        'auth',
        'parse',
        'routes',
        'files',
        'final'
    ];

    phases.forEach(function (phase) {
        var middlewareConfig = {
            before: findConfigFiles(middlewareDir, env, phase + '.before'),
            main: findConfigFiles(middlewareDir, env, phase),
            after: findConfigFiles(middlewareDir, env, phase + '.after')
        };

        if (middlewareConfig.before.length) {
            require(middlewareConfig.before.pop())(app, phase + ':before');
        }

        if (middlewareConfig.main.length) {
            require(middlewareConfig.main.pop())(app, phase);
        }

        if (middlewareConfig.after.length) {
            require(middlewareConfig.after.pop())(app, phase + ':after');
        }
    });

};

function findConfigFiles(middlewareDir, env, name) {
    var candidates = [
        ifExists(name),
        ifExists(name + '.' + env)
    ];
    return candidates.filter(function (c) { return c !== undefined; });

    function ifExists(fileName) {
        var filepath = path.resolve(middlewareDir, fileName + '.js');
        return fs.existsSync(filepath) ? filepath : undefined;
    }
}
