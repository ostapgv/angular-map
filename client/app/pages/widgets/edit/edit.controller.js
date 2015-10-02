'use strict';


// @ngInject
class EditController {
    constructor($stateParams, widget, $state) {
        this.id = $stateParams.id;
        this.message = 'Upserting!';
        this.$state = $state;
        this.widget = widget;
    }

    saveWidget() {
        var self = this;
        self.widget.save().then(function(){
            self.$state.transitionTo('root.widgets', null, {'reload':true});
        });
    }

}

export default EditController;
