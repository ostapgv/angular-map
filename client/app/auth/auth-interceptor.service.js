'use strict';

let _$q;
let _Auth;
let _AuthRetryQueue;
let _$injector;

class AuthInterceptor {
    constructor($q, Auth, AuthRetryQueue, $injector) {
        'ngInject';
        _$q = $q;
        _Auth = Auth;
        _AuthRetryQueue = AuthRetryQueue;
        _$injector = $injector;
    }

    request(config) {
        if (_Auth.accessTokenId) {
            config.headers.authorization = _Auth.accessTokenId;
            if ((config.__isGetCurrentUser && _Auth.currentUserId) || (_Auth.currentUserId && config.url.indexOf('__anonymous__') > -1)) {
                config.url = config.url.replace('__anonymous__', _Auth.currentUserId);
            }
        } else if (config.__isGetCurrentUser) {
            let res = {
                config: config,
                data: { error: { status: 401 } },
                headers: function () { return undefined; },
                status: 401,
                statusText: 'Unauthorized'
            };
            return _$q.reject(res);
        }
        return config || _$q.when(config);
    }

    responseError(response) {
        if (response.status === 401 && !response.config.__ignore401) {
            return _AuthRetryQueue.pushRetryFn('unauthorized-server', () => {
                return _$injector.get('$http')(response.config);
            });
        }
        return _$q.reject(response);
    }
}

angular.module('angularMap.auth').service('AuthInterceptor', AuthInterceptor);
export default AuthInterceptor;

