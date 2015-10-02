'use strict';

/**
 * @ngdoc directive
 * @name loginForm
 * @description
 * A form directive which provides login functionality
 */


function loginForm($state, Users, AuthRetryQueue, Auth) {
    'ngInject';
    let directive = {
        restrict: 'E',
        scope: {
            onSuccessLogin: '='
        },
        replace: true,
        templateUrl: 'app/root/directives/login-form/login-form.html',
        link: linkFunc
    };

    return directive;

    function linkFunc(scope) {
        let loginForm = {};
        scope.loginForm = loginForm;

        loginForm.login = function login() {
            loginForm.submitting = true;
            loginForm.authError = null;

            let loginDefer = Users.login({
                username: loginForm.username,
                password: loginForm.password
            }, {
                rememberMe: loginForm.rememberMe
            }).then(function onSuccess() {
                    // there is no reason why they shouldn't be authenticated but
                    // let's check anyway
                    if (Auth.isAuthenticated()) {
                        if (typeof scope.onSuccessLogin === 'function') {
                            scope.onSuccessLogin();
                        }
                    } else {
                        getAuthReason();
                        loginForm.authError = 'Not sure what happened...';
                    }
                    loginForm.password = null;
                    loginForm.submitting = false;
                    redirect($state.current.name, $state.current.params);
                },
                function onError(response) {
                    // getAuthReason();
                    // any 401 will have response data
                    loginForm.authError = (response.data.error) ? response.data.error.message : 'unknown error';
                    // loginForm.password = null;
                    // loginForm.submitting = false;
                });
            return loginDefer.$promise;
        };

        function getAuthReason() {
            // the reason someone may be logging in is because they clicked the login button
            // it may also be because they are trying to get to a page which required authentication
            // or access level greater than what they have
            loginForm.authReason = null;
            if (AuthRetryQueue.hasMore()) {
                loginForm.authReason = (Auth.isAuthenticated()) ? 'You do not have the necessary access permissions.  Do you want to login as someone else?' : 'You must be logged in to access this part of the application.'; // jshint ignore:line
            }
        }
    }

    // Redirect to the given url (defaults to '/')
    function redirect(state, params) {
        state = state || 'root.home';
        params = params || {};
        $state.go(state, params, {
            location: 'replace',
            reload: true
        });
    }
}

angular.module('angularMap.root').directive('loginForm', loginForm);

export default loginForm;

