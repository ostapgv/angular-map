'use strict';

/**
 * @ngdoc object
 * @name account
 * @description
 *   - account specific module
 */

angular.module('angularMap.pages.account', [])
    .config(function($stateProvider) {
        $stateProvider
            .state('root.account', {
                url: '/account',
                views: {
                    main: {
                        templateUrl: 'app/pages/account/account.main.html',
                        controller: 'AccountController',
                        controllerAs: 'accountCtrl',
                        resolve: {
                            authenticatedUser: function(AuthResolver) {
                                return AuthResolver.requireAuthenticatedUser();
                            },
                            user: function(Users) {
                                return Users.getCurrent();
                            }
                        }
                    }
                }
            });
    });

import './account.controller';
