'use strict';

var path = require('path');
var assert = require('assert');
var supertest = require('supertest');

var app = require('../server/server');
var loopback = app.loopback;

var _ = require('lodash');

var User = app.models.User;

var validUser = {
    username: 'user',
    email: 'test@foobar.com',
    password: 'password',
    firstName: 'first',
    lastName: 'last'
};

var invalidUser = {
    firstName: 'bad',
    lastName: 'user'
};

var blacklistedUser = {};
_.extend(blacklistedUser, validUser, {
    email: 'test@0-mail.com'
});

describe('User Model', function() {
    var ds;

    beforeEach(function() {
        ds = loopback.createDataSource({
            connector: 'memory'
        });
        // Re-attach the models so that they can have isolated store to avoid
        // pollutions from other tests
        User.attachTo(ds);
    });

    afterEach(function(done) {
        User.destroyAll(done);
    });

    describe('User.create', function() {
        it('creates a user', function(done) {
            User.create(validUser, function(err, user) {
                assert(!err);
                assert(user.id);
                ['username', 'email', 'firstName', 'lastName'].forEach(function(field) {
                    assert.equal(user[field], validUser[field], '"' + field + '" field should match stub user value');
                });
                done();
            });
        });

        it('fails to create with incomplete data', function(done) {
            User.create(invalidUser, function(err) {
                assert(err);
                assert.equal(err.name, 'ValidationError');
                assert.equal(err.statusCode, 422);
                assert.equal(err.details.context, 'User');
                // password and email required
                assert(err.details.codes.password);
                assert(err.details.codes.email);
                done();
            });
        });

        it('fails to create with blacklisted email address', function(done) {
            User.create(blacklistedUser, function(err) {
                assert(err);
                assert.equal(err.name, 'ValidationError');
                assert.equal(err.statusCode, 422);
                assert.equal(err.details.context, 'User');
                assert(err.details.codes.email);
                done();
            });
        });
    });

    describe('Users REST', function() {
        it('should report 401 for /Users', function(done) {
            supertest(app)
                .get(path.join(app.get('restApiRoot'), '/Users'))
                .expect(401)
                .end(done);
        });
    });
});
