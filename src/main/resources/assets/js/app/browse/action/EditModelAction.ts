import {EditModelEvent} from '../event/EditModelEvent';
import {ModelTreeGridItem} from '../ModelTreeGridItem';
import {ModelItemsTreeGrid} from '../ModelItemsTreeGrid';
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';

export class EditModelAction
    extends Action {

    constructor(grid: ModelItemsTreeGrid) {
        super(i18n('action.edit'), 'mod+e');
        this.setEnabled(false);
        this.onExecuted(() => {
            let principals: ModelTreeGridItem[] = grid.getSelectedDataList();
            new EditModelEvent(principals).fire();
        });
    }
}
