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
            const principals: UserTreeGridItem[] = grid.getSelectedDataList();
            if (principals.length === 1) {
                if (principals[0].isContentTypes() || principals[0].isContentType()) {
                    new NewPrincipalEvent(principals).fire();
                }
                if (principals[0].isXDatas() || principals[0].isXData()) {
                    new NewPrincipalEvent(principals).fire();
                }
                if (principals[0].isMixins() || principals[0].isMixin()) {
                    new NewPrincipalEvent(principals).fire();
                }
                return;
            }
            new ShowNewPrincipalDialogEvent(principals).fire();
        });
    }
}
