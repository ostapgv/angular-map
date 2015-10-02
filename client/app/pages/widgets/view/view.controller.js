'use strict';

class ViewController {
    constructor($stateParams, widget) {
        'ngInject';
        this.id = $stateParams.id;
        this.message = 'Viewing! ' + widget.name;
    }
}

export default ViewController;
