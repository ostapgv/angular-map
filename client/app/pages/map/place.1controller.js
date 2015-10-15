'use strict';

import PagesController from '../pages.controller';

class PlaceController extends PagesController {
    constructor() {
        'ngInject';
        super();
        //this.data = data;
    }
}

angular.module('angularMap.pages.place').controller('PlaceController', PlaceController);
  
export default PlaceController;
