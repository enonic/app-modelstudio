import {ModelItemsTreeGrid} from '../ModelItemsTreeGrid';
import {Action} from '@enonic/lib-admin-ui/ui/Action';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';

export class DeleteModelAction
    extends Action {

    constructor(grid: ModelItemsTreeGrid) {
        super(i18n('action.delete'), 'mod+del');
        this.setEnabled(false);
        const confirmation = new ConfirmationDialog()
            .setQuestion(i18n('dialog.delete.question'))
            .setNoCallback(null)
            .setYesCallback(() => {
            });

        this.onExecuted(() => {
            const multiple = grid.getSelectedDataList().length > 1;
            const question = multiple ? i18n('dialog.delete.multiple.question') : i18n('dialog.delete.question');
            confirmation.setQuestion(question).open();
        });
    }
}
