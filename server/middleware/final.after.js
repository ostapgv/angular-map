'use strict';
var handler = require('../lib/handler');

module.exports = function (app, phaseName) {
    if (!app.isLocal()) {
        // error logger
        app.middleware(phaseName, handler.logErrors());

        // error in ajax
        app.middleware(phaseName, handler.clientErrorHandler());

        // email me on other errors
        app.middleware(phaseName, handler.emailError());

        // 500 for everything else
        app.middleware(phaseName, handler.displayError());
    }
};
