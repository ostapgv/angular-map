'use strict';
// jshint expr:true

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

var Page = function(url) {
    browser.get(url);
};

Page.prototype = Object.create({}, {
    title: {
        get: function() {
            return element(by.tagName('h1'));
        }
    }
});

exports.Page = Page;
exports.expect = chai.expect;
