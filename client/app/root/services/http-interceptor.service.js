'use strict';

/**
 * @ngdoc factory
 * @name httpInterceptor
 * @requires $q
 * @description
 * Our base interceptor to handle various types of errors.
 */

angular.module('angularMap.root').factory('httpInterceptor', function($q) {
    return {
        /**
         * [responseError description]
         * Handling errors in angular way
         */
        responseError: function(rejection) {
            // $injector.get('$state').go('root.error', {rejection: rejection});
            switch (rejection.status) {
                case 401:
                    console.log('401 catched, try logging in');
            }
            return $q.reject(rejection);
        }
    };
}).config(function($provide, $httpProvider) {
    return $httpProvider.interceptors.push('httpInterceptor');
});
