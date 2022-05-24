import {ModelTreeGridActions} from './ModelTreeGridActions';
import {Toolbar} from 'lib-admin-ui/ui/toolbar/Toolbar';

export class ModelBrowseToolbar
    extends Toolbar {

    constructor(actions: ModelTreeGridActions) {
        super();
        this.addClass('user-browse-toolbar');
        this.addActions(actions.getAllActions());
    }
}
