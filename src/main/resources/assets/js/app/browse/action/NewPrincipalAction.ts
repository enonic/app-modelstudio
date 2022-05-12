import {NewPrincipalEvent} from '../NewPrincipalEvent';
import {UserTreeGridItem} from '../UserTreeGridItem';
import {UserItemsTreeGrid} from '../UserItemsTreeGrid';
import {ShowNewPrincipalDialogEvent} from '../ShowNewPrincipalDialogEvent';
import {Action} from 'lib-admin-ui/ui/Action';
import {i18n} from 'lib-admin-ui/util/Messages';

export class NewPrincipalAction
    extends Action {

    constructor(grid: UserItemsTreeGrid) {
        super(i18n('action.new'), 'alt+n');
        this.setEnabled(false);
        this.onExecuted(() => {
            const modelItems: UserTreeGridItem[] = grid.getSelectedDataList();
            if (modelItems.length === 1) {
                if (modelItems[0].isParts() || modelItems[0].isPart()) {
                    new NewPrincipalEvent(modelItems).fire();
                }
                if (modelItems[0].isLayouts() || modelItems[0].isLayout()) {
                    new NewPrincipalEvent(modelItems).fire();
                }
                if (modelItems[0].isPages() || modelItems[0].isPage()) {
                    new NewPrincipalEvent(modelItems).fire();
                }

                if (modelItems[0].isContentTypes() || modelItems[0].isContentType()) {
                    new NewPrincipalEvent(modelItems).fire();
                }
                if (modelItems[0].isXDatas() || modelItems[0].isXData()) {
                    new NewPrincipalEvent(modelItems).fire();
                }
                if (modelItems[0].isMixins() || modelItems[0].isMixin()) {
                    new NewPrincipalEvent(modelItems).fire();
                }

                return;
            }
            new ShowNewPrincipalDialogEvent(modelItems).fire();
        });
    }
}
