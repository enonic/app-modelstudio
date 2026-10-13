import {Toolbar, ToolbarConfig} from '@enonic/lib-admin-ui/ui/toolbar/Toolbar';

export class ModelBrowseToolbar
    extends Toolbar<ToolbarConfig> {

    constructor() {
        super();
        this.addClass('user-browse-toolbar');
    }
}
