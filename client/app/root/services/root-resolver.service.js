'use strict';

/**
 * @ngdoc service
 * @name  RootResolver
 * @requires $q
 * @description
 * An application wide resolver.
 */

let _$q;

class RootResolver {
    constructor($q) {
        'ngInject';
        _$q = $q;
    }

    getCoreData() {
        var defer = _$q.defer();
        defer.resolve({
            data: 'test'
        });
        
        return defer.promise;
    }
}

angular.module('angularMap.root').service('RootResolver', RootResolver);

