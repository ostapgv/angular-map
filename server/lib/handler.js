'use strict';

var app = require('../server');
var loopback = app.loopback;
var debug = require('debug')('loopback:custom:handlers');

var Email = loopback.Email;

// 404 app.use comes last as it’s the catch all
exports.fourOhFour = function fourOhFour () {
    return function fourOhFour (req, res) {
        res.status(404);
        res.render('error404', {title: 'Not Found'});
    };
};

// error logger
exports.logErrors = function logErrors () {
    return function logErrors (err, req, res, next) {
        debug(err.stack);
        next(err);
    };
};

//error in ajax
exports.clientErrorHandler = function clientErrorHandler () {
    return function clientErrorHandler (err, req, res, next) {
        if(req.xhr || req.accepts('application/json')) {
            res.status(500).send({
                xhr: req.xhr,
                accepts: req.accepts('application/json'),
                error: 'Something blew up!'
            });
        } else {
            next(err);
        }
    };
};

//email me on other errors
exports.emailError = function emailError () {
    return function emailError (err, req, res, next) {
        debug('Sending email to report error');
        Email.send({
            to: app.get('email').admin,
            from: app.get('email').admin,
            subject: err.split('\n')[0],
            text: err.stack,
            html: err.stack.replace(/\n/g, '<br>').replace(/  /g, '&nbsp;&nbsp;')
        }, function (err, email) {
            if (err) {
                debug('Error sending email', err);
            } else {
                debug('Email successfully sent', email);
            }
        });
        // push the error through, no need to wait for email
        next(err);
    };
};

exports.displayError = function displayError () {
    return function displayError (err, req, res) {
        res.status(500);
        res.render('error500', {
            title:'500: Internal Server Error',
            error: err
        });
    };
};
