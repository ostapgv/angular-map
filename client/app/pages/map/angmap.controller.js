'use strict';

import PagesController from '../pages.controller';

class AngularMapController extends PagesController {
    constructor(data) {
        'ngInject';
        super();
        this.data = data;
    }
}

angular.module('angularMap.pages.angmap').controller('AngularMapController', AngularMapController);
  
export default AngularMapController;
