'use strict';

class ErrorController {
    constructor(rejection, $state) {
        'ngInject';
        if (rejection) {
            this.rejection = rejection;
        }
        else {
            $state.go('root.home');
        }
    }
}

angular.module('angularMap.root').controller('ErrorController', ErrorController);
