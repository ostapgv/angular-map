'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'local';

var path = require('path');

var loopback = require('loopback');
var boot = require('loopback-boot');
var middleware = require('./middleware');
var angularRoutes = require('./angular-routes');

var app = module.exports = loopback();

// convenience method to determine if app is booted
// in local environment
app.isLocal = function() {
    // app.get('env') is only set after LB has bootstrapped
    // process.env.NODE_ENV used as fallback if called before
    var env = app.get('env') || process.env.NODE_ENV;
    return 'local' === env;
};

// Disable X-Powered-By response header
app.disable('x-powered-by');

// enable authentication
app.enableAuth();

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname);

//server side jade (for error pages now)
app.set('views', path.resolve(__dirname + '/views'));
app.engine('jade', require('jade').__express);
app.set('view engine', 'jade');

app.set('angularRoutes', angularRoutes);

// setup middleware
middleware(app);

app.start = function() {
    // start the web server
    return app.listen(function() {
        app.emit('started');
        console.log('Web server listening at: %s', app.get('url'));
    });
};

// start the server if `$ node server.js`
if (require.main === module) {
    app.start();
}


