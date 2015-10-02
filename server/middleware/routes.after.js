'use strict';
// var path = require('path');
var util = require('util');
var ua = require('ua-parser');
var debug = require('debug')('loopback:middleware:edgeplate');

module.exports = function (app, phaseName) {
    var angularRoutes = app.get('angularRoutes') || [];

    //possibly redirect if IE 9 - also get the path
    app.middleware(phaseName, function detection(req, res, next) {
        res.locals._passToAngular = false;
        res.locals._ua = ua.parse(req.headers['user-agent']).ua || {};
        res.locals._ie9 = false;

        if (!isAsset(req.path) && isAngularRoute(req.path)) {
            debug(req.path, 'matched an angular route');
            //possibly return index.html and let Angular handle this route
            res.locals._passToAngular = true;
        }

        if (res.locals._ua.family === 'IE' && res.locals._ua.major === 9) {
            res.locals._ie9 = true;
        }
        next();
    });

    // if you want angular’s default route to not be '/', but something like
    // '/DEFAULT-ROUTE', then use this function. Equivalent to
    // the otherwise() of $routeProvider
    // app.middleware(phaseName, function rootRedirect(req, res, next) {
    //    if(req.path === '/' && !res.locals['_ie9']) {
    //        //if going to '/', redirect to '/DEFAULT-ROUTE'
    //        res.redirect(
    //            302,
    //            util.format(
    //                '%s://%s/DEFAULT-ROUTE',
    //                req.protocol,
    //                req.get('Host')
    //            )
    //        );
    //    }
    //    else {
    //        next();
    //    }
    // });

    // if going to something like '/SOME-ROUTE' and that’s an angular route
    // being handled by a certain HTML file, serve that HTML page
    // (which has the angular app that knows what to do with that route)
    app.middleware(phaseName, function rewritten(req, res, next) {
        if (res.locals._passToAngular) {
            //if it looks like an absolute path for the angular app
            if (res.locals._ie9) {
                //if IE 9, redirect to the # version of this URL
                res.redirect(302, util.format('%s://%s/#%s', req.protocol, req.get('host'), req.path));
            } else {
                req.url = app.get('index');
                next();
            }
        } else {
            next();
        }
    });

    // cache policy - comes after redirects
    // okay to modify headers at this point
    app.middleware(phaseName, function cacheHeaders(req, res, next) {
        if (isAsset(req.url)) {
            res.header('Cache-Control', 'public');
            res.header('Expires', app.get('assetCacheExpirySeconds'));
        } else { //every other route expires immediately
            res.header(
                'Cache-Control',
                'no-cache, no-store, must-revalidate, max-age=0'
            );
            res.header('Pragma', 'no-cache');
            res.header('Expires', 0);
        }
        next();
    });

    function isAsset(url) {
        return /\.(html|js|css|png|jpe?g|gif|ico|eot|svg|ttf|woff)$/.test(url);
    }

    function isAngularRoute(url) {
        var isRoute = false;
        for (var i = 0; i < angularRoutes.length; i++) {
            debug('looking at url + route', url, angularRoutes[i].express);
            if (angularRoutes[i].express &&
                url.match(new RegExp(angularRoutes[i].express.regexp))) {
                debug('url is valid angular route');
                isRoute = true;
                break;
            }
        }
        return isRoute;
    }
};
