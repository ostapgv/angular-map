'use strict';

/**
 * @class
 * @name PagesController
 * @description
 * The class from which other pages being extended from.
 * Has initialization time assigned.
 */

class PagesController {
    constructor() {
        var date = new Date();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        this.initializeTime = hours + ':' + minutes + ':' + seconds;
    }
}

export default PagesController;
