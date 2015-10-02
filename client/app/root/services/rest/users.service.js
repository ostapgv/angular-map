'use strict';

/**
 * @ngdoc service
 * @name Users
 * @requires loopback-utility
 * @description
 * Pages module consists of less static pages
 *   - defines states and views for pages
 */

import { addCommonMethods, addCustomMethods } from './loopback-utility';

function Users(Loopback, Auth) {
    'ngInject';
    let usersRoute = 'Users';

    Loopback.extendCollection(usersRoute, function extendCollection(users) {
        addCustomMethods(Loopback, users);
        addCommonMethods(users);

        users.login = function userLogin(credentials, rememberMe=false) {
            let login = users.all('login').withHttpConfig({
                __isLogin: true,
                __ignore401: true
            }).post(credentials);

            login.then(function (response) {
                Auth.rememberMe = rememberMe;
                Auth.setUser(response.id, response.userId, response.plain());
                Auth.save();
            });
            return login;
        };

        users.logout = function userLogout() {
            let logout = users.all('logout').withHttpConfig({ __isLogout: true }).post();
            logout.then(clearUser, clearUser);
            return logout;
            function clearUser() {
                // even if this request fails, we will kill the local stuff
                Auth.clearUser();
                Auth.save();
            }
        };

        users.getCurrent = function getCurrentUser() {
            let getUser = users.withHttpConfig({  __isGetCurrentUser: true }).customGET(Auth.currentUserId);
            // merged but not released yet - https://github.com/strongloop/loopback/pull/1169
            // let getUser = users.one('me').withHttpConfig({ __isGetCurrentUser: true }).get();
            getUser.then(cacheUserData);
            return getUser;
        };

        users.getCurrentInit = function getCurrentUserInit() {
            let getUser = users.withHttpConfig({  __isGetCurrentUser: true, __ignore401: true }).customGET(Auth.currentUserId);
            // merged but not released yet - https://github.com/strongloop/loopback/pull/1169
            // let getUser = users.one('me').withHttpConfig({  __isGetCurrentUser: true, __ignore401: true }).get();
            getUser.then(cacheUserData);
            return getUser;
        };

        users.addRestangularMethod('confirm', 'get', 'confirm');
        users.addRestangularMethod('resetPassword', 'get', 'reset');

        return users;

        function cacheUserData(response) {
            Auth.currentUserData = response.plain();
        }
    });

    return Loopback.all(usersRoute);
}

angular.module('angularMap.root').factory('Users', Users);
export default Users;
