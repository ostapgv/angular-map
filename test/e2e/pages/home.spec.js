'use strict';
// jshint expr:true

var helper = require('../spec_helper');
var expect = helper.expect;
var Page = helper.Page;

describe('The main view', function() {
    var page;

    beforeEach(function() {
        page = new Page('/');
    });

    it('should include home page title', function() {
        expect(page.title.getText()).to.eventually.equal('Welcome to Project Boilerplate.');
    });
});
