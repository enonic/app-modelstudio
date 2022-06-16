import * as Q from 'q';
import {ModelTreeGridItem} from './ModelTreeGridItem';
import {DeleteModelAction} from './action/DeleteModelAction';
import {EditModelAction} from './action/EditModelAction';
import {NewModelAction} from './action/NewModelAction';
import {ModelItemsTreeGrid} from './ModelItemsTreeGrid';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {TreeGridActions} from '@enonic/lib-admin-ui/ui/treegrid/actions/TreeGridActions';
import {ActionState} from './ActionState';
import {ActionStateHelper} from './ActionStateHelper';
import {ModelAction} from './ModelAction';

export class ModelTreeGridActions
    implements TreeGridActions<ModelTreeGridItem> {

    private actions: Map<ModelAction, Action> = new Map<ModelAction, Action>();

    constructor(grid: ModelItemsTreeGrid) {
        this.actions.set(ModelAction.NEW, new NewModelAction(grid));
        this.actions.set(ModelAction.EDIT, new EditModelAction(grid));
        this.actions.set(ModelAction.DELETE, new DeleteModelAction(grid));
        this.actions.get(ModelAction.NEW).setEnabled(true);
    }

    getAllActions(): Action[] {
        return Array.from(this.actions.values());
    }

    updateActionsEnabledState(items: ModelTreeGridItem[]): Q.Promise<void> {
        return Q(true).then(() => {
            this.getActionsState(items).forEach((state: ActionState) => {
                this.actions.get(state.key).setEnabled(state.enabled);
            });
        });
    }

    private getActionsState(items: ModelTreeGridItem[]): ActionState[] {
        if (items.length > 1) {
            return ActionStateHelper.getStateForMultiSelect();
        }

        if (items.length === 0) {
            return ActionStateHelper.getStateNoSelection();
        }

        const item: ModelTreeGridItem = items[0];

        if (item.isComponent() || item.isSchema()) {
            return ActionStateHelper.getStateForComponentAndSchema();
        }

        if (item.isComponentFolder() || item.isSchemaFolder()) {
            return ActionStateHelper.getStateForComponentAndSchemaFolders();
        }

        if (item.isApplication()) {
            return ActionStateHelper.getStateForApplication();
        }

        return [];
    }
}
