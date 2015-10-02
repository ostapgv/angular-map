'use strict';
var path = require('path');

module.exports = function (app, phaseName) {
    var loopback = app.loopback;

    var restApiRoot = app.get('restApiRoot');
    var restApiExplorer = app.get('restApiExplorer');

    if (app.isLocal()) {
        var explorer;
        try {
            explorer = require('loopback-explorer');
        } catch (err) {
            console.log('Run `npm install loopback-explorer` to enable the LoopBack explorer');
            return;
        }
        var explorerApp = explorer(app, { basePath: restApiRoot });

        app.middleware(phaseName, restApiExplorer, explorerApp);
        app.once('started', function onceStarted() {
            var baseUrl = app.get('url').replace(/\/$/, '');
            console.log(
                'Browse your REST API at %s%s',
                baseUrl,
                restApiExplorer
            );
        });
    }

    // loopback rest api
    app.middleware(phaseName, restApiRoot, loopback.rest());

    // robots.txt
    app.get('/robots.txt', function routerCallback(req, res) {
        var robotsView = [
            'robots-',
            (app.get('env') === 'production') ? 'allow' : 'disallow',
            '.txt'
        ].join('');
        //automatically does text/plain content-type
        res.sendFile(
            path.resolve(__dirname, '../', 'views/', robotsView)
        );
    });
};
