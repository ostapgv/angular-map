'use strict';

describe('about controller', function() {
    var scope;
    var ctrl;

    beforeEach(module('angularMap'));
    beforeEach(inject(function($rootScope, $controller) {
        scope = $rootScope.$new();
        ctrl = $controller('AboutController', {
            $scope: scope
        });
    }));

    it('should define more than 5 awesome things', function() {
        expect(ctrl.awesomeThings.length).to.be.above(5);
    });

});
