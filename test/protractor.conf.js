'use strict';

exports.config = {
    baseUrl: 'http://localhost:3000',

    framework: 'mocha',

    mochaOpts: {
        reporter: 'landing',
        slow: 3000,
        enableTimeouts: false
    },

    multiCapabilities: [{
        'browserName': 'phantomjs'
    }, {
        'browserName': 'chrome'
    }],

    specs: ['e2e/**/*.js']

};
