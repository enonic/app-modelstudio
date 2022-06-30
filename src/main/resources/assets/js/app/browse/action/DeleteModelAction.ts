import {ModelItemsTreeGrid} from '../ModelItemsTreeGrid';
import {ConfirmationDialog} from '@enonic/lib-admin-ui/ui/dialog/ConfirmationDialog';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {BrowseAction} from './BrowseAction';
import {ModelTreeGridItem} from '../ModelTreeGridItem';
import {DeleteApplicationRequest} from '../../../graphql/application/DeleteApplicationRequest';
import {DefaultErrorHandler} from '@enonic/lib-admin-ui/DefaultErrorHandler';
import {DeleteSchemaRequest} from '../../../graphql/schema/DeleteSchemaRequest';
import {SchemaType} from '../../schema/SchemaType';
import {DeleteComponentRequest} from '../../../graphql/schema/DeleteComponentRequest';
import {ComponentType} from '../../schema/ComponentType';

export class DeleteModelAction
    extends BrowseAction {

    constructor(grid: ModelItemsTreeGrid) {
        super(grid, i18n('action.delete'), 'mod+del');
        this.setEnabled(false);
    }

    protected handleExecuted() {
        new ConfirmationDialog()
            .setQuestion(i18n('dialog.delete.question'))
            .setNoCallback(null)
            .setYesCallback(this.deleteSelectedItems.bind(this))
            .open();
    }

    private deleteSelectedItems(): void {
        // just one item is allowed to
        const selectedItem: ModelTreeGridItem = this.grid.getSelectedDataList()[0];

        if (selectedItem?.isApplication()) {
            this.deleteApplication(selectedItem);
        } else if (selectedItem?.isSchema()) {
            this.deleteSchema(selectedItem);
        } else if (selectedItem?.isComponent()) {
            this.deleteComponent(selectedItem);
        }
    }

    private deleteApplication(selectedItem: ModelTreeGridItem): void {
        new DeleteApplicationRequest()
            .setKey(selectedItem.getApplication().getApplicationKey())
            .sendAndParse()
            .catch(DefaultErrorHandler.handle);
    }

    private deleteSchema(selectedItem: ModelTreeGridItem): void {
        new DeleteSchemaRequest()
            .setIds([selectedItem.getSchema().getName()])
            .setType(SchemaType[selectedItem.getSchema().getType().toString()])
            .sendAndParse()
            .catch(DefaultErrorHandler.handle);
    }

    private deleteComponent(selectedItem: ModelTreeGridItem): void {
        new DeleteComponentRequest()
            .setIds([selectedItem.getComponent().getName()])
            .setType(ComponentType[selectedItem.getComponent().getType().toString()])
            .sendAndParse()
            .catch(DefaultErrorHandler.handle);
    }
}
