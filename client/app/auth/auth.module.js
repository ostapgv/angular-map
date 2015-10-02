'use strict';

/**
 * @ngdoc object
 * @name auth
 * @requires $stateProvider
 * @requires $httpProvider
 * @description
 *
 * Authentication module:
 *
 *   - registeres authentication-related services, interceptors and providers
 *   - defines user and auth. related states
 */

angular.module('angularMap.auth', [])
    .config(function ($httpProvider, $stateProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');

        $stateProvider
            .state('root.login', {
                url: '/login',
                resolve: {
                    authenticatedUser: function(AuthResolver) {
                        return AuthResolver.requireAuthenticatedUser();
                    }
                }
            })
            .state('root.logout', {
                url: '/logout',
                resolve: {
                    logout: function (Users, $state) {
                        return Users.logout().then(function() {
                            $state.go('root.home', {}, { reload: true });
                        }, function() {
                            $state.go('root.home', {}, { reload: true });
                        });
                    }
                }
            })
            .state('auth', {
                url: '/account/auth/:provider?code&error',
                resolve: {
                    accessToken: function($stateParams, $state, AuthResolver) {
                        return AuthResolver.authenticateThirdParty($stateParams).then(
                            function() {
                                console.log('ACCOUNT');
                                $state.go('root.account', {}, { reload: true });
                            },
                            function (data) {
                                let error = {
                                    status: data.oauthError.statusCode,
                                    statusText: data.message
                                };
                                $state.go('root.error', {rejection: error}, {reload: true });
                            }
                        );
                    }
                }
            });
    })
    .run(function($rootScope, $state, ngDialog) {
        $rootScope.$on('AuthRetryQueue.itemAdded', function () {
            // fire login modal
            let scope = $rootScope.$new();
            let lfModal = ngDialog.open({
                template: 'app/root/directives/login-form/login-modal.html',
                scope: scope
            });
            scope.loginCallback = function() {
                lfModal.close();
            };
        });
    });

import './auth.service';
import './auth-resolver.provider';
import './auth-retry-queue.service';
import './auth-interceptor.service';
