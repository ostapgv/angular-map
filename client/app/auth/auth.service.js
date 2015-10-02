'use strict';

/**
 * @class
 * @name Auth
 * @requires $window
 * @description
 * Helps to store user and it's session
 */

const fields = ['accessTokenId', 'currentUserId'];
let fieldsPrefix = '$WK$';
let localStorage;
let sessionStorage;

class Auth {
    constructor($window) {
        'ngInject';
        localStorage = $window.localStorage;
        sessionStorage = $window.sessionStorage;

        fields.forEach((name) => {
            this[name] = _load(name);
        });
        this.rememberMe = _hasRememberMe();
        this.currentUserData = null;
    }

    save() {
        let storage = this.rememberMe ? localStorage : sessionStorage;
        fields.forEach((name) => {
            _save(storage, name, this[name]);
        });
    }

    setUser(accessTokenId, userId, userData) {
        this.accessTokenId = accessTokenId;
        this.currentUserId = userId;
        this.currentUserData = userData;
    }

    clearUser() {
        this.accessTokenId = null;
        this.currentUserId = null;
        this.currentUserData = null;
    }

    isAuthenticated() {
        return this.accessTokenId && this.currentUserId;
    }

    isAdmin() {
        return this.isAuthenticated() && this.hasRole('admin');
    }

    hasRole(roleName) {
        let userHasRole = false;
        if (this.isAuthenticated() && (this.currentUserData && angular.isArray(this.currentUserData.roles))) {
            this.currentUserData.roles.forEach(function (role) {
                if (role === roleName) {
                    userHasRole = true;
                }
            });
        }
        return userHasRole;
    }
}

angular.module('angularMap.auth').service('Auth', Auth);
export default Auth;


function _save(storage, name, value) {
    let key = fieldsPrefix + name;

    if (value === null || value === undefined) {
        delete storage[key];
    } else {
        storage[key] = value;
    }
}

function _load(name) {
    let key = fieldsPrefix + name;

    return localStorage[key] || sessionStorage[key] || null;
}

function _hasRememberMe() {
    return (localStorage[fieldsPrefix + 'accessTokenId'] !== undefined);
}

