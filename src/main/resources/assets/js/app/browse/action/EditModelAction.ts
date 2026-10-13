import {EditModelEvent} from '../event/EditModelEvent';
import {ModelTreeGridItem} from '../ModelTreeGridItem';
import {SelectableListBoxWrapper} from '@enonic/lib-admin-ui/ui/selector/list/SelectableListBoxWrapper';
import {i18n} from '@enonic/lib-admin-ui/util/Messages';
import {BrowseAction} from './BrowseAction';

export class EditModelAction
    extends BrowseAction {

    constructor(selectionWrapper: SelectableListBoxWrapper<ModelTreeGridItem>) {
        super(selectionWrapper, i18n('action.edit'), 'mod+e');
        this.setEnabled(false);
    }

    protected handleExecuted() {
        new EditModelEvent(this.selectionWrapper.getSelectedItems()).fire();
    }
}
