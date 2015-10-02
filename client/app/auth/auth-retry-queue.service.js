'use strict';

let queue = [];
let rootScope;
let q;

class AuthRetryQueue {
    constructor($rootScope, $q) {
        'ngInject';
        rootScope = $rootScope;
        q = $q;
    }

    hasMore() {
        return queue.length > 0;
    }

    push(retryItem) {
        queue.push(retryItem);
        rootScope.$broadcast('AuthRetryQueue.itemAdded', retryItem);
    }

    pushRetryFn(reason, retryFn) {
        // The reason parameter is optional
        if (arguments.length === 1) {
            retryFn = reason;
            reason = undefined;
        }
        // The deferred object that will be resolved or rejected by calling retry or cancel
        let deferred = q.defer();
        let retryItem = {
            reason: reason,
            retry: function() {
                // Wrap the result of the retryFn into a promise if it is not already
                q.when(retryFn()).then(function (value) {
                    // If it was successful then resolve our deferred
                    deferred.resolve(value);
                }, function (value) {
                    // Othewise reject it
                    deferred.reject(value);
                });
            },
            cancel: function() {
                // Give up on retrying and reject our deferred
                deferred.reject();
            }
        };
        this.push(retryItem);
        return deferred.promise;
    }

    retryReason() {
        return this.hasMore() && queue[0].reason;
    }

    cancelAll() {
        while(this.hasMore()) {
            queue.shift().cancel();
        }
    }

    retryAll() {
        while(this.hasMore()) {
            queue.shift().retry();
        }
    }
}

angular.module('angularMap.auth').service('AuthRetryQueue', AuthRetryQueue);
export default AuthRetryQueue;
