'use strict';
var handler = require('../lib/handler');

module.exports = function (app, phaseName) {
    var loopback = app.loopback;

    if (app.isLocal()) {
        // Requests that get this far won't be handled
        // by any middleware. Convert them into a 404 error
        // that will be handled later down the chain.
        app.middleware(phaseName, loopback.urlNotFound());
        // The ultimate error handler.
        app.middleware(phaseName, loopback.errorHandler());

    } else {
        // 404 app.use comes last as it’s the catch all
        app.middleware(phaseName, handler.fourOhFour());
    }
};
