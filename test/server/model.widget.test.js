'use strict';

var path = require('path');
var assert = require('assert');
var supertest = require('supertest');

var app = require('../server/server');
var loopback = app.loopback;

var Widget = app.models.Widget;

describe('Widget Model', function () {
    var ds;

    beforeEach(function () {
        ds = loopback.createDataSource({ connector: 'memory' });
        // Re-attach the models so that they can have isolated store to avoid
        // pollutions from other tests
        Widget.attachTo(ds);
    });

    afterEach(function (done) {
        Widget.destroyAll(done);
    });

    describe('Widget.create', function () {
        it('create a widget', function (done) {
            Widget.create({ name: 'my widget' }, function (err, widget) {
                assert(!err);
                assert(widget.id);
                assert(widget.name);
                done();
            });
        });

        it('fails to create with missing name', function (done) {
            Widget.create({}, function (err) {
                assert(err);
                assert.equal(err.name, 'ValidationError');
                assert.equal(err.statusCode, 422);
                assert.equal(err.details.context, 'Widget');
                assert.deepEqual(err.details.codes.name, [
                  'presence'
                ]);
                done();
            });
        });
    });

    describe('Widgets REST', function () {
        it('should report 200 for /Widgets', function (done) {
            supertest(app)
                .get(path.join(app.get('restApiRoot'), '/Widgets'))
                .expect(200)
                .end(done);
        });
    });
});
