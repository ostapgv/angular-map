'use strict';

/**
 * @class
 * @name  WidgetsController
 * @requires PagesController @class
 * @description
 *
 * Controller for the widgets page:
 * - extended from {@link PagesController}
 * - takes resolved widgets list
 */

import PagesController from '../pages.controller';

class WidgetsController extends PagesController {
    constructor(widgets) {
        'ngInject';
        super();
        this.widgets = widgets;
    }
}

export default WidgetsController;
