'use strict';

class AuthResolverProvider {
    // @ngInject
    requireAdminUser(AuthResolver) {
        return AuthResolver.requireAdminUser();
    }

    // @ngInject
    requireAuthenticatedUser(AuthResolver) {
        return AuthResolver.requireAuthenticatedUser();
    }

    // @ngInject
    authenticateThirdParty(AuthResolver) {
        return AuthResolver.thirdPartyLogin();
    }

    // @ngInject
    $get($q, $http, Auth, Users, AuthRetryQueue) {
        let AuthResolver = {};

        AuthResolver.authenticateThirdParty = function(params) {
            let defer = $q.defer();
            let provider = params.provider;
            let code = params.code;
            let error = params.error;
            let authUrl = '/auth/' + provider + '/callback?code=' + code;
            if (typeof code !== 'undefined') {
                $http.get(authUrl)
                    .success(function(data) {
                        Auth.rememberMe = true;
                        Auth.setUser(data.id, data.userId, null);
                        Auth.save();
                        defer.resolve();
                    })
                    .error(function(data) {
                        console.log('INternal response error', data);
                        defer.reject(data.error);
                    });
            } else if (typeof error !== 'undefined') {
                console.log('ERROR no code and error');
                defer.reject(error);
            }
            return defer.promise;
        };

        AuthResolver.requireAdminUser = function(defer) {
            defer = defer || $q.defer();
            // getCurrent will not return an error callback at this point
            // it is intercepted and added to the retry queue by AuthInterceptor
            Users.getCurrent().then(function onSuccess(userInfo) {
                if (Users.isAdmin()) {
                    defer.resolve(userInfo.plain());
                } else {
                    AuthRetryQueue.pushRetryFn('unauthorized-client', function() {
                        AuthResolver.requireAdminUser(defer);
                    });
                }
            });
            return defer.promise;
        };

        AuthResolver.requireAuthenticatedUser = function(defer) {
            defer = defer || $q.defer();
            // getCurrent will not return an error callback at this point
            // it is intercepted and added to the retry queue by AuthInterceptor
            Users.getCurrent().then(function onSuccess(userInfo) {
                if (Auth.isAuthenticated()) {
                    defer.resolve(userInfo.plain());
                } else {
                    AuthRetryQueue.pushRetryFn('unauthorized-client', function() {
                        AuthResolver.requireAuthenticatedUser(defer);
                    });
                }
            });
            return defer.promise;
        };

        return AuthResolver;
    }
}

angular.module('angularMap.auth').provider('AuthResolver', AuthResolverProvider);
export default AuthResolverProvider;
