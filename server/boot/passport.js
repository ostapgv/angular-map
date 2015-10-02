'use strict';
var path = require('path');
var crypto = require('crypto');
var assert = require('assert');

var PassportConfigurator = require('loopback-component-passport').PassportConfigurator;
var _ = require('lodash');
var hoops = require('hoops');

_.mixin(hoops);

module.exports = function enableAuthentication(app) {

    var passportConfigurator = new PassportConfigurator(app);

    var config = {};
    try {
        config = require(path.resolve(__dirname + '/../providers.json'));
    } catch(err) {
        console.error('Please configure your passport strategy in `providers.json`.');
        console.error('Copy `providers.json.template` to `providers.json` and replace the clientID/clientSecret values with your own.');
        process.exit(1);
    }
    // Initialize passport
    var passport = passportConfigurator.init(true);

    // Set up related models
    passportConfigurator.setupModels({
        userModel: app.models.User,
        userIdentityModel: app.models.UserIdentity,
        userCredentialModel: app.models.UserCredential
    });

    // Configure passport strategies for third party auth providers
    for(var s in config) {
        var c = config[s];
        c.session = c.session !== false;
        c.json = true;

        //if isSSL is set in config.json (or config.development.json or config.production.json), then tell the provider to hit me back up on https
        var protocol = (app.get('isSSL'))?'https':'http';

        c.callbackURL = c.callbackURL.replace('{{URL}}', protocol + '://' +  app.get('url'));
        c.customCallback = customCallback(s, c);
        c.profileToUser = profileToUser;
        passportConfigurator.configureProvider(s, c);
    }

    function customCallback(strategy, config) {
        return function (req, res, next) {
            passport.authenticate(strategy, _.defaults({ session: config.session }, config.authOptions), function (err, user, info) {
                if (err) {
                    return next(err);
                }
                if (!user) {
                    return res.redirect(config.failureRedirect);
                }
                if (config.session) {
                    req.logIn(user, function (err) {
                        if (err) {
                            return next(err);
                        }
                        if (info && info.accessToken) {
                            if (!!config.json) {
                                return res.json({
                                    id: info.accessToken.id,
                                    userId: user.id
                                });
                            } else {
                                res.cookie('access_token', info.accessToken.id, { signed: req.signedCookies ? true : false,
                                    maxAge: info.accessToken.ttl });
                                res.cookie('userId', user.id.toString(), { signed: req.signedCookies ? true : false,
                                    maxAge: info.accessToken.ttl });
                            }
                        }
                        return res.redirect(config.successRedirect);
                    });
                } else {
                    if (info && info.accessToken) {
                        if (!!config.json) {
                            return res.json({
                                id: info.accessToken.id,
                                userId: user.id
                            });
                        } else {
                            res.cookie('access_token', info.accessToken.id, { signed: req.signedCookies ? true : false,
                                maxAge: info.accessToken.ttl });
                            res.cookie('userId', user.id.toString(), { signed: req.signedCookies ? true : false,
                                maxAge: info.accessToken.ttl });
                        }
                    }
                    return res.redirect(config.successRedirect);
                }
            })(req, res, next);
        };
    }

    /**
     * Generate a key
     * @param {String} hmacKey The hmac key, default to 'loopback'
     * @param {String} algorithm The algorithm, default to 'sha1'
     * @param {String} encoding The string encoding, default to 'hex'
     * @returns {String} The generated key
     */
    function generateKey(hmacKey, algorithm, encoding) {
        assert(hmacKey, 'HMAC key is required');
        algorithm = algorithm || 'sha1';
        encoding = encoding || 'hex';
        var hmac = crypto.createHmac(algorithm, hmacKey);
        var buf = crypto.randomBytes(32);
        hmac.update(buf);
        var key = hmac.digest(encoding);
        return key;
    }

    function profileToUser(provider, profile) {
        // Let's create a user for that
        var email = profile.emails && profile.emails[0] && profile.emails[0].value;
        if (!email) {
            // Fake an e-mail
            email = (profile.username || profile.id) + '@loopback.' +
                  (profile.provider || provider) + '.com';
        }
        var username = provider + '.' + (profile.username || profile.id);
        var password = generateKey('password');
        var userObj = {
            username: username,
            password: password,
            email: email,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName
        };
        return userObj;
    }
};
