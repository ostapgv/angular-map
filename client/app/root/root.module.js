'use strict';

/**
 * @ngdoc object
 * @name root
 * @requires $stateProvider
 * @requires $urlRouterProvider
 * @requires $locationProvider 
 * @requires AuthResolverProvider 
 * @description
 *
 * Root module:
 *
 *   - loads all required libraries
 *   - defines root state and resolves User object, UserRoles and other coreData
 *   - sets html5Mode to true (removes the # from the route in the URI)
 *   - handles state events
 *
 */


import '../auth/auth.module.js';


angular.module('angularMap.root', ['restangular', 'ui.router', 'angularMap.auth','ngDialog', 'ngAnimate', 'ngCookies', 'ngTouch', 'ngSanitize'])
    .config(function($stateProvider, $urlRouterProvider, $locationProvider) {
        $stateProvider
            .state('root', {
                abstract: true,
                templateUrl: 'app/root/root.page.html',
                resolve: {
                    
                    User: function($q, Users) {
                        let defer = $q.defer();
                        Users.getCurrentInit().then(
                            function onSuccess(user) {
                                defer.resolve(user);
                            },
                            function onError() {
                                // TODO: maybe check for something response?
                                //
                                // otherwise we'll return a new User Restangular object
                                defer.resolve(Users.new());
                            }
                        );
                        return defer.promise;
                    },
                    UserRoles: function(User) {
                        return User.roles || [];
                    },
                    
                    coreData: function(RootResolver) {
                        return RootResolver.getCoreData();
                    }
                }
            })
            .state('root.error', {
                url: '/error',
                views: {
                    main: {
                        templateUrl: 'app/root/views/error.page.html',
                        controller: 'ErrorController',
                        controllerAs: 'errorCtrl',
                        resolve: {
                            rejection: function($stateParams) {
                                return $stateParams.rejection;
                            }
                        }
                    }
                },
                params: {
                    rejection: null
                }
            });
        $urlRouterProvider.otherwise('/');
        $locationProvider.html5Mode(true);
    })
    .run(function($rootScope, $state) {
        $rootScope.$state = $state;
        $rootScope.$on('$stateChangeError', function() {
            let error = arguments[arguments.length - 1];
            return console.error('$stateChangeError', error);
        });
    });

/**
 * Here we're importing all nececcary files
 */

// Controllers
import '../../components/navbar/navbar.controller';
import './controllers/error.controller';

// Services
import './services/root-resolver.service.js';
import './services/http-interceptor.service.js';

import './services/rest/loopback.service';
import './services/rest/users.service';
import './services/rest/widgets.service';


// Directives

import './directives/login-form/login-form.directive';

