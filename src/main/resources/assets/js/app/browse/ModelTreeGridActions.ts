import * as Q from 'q';
import {ModelTreeGridItem} from './ModelTreeGridItem';
import {DeleteModelAction} from './action/DeleteModelAction';
import {EditModelAction} from './action/EditModelAction';
import {NewModelAction} from './action/NewModelAction';
import {ModelItemsTreeGrid} from './ModelItemsTreeGrid';
import {Action} from 'lib-admin-ui/ui/Action';
import {TreeGridActions} from 'lib-admin-ui/ui/treegrid/actions/TreeGridActions';

export class ModelTreeGridActions
    implements TreeGridActions<ModelTreeGridItem> {

    public NEW: Action;
    public EDIT: Action;
    public DELETE: Action;

    private actions: Action[] = [];

    constructor(grid: ModelItemsTreeGrid) {
        this.NEW = new NewModelAction(grid);
        this.EDIT = new EditModelAction(grid);
        this.DELETE = new DeleteModelAction(grid);

        this.NEW.setEnabled(true);
        this.actions.push(this.NEW, this.EDIT, this.DELETE);
    }

    getAllActions(): Action[] {
        return this.actions;
    }

    updateActionsEnabledState(items: ModelTreeGridItem[]): Q.Promise<void> {
        return Q(true).then(() => {

            if (items.length > 1) {
                this.NEW.setEnabled(false);
                this.EDIT.setEnabled(false);
                this.DELETE.setEnabled(false);
                return;
            }

            if (items.length === 0) {
                this.NEW.setEnabled(true);
                this.EDIT.setEnabled(false);
                this.DELETE.setEnabled(false);
                return;
            }

            const item = items[0];

            if (item.isComponent() || item.isSchema()) {
                this.NEW.setEnabled(true);
                this.EDIT.setEnabled(true);
                this.DELETE.setEnabled(true);
                return;
            }

            if (item.isApplication()) {
                this.NEW.setEnabled(false);
                this.EDIT.setEnabled(false);
                this.DELETE.setEnabled(true);
            }
        });
    }
}
