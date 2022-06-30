import {EditModelEvent} from '../event/EditModelEvent';
import {ModelItemsTreeGrid} from '../ModelItemsTreeGrid';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {BrowseAction} from './BrowseAction';

export class EditModelAction
    extends BrowseAction {

    constructor(grid: ModelItemsTreeGrid) {
        super(grid, i18n('action.edit'), 'mod+e');
        this.setEnabled(false);
    }

    protected handleExecuted() {
        new EditModelEvent(this.grid.getSelectedDataList()).fire();
    }
}
