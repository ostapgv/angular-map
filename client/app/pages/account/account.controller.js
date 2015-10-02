'use strict';

import PagesController from '../pages.controller';

/**
 * @class
 * @name  AccountController
 * @requires PagesController @class
 * @description
 *
 * Controller for the account page. Has User in a view model.
 */

class AccountController extends PagesController {
    constructor(user) {
        'ngInject';
        super();
        this.user = user;
    }
}

angular.module('angularMap.pages.account').controller('AccountController', AccountController);
export default AccountController;
