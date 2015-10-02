'use strict';

var fs = require('fs');
var url = require('url');
var path = require('path');
var assert = require('assert');
var debug = require('debug')('loopback:user');
var request = require('request');
var crypto = require('crypto');
var jade = require('jade');
var _ = require('lodash');
var hoops = require('hoops');

_.mixin(hoops);

var app = require('../../server/server');
var loopback = app.loopback;

var loopbackUser = require('../../node_modules/loopback/common/models/user.js');

module.exports = function(User) {
    var Role = loopback.Role;
    var RoleMapping = loopback.RoleMapping;
    var Email = loopback.Email;
    var AccessToken = loopback.AccessToken;

    // to have $owner role work correctly on custom User model
    // we need to trick this function
    // https://github.com/strongloop/loopback/blob/6276773c0b5792233118a4436826f3354822226d/common/models/role.js#L106-L113
    loopback.User = User;

    // load up the built in User configuration
    loopbackUser(User);

    // start our customization
    User.settings.emailVerificationRequired = true;

    // TODO: Come up with User Status Codes Issue #36
    User.STATUS = {
        ACTIVE: 10,
        DISABLED: 20,
        DELETED: 30
    };

    // Custom validator for email field
    var blacklist = fs.readFileSync(path.resolve(__dirname, '../../server/disposable-email-blacklist.conf')).toString().split('\n');

    blacklist.pop(); //remove last one because it’s a blank entry

    User.validateAsync(
        'email',
        function customValidator(err, done) {
            // instance of the user model
            var user = this;

            if (!user.email) {
                // no email, no bother
                // curious though why the other validators don't fire
                // before this, the assumptions made below seem to be
                // incorrect about the order of execution however, other
                // validators will catch this and throw an error so
                // done usage is ok
                return done();
            }

            // the other validators should fire before this checking the
            // validity of email format this check is limited to a
            // blacklist looking
            var email = user.email;
            var domain = (email.split('@').length > 1)?email.split('@')[1]:null;

            if (!domain) {
                // this really shouldn't happen but we'll send along to
                // the next validator rather than throw an error
                return done();
            }

            var isBlacklisted = false;

            // TODO: make this a binary search
            for(var i = 0; i <= blacklist.length; i++) {
                if (domain === blacklist[i]) {
                    debug('user attempted to create account with blacklisted domain (%s) from static list: %o', domain, user);
                    isBlacklisted = true;
                    break;
                }
            }

            if (isBlacklisted) {
                // found within our static list, no need for API call
                err();
                return done();
            } else {
                //not found in the list, check the API blacklist endpoint
                request.get({
                    url: 'http://apiv1.trashmail-blacklist.org/check/json/' + domain,
                    headers: {
                        //for some reason it wants a UA like this
                        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.9; rv:31.0) Gecko/20100101 Firefox/31.0'
                    }
                }, function (requestErr, response, body) {
                    if (requestErr || (response.statusCode >= 400 && response.statusCode <= 599) || _.isEmpty(body)) {
                        // as much as we'd like to put the brakes on here, we really can't prevent a user from creating
                        // an user do to 3rd party API issues, letting the user continue
                        debug('user attempted to create account, problem with blacklist API check: %o', user);
                        if (requestErr) {
                            debug('blacklist API error: %o', requestErr);
                        } else if (response.statusCode >= 400 && response.statusCode <= 599) {
                            debug('blacklist API response error: %o', response);
                        } else if (_.isEmpty(body)) {
                            debug('blacklist API returned empty body');
                        }
                        return done();
                    } else {
                        if (!_.isObject(body)) { //if not already parsed as JSON should fail
                            try {
                                body = JSON.parse(body);
                            } catch (e) {
                                // again, issue with API response, let's give the user the benefit of the doubt
                                // and let them continue to create their account
                                debug('problem with blacklist API check: %o', user);
                                debug('unable to parse blacklist API body: %s', body);
                                debug('body parse error: %s', e);
                                return done();
                            }
                        }
                        if (_.getIn(body, 'blacklisted') === 1) {
                            debug('user attempted to create account with blacklisted domain (%s) from API call: %o', domain, user);
                            isBlacklisted = true;
                            err();
                        }
                        return done();
                    }
                });
            }
        },
        {
            message: 'email address blacklisted, please contact support',
            code: 'blacklist'
        });

    // Custom instance methods for User Model
    User.prototype.getFullName = function() {
        var user = this;
        return [user.firstName, user.lastName].join(' ');
    };

    User.prototype.isActive = function() {
        var user = this;
        return (User.STATUS.ACTIVE === user.status);
    };

    User.prototype.isDisabled = function() {
        var user = this;
        return (User.STATUS.DISABLED === user.status);
    };

    User.prototype.isDeleted = function() {
        var user = this;
        return (User.STATUS.DELETED === user.status);
    };

    User.prototype.verify = function(options, cb) {
        var user = this;
        var userModel = this.constructor;

        assert(typeof options === 'object', 'options required when calling user.verify()');
        // if we get creative, we can implement the verify type method making the assertions below valid
        // for now, loopback only supports email and that is what we are modeling
        // assert(options.type, 'You must supply a verification type (options.type)');
        // assert(options.type === 'email', 'Unsupported verification type');

        assert(options.to || user.email, 'Must include options.to when calling user.verify() or the user must have an email property');
        // assert(options.from, 'Must include options.from when calling user.verify() or the user must have an email property');

        options.to = options.to || (user.getFullName() + '<' + user.email + '>');
        options.from = options.from || ('no-reply@' + (url.parse('http://' + app.get('url')).hostname));
        // TODO: have subject come from config?
        options.subject = options.subject || 'Welcome to this site!';

        options.user = user;

        if (!options.verifyHref) {
            options.redirect = options.redirect || '/';
            options.protocol = options.protocol || 'http';
            options.host = options.host || (app && app.get('host')) || 'localhost';
            options.port = options.port || (app && app.get('port')) || 3000;
            options.restApiRoot = options.restApiRoot || (app && app.get('restApiRoot')) || '/api';
            options.verifyHref = [
                options.protocol,
                '://',
                options.host,
                ':',
                options.port,
                options.restApiRoot,
                userModel.http.path,
                userModel.sharedClass.find('confirm', true).http.path,
                '?uid=',
                options.user.id,
                '&redirect=',
                options.redirect
            ].join('');
        }

        crypto.randomBytes(64, function (err, buf) {
            if (err) {
                return cb && cb(err);
            } else {
                user.verificationToken = buf.toString('hex');
                user.save(function(err) {
                    if (err) {
                        return cb && cb(err);
                    } else {
                        sendEmail(user);
                    }
                });
            }
        });

        function sendEmail (user) {
            options.verifyHref += '&token=' + user.verificationToken;

            // TODO: check is direcotry and assert
            var templatesDir = path.resolve(__dirname, '../views/emails');
            // TODO: check file exists and assert
            var htmlTemplate = options.htmlTemplate || path.join(templatesDir, 'welcome/html.jade');
            // TODO: check file exists and assert
            var textTemplate = options.textTemplate || path.join(templatesDir, 'welcome/text.jade');

            var jadeOptions = {
                email: user.email,
                name: user.getFullName(),
                verifyLink: options.verifyHref
            };
            var html = jade.renderFile(htmlTemplate, jadeOptions);
            var text = jade.renderFile(textTemplate, jadeOptions);

            Email.send({
                to: options.to,
                from: options.from,
                subject: options.subject,
                text: text,
                html: html
            }, function(err) {
                if (err) {
                    return cb && cb(err);
                } else {
                    return cb && cb(null, {
                        email: user.email,
                        token: user.verificationToken,
                        uid: user.id
                    });
                }
            });
        }
    };

    User.observe('before save', function addId(ctx, next) {
        // ctx.instance means 1, ctx.data means more than 1
        if (ctx.instance) {
            if (!ctx.instance.id) {
                // no id means this is a new insert
                var dateNow = makeDate();
                ctx.instance.created = dateNow;
                ctx.instance.lastUpdated = dateNow;
                // no longer following lead of https://github.com/strongloop/loopback/issues/292
                // for default properties adding them here now
                ctx.instance.emailVerified = ctx.instance.emailVerified || 0;
                ctx.instance.status = ctx.instance.status || User.STATUS.ACTIVE;
                debug('before user created');
                debug(ctx.instance);
            } else {
                ctx.instance.lastUpdated = makeDate();
            }
            next();
        } else {
            next();
        }
    });

    // Remote hooks and custom remote methods
    User.afterRemote('*', function (ctx, user, next) {
        if(ctx.result) {
            if(Array.isArray(ctx.result)) {
                // TODO: Add roles for more than one result?
                next();
            } else {
                // if we are only finding one, add the roles
                // it's most likely from findById
                Role.getRoles({
                    principalType: RoleMapping.USER,
                    principalId: ctx.result.id
                }, function(err, roles) {
                    if (!err && roles.length) {
                        // getRoles will return the role.id, we want the label
                        // https://github.com/strongloop/loopback/issues/632
                        //
                        // strip out anything with a number (presumably we don't have numbers in our role name)
                        // strip out anything starting with a $
                        //
                        var notValid = /(\$[a-z]+|[0-9]+)/i;
                        ctx.result.roles = [];
                        roles.forEach(function (role) {
                            if (!notValid.test(role)) {
                                ctx.result.roles.push(role);
                            }
                        });
                    }
                    next();
                });
            }
        } else {
            next();
        }
    });

    User.afterRemote('create', function (ctx, user, next) {
        var options = {
            // /?action=login&verified=✓
            protocol: (app.get('isSSL'))?'https':'http',
            redirect: '/%3Faction%3Dlogin%26status%3Dverified',
            user: user
        };
        // TODO: Think about how to handle errors
        user.verify(options, function (err, response) {
            if (err) {
                return next(err);
            }
            debug('verification email sent: %o', response);
            // TODO: put something better to be consumed by the front end or just go to next?
            // (default for next() will retrun user instance)
            ctx.res.send({
                title: 'Signed up successfully',
                content: 'Please check your email and click on the verification link before logging in.',
                redirectTo: '/',
                redirectToLinkText: 'Log in'
            });
        });
    });

    User.afterRemote('login', function (ctx, accessToken, next) {
        if (accessToken && accessToken.userId) {
            var userId = accessToken.userId;
            var responseErr;
            User.findById(userId, function (err, user) {
                // TODO: clean this up, figure out how to handle login errors
                if (err) {
                    // it really should never come to this as we were fed the
                    // user id from the access token
                    responseErr = new Error('login failed');
                    responseErr.statusCode = 401;
                    responseErr.code = 'LOGIN_FAILED';
                    next(responseErr);
                } else if (user.isDisabled()) {
                    // if user is disabled do something...
                    debug('diabled user attempted login %o', user);
                    responseErr = new Error('login failed');
                    responseErr.statusCode = 401;
                    responseErr.code = 'LOGIN_FAILED';
                    next(responseErr);
                } else if (user.isDeleted()) {
                    // if user is deleted do something...
                    debug('deleted user attempted login %o', user);
                    responseErr = new Error('login failed');
                    responseErr.statusCode = 401;
                    responseErr.code = 'LOGIN_FAILED';
                    next(responseErr);
                } else if (!user.isActive()) {
                    // if user is not active, disabled or deleted do something...
                    debug('non-active user attempted login %o', user);
                    responseErr = new Error('login failed');
                    responseErr.statusCode = 401;
                    responseErr.code = 'LOGIN_FAILED';
                    next(responseErr);
                } else {
                    // no problems with the user, proceed
                    next();
                }
            });
        } else {
            next();
        }
    });

    User.beforeRemote('deleteById', function (ctx, user, next) {
        var req = ctx.req;
        var res = ctx.res;
        if (req.accessToken) {
            var userInstance = ctx.instance;
            var userId = userInstance && userInstance.id || req.param('id');
            User.checkAccess(
                req.accessToken,
                userId,
                ctx.method,
                ctx,
                function (err, allowed) {
                    if (allowed) {
                        disableAccount(userId);
                    } else {
                        debug('account attempted to be deleted with invalid access token %s: %o', userId, err);
                        // accessToken does not grant user access for deletion of account ID
                        // this will never go through anyway, just let the other registered handlers do their thing
                        next();
                    }
                }
            );
        } else {
            // no access token, no bother, let the other registered handlers do their thing
            next();
        }

        function disableAccount(id) {
            User.findById(id, function (err, user) {
                AccessToken.destroyAll({
                    userid: id
                }, function(err, accessTokens) {
                    if (err) {
                        debug('error deleting user access tokens for user id %s: %o', id, err);
                        res.send(500, { error: err });
                    } else {
                        debug('user access tokens successfully removed for user id %s: %o', id, accessTokens);
                        // update account status to deleted
                        user.status = User.STATUS.DELETED;
                        // update email and username field to a unique value, this allows user to sign up again
                        user.email = Date.now() + '_' + user.email;
                        user.username = Date.now() + '_' + user.username;
                        user.save(function(err, user) {
                            if (err) {
                                debug('error updating user status to deleted for user id %s: %o', id, err);
                                res.send(500, { error: err });
                            } else {
                                debug('user account successfully set to deleted status for user id %s: %o', id, user);
                                res.send({ deleted: true });
                            }
                        });
                    }
                });
            });
        }
    });

    User.on('dataSourceAttached', function () {
        var Widget = loopback.Widget || loopback.getModel('Widget');
        var widgetsMethodName = '__adminFind__widgets';
        User[widgetsMethodName] = function (filter, cb) {
            Widget.find(filter, function (err, widgets) {
                if (err) {
                    cb(err, null);
                }
                cb(null, widgets);
            });
        };

        User.remoteMethod(
            widgetsMethodName,
            {
                description: 'Find all instances of the model matched by filter from the data source',
                accepts: { arg: 'filter', type: 'object', description: 'Filter defining fields, where, orderBy, offset, and limit'},
                returns: { arg: 'widgets', type: 'array', root: true },
                http: { verb: 'get', path: '/widgets' }
            }
        );

    });

    function makeDate() {
        return new Date();
    }

};
