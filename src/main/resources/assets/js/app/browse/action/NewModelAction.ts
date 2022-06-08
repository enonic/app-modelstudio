import {NewModelEvent} from '../event/NewModelEvent';
import {ModelTreeGridItem} from '../ModelTreeGridItem';
import {ModelItemsTreeGrid} from '../ModelItemsTreeGrid';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {NewApplicationEvent} from '../event/NewApplicationEvent';

export class NewModelAction
    extends Action {

    constructor(grid: ModelItemsTreeGrid) {
        super(i18n('action.new'), 'alt+n');
        this.setEnabled(false);
        this.onExecuted(() => {
            const modelItems: ModelTreeGridItem[] = grid.getSelectedDataList();
            if (modelItems.length === 1) {
                if (modelItems[0].isParts() || modelItems[0].isPart()) {
                    new NewModelEvent(modelItems).fire();
                    return;
                }
                if (modelItems[0].isLayouts() || modelItems[0].isLayout()) {
                    new NewModelEvent(modelItems).fire();
                    return;
                }
                if (modelItems[0].isPages() || modelItems[0].isPage()) {
                    new NewModelEvent(modelItems).fire();
                    return;
                }

                if (modelItems[0].isContentTypes() || modelItems[0].isContentType()) {
                    new NewModelEvent(modelItems).fire();
                    return;
                }
                if (modelItems[0].isXDatas() || modelItems[0].isXData()) {
                    new NewModelEvent(modelItems).fire();
                    return;
                }
                if (modelItems[0].isMixins() || modelItems[0].isMixin()) {
                    new NewModelEvent(modelItems).fire();
                    return;
                }
            } else if(!modelItems || modelItems.length === 0) {
                new NewApplicationEvent().fire();
            }
            // new ShowNewPrincipalDialogEvent(modelItems).fire();
        });
    }
}
